import db from "../../db.js";

export async function getAllLeads(req, res) {
    try {
        // console.log("getAllLeads");
        const { userId } = req.params;
        console.log(req.query   );
        const { status, page = 1, limit = 20, search } = req.query;

        let whereClause = "l.sales_manager_id = $1";
        let queryParams = [userId];
        let paramCount = 1;

        if (status && status !== 'all') {
            whereClause += ` AND l.status = $${++paramCount}`;
            queryParams.push(status);
        }

        if (search) {
            whereClause += ` AND (pd.first_name ILIKE $${++paramCount} OR pd.last_name ILIKE $${++paramCount} OR pd.mobile ILIKE $${++paramCount})`;
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern);
        }

        const offset = (page - 1) * limit;
        
        const countQuery = `
            SELECT COUNT(*) as total
            FROM leads l
            JOIN users u ON l.customer_id = u.id
            LEFT JOIN personal_details pd ON u.id = pd.user_id
            WHERE ${whereClause}
        `;

        const leadsQuery = `
            SELECT 
                l.id,
                l.status,
                l.loan_type,
                l.notes,
                l.created_at,
                l.updated_at,
                pd.first_name,
                pd.last_name,
                pd.mobile,
                pd.email,
                u.id as customer_id
            FROM leads l
            JOIN users u ON l.customer_id = u.id
            LEFT JOIN personal_details pd ON u.id = pd.user_id
            WHERE ${whereClause}
            ORDER BY l.created_at DESC
            LIMIT $${++paramCount} OFFSET $${++paramCount}
        `;

        queryParams.push(limit, offset);

        const [countResult, leadsResult] = await Promise.all([
            db.query(countQuery, queryParams.slice(0, -2)),
            db.query(leadsQuery, queryParams)
        ]);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        const leads = leadsResult.rows.map(row => ({
            id: row.id,
            customerId: row.customer_id,
            customerName: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unknown Customer',
            mobile: row.mobile,
            email: row.email,
            status: row.status,
            loanType: row.loan_type,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));

        return res.status(200).json({
            leads,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateLeadStatus(req, res) {
    try {
        const { leadId } = req.params;
        const { status, notes } = req.body;

        // const validStatuses = ['pending', 'approved', 'rejected', 'under_review'];
        // if (!validStatuses.includes(status)) {
        //     return res.status(400).json({ error: "Invalid status" });
        // }

        const updateQuery = `
            UPDATE leads 
            SET status = $1, 
                notes = COALESCE($2, notes), 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `;

        const result = await db.query(updateQuery, [status, notes, leadId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Lead not found" });
        }

        return res.status(200).json({
            message: "Lead status updated successfully",
            lead: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function createLead(req, res) {
    try {
        const { customerId, loanType, salesManagerId, notes } = req.body;

        // Verify customer exists
        const customerResult = await db.query("SELECT id FROM users WHERE id = $1", [customerId]);
        if (customerResult.rows.length === 0) {
            return res.status(404).json({ error: "Customer not found" });
        }

        // Check if lead already exists
        const existingLead = await db.query(
            "SELECT id FROM leads WHERE customer_id = $1 AND sales_manager_id = $2",
            [customerId, salesManagerId]
        );

        if (existingLead.rows.length > 0) {
            return res.status(400).json({ error: "Lead already exists for this customer" });
        }

        const insertQuery = `
            INSERT INTO leads (customer_id, sales_manager_id, loan_type, status, notes, created_at, updated_at)
            VALUES ($1, $2, $3, 'pending', $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `;

        const result = await db.query(insertQuery, [customerId, salesManagerId, loanType, notes]);

        return res.status(201).json({
            message: "Lead created successfully",
            lead: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
} 