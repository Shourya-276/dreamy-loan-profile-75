import db from "../../db.js";

export async function getDashboardMetrics(req, res) {
    try {
        console.log("getDashboardMetrics");
        const { userId } = req.params;
        
        // Fetch dashboard metrics for sales manager
        const metricsQuery = `
            WITH lead_stats AS (
                SELECT 
                    COUNT(*) as total_leads,
                    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_leads,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_leads,
                    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_leads
                FROM leads 
                WHERE sales_manager_id = $1
            ),
            sanction_stats AS (
                SELECT 
                    COUNT(*) as total_sanctions,
                    COALESCE(SUM(sanctioned_amount), 0) as total_sanctioned_amount
                FROM bank_sanctions bs
                JOIN leads l ON bs.lead_id = l.id
                WHERE l.sales_manager_id = $1
            ),
            disbursement_stats AS (
                SELECT 
                    COUNT(*) as total_disbursements,
                    COALESCE(SUM(disbursed_amount), 0) as total_disbursed_amount
                FROM disbursements d
                JOIN leads l ON d.lead_id = l.id
                WHERE l.sales_manager_id = $1
            )
            SELECT 
                ls.total_leads,
                ls.approved_leads,
                ls.pending_leads,
                ls.rejected_leads,
                ss.total_sanctions,
                ss.total_sanctioned_amount,
                ds.total_disbursements,
                ds.total_disbursed_amount
            FROM lead_stats ls, sanction_stats ss, disbursement_stats ds
        `;

        const result = await db.query(metricsQuery, [userId]);
        const metrics = result.rows[0] || {
            total_leads: 0,
            approved_leads: 0,
            pending_leads: 0,
            rejected_leads: 0,
            total_sanctions: 0,
            total_sanctioned_amount: 0,
            total_disbursements: 0,
            total_disbursed_amount: 0
        };

        // Calculate target achievement (mock calculation for now)
        const target = 5000000; // 50 lakhs target
        const achievement = metrics.total_sanctioned_amount;
        const achievementPercentage = target > 0 ? Math.round((achievement / target) * 100) : 0;

        const dashboardData = {
            totalLeads: metrics.total_leads,
            lfiSanctions: `₹${Number(metrics.total_sanctioned_amount).toLocaleString("en-IN")}`,
            bankSanctions: metrics.total_sanctions,
            totalDisbursement: `₹${Number(metrics.total_disbursed_amount).toLocaleString("en-IN")}`,
            targetAchievement: `${achievementPercentage}% Complete`,
            disbursementCases: metrics.total_disbursements
        };

        return res.status(200).json(dashboardData);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getRecentLeads(req, res) {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;

        const query = `
            SELECT 
                l.id,
                pd.first_name || ' ' || pd.last_name as customer_name,
                l.status,
                pd.mobile,
                l.loan_type,
                l.created_at
            FROM leads l
            JOIN users u ON l.customer_id = u.id
            LEFT JOIN personal_details pd ON u.id = pd.user_id
            WHERE l.sales_manager_id = $1
            ORDER BY l.created_at DESC
            LIMIT $2
        `;

        const result = await db.query(query, [userId, limit]);
        
        const leads = result.rows.map(row => ({
            id: row.id,
            name: row.customer_name || 'Unknown Customer',
            status: row.status,
            contact: row.mobile,
            loanType: row.loan_type || 'Home Loan'
        }));

        return res.status(200).json(leads);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
} 