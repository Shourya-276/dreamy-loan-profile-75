import db from "../../db.js";

// Get overview of leads distribution and status
export async function getLeadsOverview(req, res) {
    try {
        // Get total customers vs leads
        const customerCountQuery = `
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
                (SELECT COUNT(*) FROM leads) as total_leads,
                (SELECT COUNT(*) FROM users WHERE role = 'salesmanager') as total_sales_managers
        `;
        const customerCountResult = await db.query(customerCountQuery);
        const counts = customerCountResult.rows[0];

        // Get status distribution
        const statusDistributionQuery = `
            SELECT status, COUNT(*) as count
            FROM leads
            GROUP BY status
            ORDER BY count DESC
        `;
        const statusResult = await db.query(statusDistributionQuery);
        const statusDistribution = statusResult.rows;

        // Get sales manager workload distribution
        const workloadQuery = `
            SELECT 
                u.name as sales_manager_name,
                u.id as sales_manager_id,
                COUNT(l.id) as lead_count,
                COUNT(CASE WHEN l.status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN l.status = 'under_review' THEN 1 END) as under_review_count,
                COUNT(CASE WHEN l.status = 'approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN l.status = 'rejected' THEN 1 END) as rejected_count
            FROM users u
            LEFT JOIN leads l ON u.id = l.sales_manager_id
            WHERE u.role = 'salesmanager'
            GROUP BY u.id, u.name
            ORDER BY lead_count DESC
        `;
        const workloadResult = await db.query(workloadQuery);
        const salesManagerWorkload = workloadResult.rows;

        // Get recent lead activities
        const recentActivitiesQuery = `
            SELECT 
                l.id,
                l.status,
                l.loan_type,
                l.created_at,
                l.updated_at,
                pd.first_name,
                pd.last_name,
                sm.name as sales_manager_name
            FROM leads l
            JOIN users u ON l.customer_id = u.id
            JOIN users sm ON l.sales_manager_id = sm.id
            LEFT JOIN personal_details pd ON u.id = pd.user_id
            ORDER BY l.updated_at DESC
            LIMIT 10
        `;
        const recentActivitiesResult = await db.query(recentActivitiesQuery);
        const recentActivities = recentActivitiesResult.rows.map(row => ({
            id: row.id,
            customerName: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unknown Customer',
            salesManagerName: row.sales_manager_name,
            status: row.status,
            loanType: row.loan_type,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));

        // Calculate some additional metrics
        const totalCustomers = parseInt(counts.total_customers);
        const totalLeads = parseInt(counts.total_leads);
        const unassignedCustomers = totalCustomers - totalLeads;
        const assignmentPercentage = totalCustomers > 0 ? Math.round((totalLeads / totalCustomers) * 100) : 0;

        return res.status(200).json({
            summary: {
                totalCustomers,
                totalLeads,
                unassignedCustomers,
                totalSalesManagers: parseInt(counts.total_sales_managers),
                assignmentPercentage
            },
            statusDistribution,
            salesManagerWorkload,
            recentActivities
        });

    } catch (error) {
        console.error("Error fetching leads overview:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Get unassigned customers (those not in leads table)
export async function getUnassignedCustomers(req, res) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const countQuery = `
            SELECT COUNT(*) as total
            FROM users u
            LEFT JOIN leads l ON u.id = l.customer_id
            WHERE u.role = 'customer' AND l.customer_id IS NULL
        `;

        const customersQuery = `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.mobile,
                u.created_at,
                pd.first_name,
                pd.last_name
            FROM users u
            LEFT JOIN leads l ON u.id = l.customer_id
            LEFT JOIN personal_details pd ON u.id = pd.user_id
            WHERE u.role = 'customer' AND l.customer_id IS NULL
            ORDER BY u.created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const [countResult, customersResult] = await Promise.all([
            db.query(countQuery),
            db.query(customersQuery, [limit, offset])
        ]);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        const customers = customersResult.rows.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            mobile: row.mobile,
            displayName: `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.name || 'Unknown Customer',
            createdAt: row.created_at
        }));

        return res.status(200).json({
            customers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            }
        });

    } catch (error) {
        console.error("Error fetching unassigned customers:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
} 