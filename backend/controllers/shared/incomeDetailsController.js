import db from "../../db.js";

export async function saveIncomeDetails(req, res) {
    try {
        console.log(req.body);
        const {
            employmentType, employerType, grossSalary, netSalary, rentIncome,
            annualBonus, pension, monthlyIncentive, grossITRIncome, netITRIncome,
            gstReturn, existingLoan, existingLoans, userId,
        } = req.body;

        // Verify user exists
        const userResult = await db.query("SELECT id FROM users WHERE id = $1", [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if income details exist
        const checkResult = await db.query("SELECT id FROM income_details WHERE user_id = $1", [userId]);
        console.log(checkResult.rows[0]);
        let incomeDetailId;
        if (checkResult.rows.length > 0) {
            // Update
            const updateQuery = `
                UPDATE income_details 
                SET employment_type = $1, employer_type = $2, gross_salary = $3, net_salary = $4,
                    rent_income = $5, annual_bonus = $6, pension = $7, monthly_incentive = $8,
                    gross_itr_income = $9, net_itr_income = $10, gst_return = $11, existing_loan = $12,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $13
                RETURNING id`;

            const result = await db.query(updateQuery, [
                employmentType, employerType, grossSalary, netSalary, rentIncome,
                annualBonus, pension, monthlyIncentive, grossITRIncome, netITRIncome,
                gstReturn, existingLoan, userId,
            ]);

            incomeDetailId = result.rows[0].id;
        } else {
            // Insert
            const insertQuery = `
                INSERT INTO income_details (
                    user_id, employment_type, employer_type, gross_salary, net_salary,
                    rent_income, annual_bonus, pension, monthly_incentive,
                    gross_itr_income, net_itr_income, gst_return, existing_loan,
                    created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9,
                    $10, $11, $12, $13,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                ) RETURNING id`;

            const result = await db.query(insertQuery, [
                userId, employmentType, employerType, grossSalary, netSalary,
                rentIncome, annualBonus, pension, monthlyIncentive,
                grossITRIncome, netITRIncome, gstReturn, existingLoan,
            ]);

            incomeDetailId = result.rows[0].id;
        }

        // Handle existing loans
        if (existingLoan && existingLoans?.length > 0) {
            await db.query("DELETE FROM existing_loans WHERE income_detail_id = $1", [incomeDetailId]);

            const insertLoanQuery = `
                INSERT INTO existing_loans (
                    income_detail_id, user_id, type, emi_rate, outstanding_amount, balance_tenure,
                    created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )`;

            for (const loan of existingLoans) {
                await db.query(insertLoanQuery, [
                    incomeDetailId, userId, loan.type, loan.emiRate, loan.outstandingAmount, loan.balanceTenure,
                ]);
            }
        }

        return res.status(200).json({ message: "Income details saved successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal server error");
    }
}

export async function getIncomeDetails(req, res) {
    try {
        const { userId } = req.params;

        const userResult = await db.query("SELECT id FROM users WHERE id = $1", [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const detailsQuery = `
            SELECT 
                id, employment_type, employer_type, gross_salary, net_salary, rent_income,
                annual_bonus, pension, monthly_incentive, gross_itr_income, net_itr_income,
                gst_return, existing_loan
            FROM income_details 
            WHERE user_id = $1`;
        const result = await db.query(detailsQuery, [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Income details not found" });
        }

        const incomeDetails = result.rows[0];

        let existingLoans = [];
        if (incomeDetails.existing_loan) {
            const loansResult = await db.query(
                `SELECT type, emi_rate, outstanding_amount, balance_tenure FROM existing_loans WHERE income_detail_id = $1 AND user_id = $2`,
                [incomeDetails.id, userId],
            );
            existingLoans = loansResult.rows;
        }

        return res.status(200).json({
            ...incomeDetails,
            existingLoans,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal server error");
    }
} 