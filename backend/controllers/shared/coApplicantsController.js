import db from "../../db.js";

// Helper function to populate leads without sending response
async function populateLeadsForUser(userId, salesManagerId) {
    try {
        console.log(`Populating leads for user ${userId}...`);
        
        // Get sales managers
        const salesManagersResult = await db.query(`
            SELECT id, name, email 
            FROM users 
            WHERE role = 'salesmanager'
            ORDER BY id
        `);
        const salesManagers = salesManagersResult.rows;
        
        if (salesManagers.length === 0) {
            console.log("No sales managers found");
            return;
        }

        // Check if lead already exists
        const existingLeadResult = await db.query(
            "SELECT id FROM leads WHERE customer_id = $1",
            [userId]
        );

        if (existingLeadResult.rows.length > 0) {
            console.log(`Lead already exists for user ${userId}`);
            return;
        }

        // Round-robin assignment (simple approach - assign to first available)
        const assignedSalesManager = salesManagerId || salesManagers[0];

        // Get loan type
        const loanTypeResult = await db.query(
            "SELECT loan_type FROM loan_requests WHERE user_id = $1 LIMIT 1",
            [userId]
        );
        const loanType = loanTypeResult.rows[0]?.loan_type || 'home_loan';

        // Insert lead
        await db.query(`
            INSERT INTO leads (customer_id, sales_manager_id, loan_type, status, notes)
            VALUES ($1, $2, $3, 'pending', 'Auto-assigned from co-applicant form')
        `, [userId, assignedSalesManager.id, loanType]);

        console.log(`Created lead for user ${userId} assigned to ${assignedSalesManager.name}`);
    } catch (error) {
        console.error("Error populating leads:", error);
    }
}

// Helper function to calculate and save loan offers without sending response
async function calculateAndSaveLoanOffers(userId) {
    try {
        console.log(`Calculating loan offers for user ${userId}...`);
        
        // Import the controller function
        const { getLoanOffers } = await import("./loanOffersController.js");
        
        // Create mock request and response objects
        const mockReq = {
            body: { userId },
            params: { userId }
        };
        
        const mockRes = {
            status: () => mockRes,
            json: (data) => {
                console.log(`Loan offers calculated and saved for user ${userId}`);
                return data;
            }
        };
        
        await getLoanOffers(mockReq, mockRes);
    } catch (error) {
        console.error("Error calculating loan offers:", error);
    }
}

export async function saveCoApplicants(req, res) {
    const client = db;
    try {
        const { userId, loanType, coApplicants = [], salesManagerId } = req.body;
        console.log(req.body);
        console.log(req.body.coApplicants);
        
        await client.query("BEGIN");

        await client.query(
            `
            INSERT INTO loan_requests (user_id, loan_type)
            VALUES ($1,$2)
            ON CONFLICT (user_id)
            DO UPDATE SET loan_type = EXCLUDED.loan_type, updated_at = CURRENT_TIMESTAMP
            `,
            [userId, loanType],
        );

        await client.query("DELETE FROM co_applicants WHERE user_id = $1", [userId]);

        for (const ca of coApplicants) {
            const { personalDetails: pd, incomeDetails: inc } = ca;

            const coAppRes = await client.query(
                `
                INSERT INTO co_applicants (user_id, first_name, middle_name, last_name, email,
                    mobile, aadhaar_number, pan_card_number, gender, marital_status,
                    relationship_to_applicant, date_of_birth, street_address, pin_code,
                    country, state, district, city)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                        $11,$12,$13,$14,$15,$16,$17,$18)
                RETURNING id
                `,
                [
                    userId,
                    pd.firstName,
                    pd.middleName,
                    pd.lastName,
                    pd.email,
                    pd.mobile,
                    pd.aadhaarNumber,
                    pd.panCardNumber,
                    pd.gender,
                    pd.maritalStatus,
                    pd.relationshipToApplicant,
                    pd.dateOfBirth,
                    pd.streetAddress,
                    pd.pinCode,
                    pd.country,
                    pd.state,
                    pd.district,
                    pd.city,
                ],
            );

            const coAppId = coAppRes.rows[0].id;

            const incomeRes = await client.query(
                `
                INSERT INTO co_applicant_income_details (
                    co_applicant_id, employment_type, employer_type, gross_salary,
                    net_salary, rent_income, pension, existing_loan)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                RETURNING id
                `,
                [
                    coAppId,
                    inc.employmentType,
                    inc.employerType,
                    inc.grossSalary,
                    inc.netSalary,
                    inc.rentIncome,
                    inc.pension,
                    inc.existingLoan === "yes",
                ],
            );

            const incomeId = incomeRes.rows[0].id;

            if (inc.existingLoan === "yes" && Array.isArray(inc.existingLoans)) {
                for (const loan of inc.existingLoans) {
                    await client.query(
                        `
                        INSERT INTO co_applicant_existing_loans (
                            co_applicant_id, co_applicant_income_id, type,
                            emi_rate, outstanding_amount, balance_tenure)
                        VALUES ($1,$2,$3,$4,$5,$6)
                        `,
                        [
                            coAppId,
                            incomeId,
                            loan.type,
                            loan.emiRate,
                            loan.outstandingAmount,
                            loan.balanceTenure,
                        ],
                    );
                }
            }
        }

        await client.query("COMMIT");
        
        // After successful save, populate leads and calculate loan offers
        // These run asynchronously and don't affect the response
        setImmediate(async () => {
            await populateLeadsForUser(userId, salesManagerId);
            await calculateAndSaveLoanOffers(userId);
        });
        
        return res.status(200).json({ message: "Saved successfully", userId });
    } catch (err) {
        await client.query("ROLLBACK");
        console.log("here");
        console.error(err);
        return res.status(500).send("Failed to save co-applicants");
    }
}

// GET /co-applicants/:userId - fetch co-applicant details for a user
export async function getCoApplicants(req, res) {
    const userId = req.params.userId;
    try {
        // Fetch co-applicants
        const coAppRows = (await db.query(
            `SELECT * FROM co_applicants WHERE user_id = $1`,
            [userId]
        )).rows;
        if (!coAppRows.length) return res.json([]);

        // For each co-applicant, fetch income details and existing loans
        const coApplicants = await Promise.all(coAppRows.map(async (ca) => {
            const income = (await db.query(
                `SELECT * FROM co_applicant_income_details WHERE co_applicant_id = $1`,
                [ca.id]
            )).rows[0];
            let existingLoans = [];
            if (income) {
                existingLoans = (await db.query(
                    `SELECT * FROM co_applicant_existing_loans WHERE co_applicant_id = $1 AND co_applicant_income_id = $2`,
                    [ca.id, income.id]
                )).rows;
            }
            return {
                personalDetails: {
                    firstName: ca.first_name,
                    middleName: ca.middle_name,
                    lastName: ca.last_name,
                    email: ca.email,
                    mobile: ca.mobile,
                    aadhaarNumber: ca.aadhaar_number,
                    panCardNumber: ca.pan_card_number,
                    gender: ca.gender,
                    maritalStatus: ca.marital_status,
                    relationshipToApplicant: ca.relationship_to_applicant,
                    dateOfBirth: ca.date_of_birth,
                    streetAddress: ca.street_address,
                    pinCode: ca.pin_code,
                    country: ca.country,
                    state: ca.state,
                    district: ca.district,
                    city: ca.city,
                },
                incomeDetails: income ? {
                    employmentType: income.employment_type,
                    employerType: income.employer_type,
                    grossSalary: income.gross_salary,
                    netSalary: income.net_salary,
                    rentIncome: income.rent_income,
                    pension: income.pension,
                    existingLoan: income.existing_loan ? "yes" : "no",
                    existingLoans: existingLoans.map(l => ({
                        type: l.type,
                        emiRate: l.emi_rate,
                        outstandingAmount: l.outstanding_amount,
                        balanceTenure: l.balance_tenure
                    }))
                } : null
            };
        }));
        return res.json(coApplicants);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Failed to fetch co-applicants");
    }
}