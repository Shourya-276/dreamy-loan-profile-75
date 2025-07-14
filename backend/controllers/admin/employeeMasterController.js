import db from "../../db.js";

export async function createEmployee(req, res) {
    const { employeeName, email, phoneNumber, designation } = req.body;
    const validDesignations = [ "salesmanager", "loancoordinator", "loanadministrator", "connector", "referral", "builder"];
    if (!validDesignations.includes(designation)) {
        return res.status(400).json({ error: "Invalid designation" });
    }
    try {
        const employee = await db.query("INSERT INTO users (name, email, mobile, role, password) VALUES ($1, $2, $3, $4, $5) RETURNING *", [employeeName, email, phoneNumber, designation, "123456"])
        res.status(201).json(employee);
    } catch (error) {
        if (error.code === '23505') {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}