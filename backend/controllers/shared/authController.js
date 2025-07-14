import db from "../../db.js";
import { validateLogin, validateSignup } from "../../validators/inputValidation.js";
import chatService from "../Chat/chatService.js";

// Helper function to automatically assign customer to sales manager
async function autoAssignCustomerToSalesManager(customerId) {
    try {
        // Get all sales managers
        const salesManagersQuery = `
            SELECT id, name 
            FROM users 
            WHERE role = 'salesmanager'
            ORDER BY id
        `;
        const salesManagersResult = await db.query(salesManagersQuery);
        const salesManagers = salesManagersResult.rows;

        if (salesManagers.length === 0) {
            console.log("No sales managers available for assignment");
            return;
        }

        // Count current leads for each sales manager to balance the load
        const leadCountsQuery = `
            SELECT sales_manager_id, COUNT(*) as lead_count
            FROM leads
            WHERE sales_manager_id = ANY($1)
            GROUP BY sales_manager_id
        `;
        const salesManagerIds = salesManagers.map(sm => sm.id);
        const leadCountsResult = await db.query(leadCountsQuery, [salesManagerIds]);
        
        // Create a map of sales manager id to lead count
        const leadCounts = {};
        leadCountsResult.rows.forEach(row => {
            leadCounts[row.sales_manager_id] = parseInt(row.lead_count);
        });

        // Find sales manager with least leads (load balancing)
        let assignedSalesManager = salesManagers[0];
        let minLeadCount = leadCounts[assignedSalesManager.id] || 0;

        for (const sm of salesManagers) {
            const currentCount = leadCounts[sm.id] || 0;
            if (currentCount < minLeadCount) {
                minLeadCount = currentCount;
                assignedSalesManager = sm;
            }
        }

        // Create lead record
        const insertLeadQuery = `
            INSERT INTO leads (
                customer_id, 
                sales_manager_id, 
                loan_type, 
                status, 
                notes,
                created_at, 
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;

        await db.query(insertLeadQuery, [
            customerId,
            assignedSalesManager.id,
            'home_loan', // Default loan type
            'pending',   // Initial status
            `Auto-assigned to ${assignedSalesManager.name} on customer signup`
        ]);

        console.log(`Customer ${customerId} auto-assigned to Sales Manager ${assignedSalesManager.name} (${assignedSalesManager.id})`);
        
    } catch (error) {
        console.error("Error auto-assigning customer to sales manager:", error);
        // Don't throw error - signup should still succeed even if lead assignment fails
    }
}

export async function login(req, res) {
    try {
        const { errors, isValid } = validateLogin(req.body);
        if (!isValid) {
            return res.status(400).json({ errors });
        }

        const { email, password } = req.body;
        const query = `
            SELECT u.id, u.name, u.email, u.mobile, u.role, l.sales_manager_id
            FROM users u
            LEFT JOIN leads l ON l.customer_id = u.id
            WHERE u.email = $1 AND u.password = $2
        `;
        const values = [email, password];
        const result = await db.query(query, values);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            return res.status(200).json({
                message: "Login successful",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    ...(user.role === 'customer' && user.sales_manager_id && { salesManagerId: user.sales_manager_id })
                }
            });
        }
        return res.status(401).send("Login failed");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal server error");
    }
}

export async function signup(req, res) {
    try {
        const { errors, isValid } = validateSignup(req.body);
        if (!isValid) {
            return res.status(400).json({ errors });
        }

        const { name, email, mobile, password } = req.body;

        // Since admin master is created. No need to check email for role
        // const isSalesManager = email.includes("@salesmanager.com");
        // const isLoanCoordinator = email.includes("@loancoordinator.com");
        // const isLoanAdministrator = email.includes("@loanadministrator.com");
        // const isConnector = email.includes("@connector.com"); 
        // const isAdmin = email.includes("@admin.com");
        // const role = isSalesManager ? "salesmanager" :
        //              isLoanCoordinator ? "loancoordinator" :
        //              isLoanAdministrator ? "loanadministrator" :
        //              isConnector ? "connector" :
        //              isAdmin ? "admin" : "customer";
        const role = "customer";

        const query = "INSERT INTO users (name, email, mobile, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, role";
        const values = [name, email, mobile, password, role];
        const result = await db.query(query, values);

        // If it's a customer, automatically assign to a sales manager
        if (role === 'customer') {
            await autoAssignCustomerToSalesManager(result.rows[0].id);
            
            // Initialize chat room for the new customer
            const salesManagerAssignment = await db.query(
                'SELECT sales_manager_id FROM leads WHERE customer_id = $1',
                [result.rows[0].id]
            );
            
            if (salesManagerAssignment.rows.length > 0) {
                const salesManagerId = salesManagerAssignment.rows[0].sales_manager_id;
                await chatService.createOrGetChatRoom(result.rows[0].id, salesManagerId);
            }
        }

        return res.status(200).json(result.rows[0]);
    } catch (err) {
        if (err.code === "23505") {
            return res.status(400).send("Email already exists");
        }
        console.error(err);
        return res.status(500).send("Internal server error");
    }
} 