import db from "../../db.js";

// Save quick eligibility check data and basic customer info
export async function quickEligibilityCheck(req, res) {
    try {
        const {
            name,
            middleName,
            lastName,
            email,
            mobile,
            dateOfBirth,
            alternateMobile,
            employmentType,
            employerType,
            grossSalary,
            netSalary,
            grossITRIncome,
            netITRIncome,
            rentIncome,
            annualBonus,
            monthlyIncentive,
            gstReturn,
            existingLoan,
            existingLoans = [],
            salesManagerId,
        } = req.body;
        console.log(req.body);

        if (!salesManagerId) {
            return res.status(400).json({ error: "salesManagerId is required" });
        }

        if (!name || !mobile || !employmentType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // 1. Ensure customer exists (search by mobile)
        let userId;
        const userLookup = await db.query("SELECT id FROM users WHERE mobile = $1 OR email = $2", [mobile, email]);
        if (userLookup.rows.length > 0) {
            userId = userLookup.rows[0].id;
        } else {
            const fullName = [name, middleName, lastName].filter(Boolean).join(" ");
            const newUser = await db.query(
                "INSERT INTO users (name, mobile, email, password, role) VALUES ($1, $2, $3, $4, 'customer') RETURNING id",
                [fullName, mobile, email || null, 'QuickCheck@123']
            );
            userId = newUser.rows[0].id;
        }

        // 2. Upsert income details (simplified, captures only available fields)
        const existingIncome = await db.query("SELECT id FROM income_details WHERE user_id = $1", [userId]);
        const existingLoanBool = existingLoan === 'yes';

        let incomeDetailId;
        if (existingIncome.rows.length > 0) {
            incomeDetailId = existingIncome.rows[0].id;
            await db.query(
                `UPDATE income_details SET 
                    employment_type=$1, employer_type=$2, gross_salary=$3, net_salary=$4, rent_income=$5, annual_bonus=$6, monthly_incentive=$7, gross_itr_income=$8, net_itr_income=$9, gst_return=$10, existing_loan=$11, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $12`,
                [
                    employmentType,
                    employerType || null,
                    grossSalary || null,
                    netSalary || null,
                    rentIncome || null,
                    annualBonus || null,
                    monthlyIncentive || null,
                    grossITRIncome || null,
                    netITRIncome || null,
                    gstReturn || null,
                    existingLoanBool,
                    incomeDetailId,
                ]
            );
        } else {
            const newIncome = await db.query(
                `INSERT INTO income_details (
                    user_id, employment_type, employer_type, gross_salary, net_salary, rent_income, annual_bonus, monthly_incentive, gross_itr_income, net_itr_income, gst_return, existing_loan
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
                [
                    userId,
                    employmentType,
                    employerType || null,
                    grossSalary || null,
                    netSalary || null,
                    rentIncome || null,
                    annualBonus || null,
                    monthlyIncentive || null,
                    grossITRIncome || null,
                    netITRIncome || null,
                    gstReturn || null,
                    existingLoanBool,
                ]
            );
            incomeDetailId = newIncome.rows[0].id;
        }

        // 3. Upsert personal details
        const existingPersonal = await db.query("SELECT id FROM personal_details WHERE user_id = $1", [userId]);
        if (existingPersonal.rows.length > 0) {
            await db.query("UPDATE personal_details SET first_name = $1, middle_name = $2, last_name = $3, email = $4, mobile = $5, date_of_birth = $6 WHERE user_id = $7", [name, middleName, lastName, email, mobile, dateOfBirth, userId]);
        } else {
            await db.query("INSERT INTO personal_details (user_id, first_name, middle_name, last_name, email, mobile, date_of_birth) VALUES ($1, $2, $3, $4, $5, $6, $7)", [userId, name, middleName, lastName, email, mobile, dateOfBirth]);
        }

        // 4. Handle existing loans if provided
        if (existingLoanBool && Array.isArray(existingLoans)) {
            // Clear old loans for this income detail to avoid duplicates
            await db.query("DELETE FROM existing_loans WHERE income_detail_id = $1", [incomeDetailId]);
            for (const loan of existingLoans) {
                await db.query(
                    `INSERT INTO existing_loans (income_detail_id, user_id, type, emi_rate, outstanding_amount, balance_tenure)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        incomeDetailId,
                        userId,
                        loan.type,
                        loan.emiRate,
                        loan.outstandingAmount,
                        loan.balanceTenure,
                    ]
                );
            }
        }

        // 5. Log quick eligibility entry
        await db.query(
            `INSERT INTO quick_eligibility_checks (user_id, sales_manager_id, eligibility_result)
             VALUES ($1, $2, $3)`,
            [userId, salesManagerId, 'eligible']
        );

        // 6. Assign customer to sales manager
        await db.query(
            `INSERT INTO leads (customer_id, sales_manager_id) VALUES ($1, $2)`,
            [userId, salesManagerId]
        );

        return res.status(201).json({ message: "Eligibility data saved successfully", userId });
    } catch (error) {
        console.error("Error saving eligibility data:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Business status rules:
// eligible  -> quick_check result = 'eligible' AND loan_requests entry exists
// pending   -> quick_check entry exists, result='eligible', but NO loan_requests entry
// rejected  -> quick_check.eligibility_result <> 'eligible'

export async function getEligibilityHistory(req, res) {
    try {
        const { salesManagerId } = req.params;
        // console.log(salesManagerId);

        const query = `
            WITH latest_qec AS (
                SELECT DISTINCT ON (user_id) id, user_id, sales_manager_id, eligibility_result, created_at
                FROM quick_eligibility_checks
                WHERE sales_manager_id = $1
                ORDER BY user_id, created_at DESC
            )
            SELECT 
                l.id AS lead_id,
                u.id   AS user_id,
                u.name AS customer_name,
                u.email AS customer_email,
                CASE 
                     WHEN qec.eligibility_result <> 'eligible' THEN 'rejected'
                     WHEN lr.user_id IS NOT NULL THEN 'eligible'
                     ELSE 'pending'
                 END AS eligibility_status,
                 COALESCE(MAX(ls.max_amount),0) AS max_loan
             FROM latest_qec qec
             JOIN users u ON u.id = qec.user_id
             LEFT JOIN leads l ON l.customer_id = qec.user_id AND l.sales_manager_id = $1
             LEFT JOIN loan_requests lr ON lr.user_id = qec.user_id
             LEFT JOIN lfi_sanctions ls ON ls.user_id = qec.user_id AND ls.status = 'active'
             GROUP BY l.id, u.id, u.name, u.email,
                 CASE 
                     WHEN qec.eligibility_result <> 'eligible' THEN 'rejected'
                     WHEN lr.user_id IS NOT NULL THEN 'eligible'
                     ELSE 'pending'
                 END
             ORDER BY MAX(qec.created_at) DESC;`;

        const result = await db.query(query, [salesManagerId]);
        // console.log(result.rows);
        // Format response numbers for ease on FE
        const formatted = result.rows.map(r => ({
            lead_id: r.lead_id,
            customer_id: r.user_id,
            customer_name: r.customer_name,
            customer_email: r.customer_email,
            status: r.eligibility_status,
            max_loan: Number(r.max_loan)
        }));
        // console.log(formatted);
        return res.status(200).json(formatted);
    } catch (error) {
        console.error("Error fetching eligibility history:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
} 