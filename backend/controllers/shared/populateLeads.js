import db from "../../db.js";

// Function to populate leads table with all customers and update existing ones
export async function populateLeadsFromCustomers(req, res) {
    try {
        console.log("Starting to populate/update leads table...");

        // Step 1: Get all sales managers
        const salesManagersQuery = `
            SELECT id, name, email 
            FROM users 
            WHERE role = 'salesmanager'
            ORDER BY id
        `;
        const salesManagersResult = await db.query(salesManagersQuery);
        const salesManagers = salesManagersResult.rows;

        if (salesManagers.length === 0) {
            return res.status(400).json({ 
                error: "No sales managers found. Please create sales manager users first." 
            });
        }

        console.log(`Found ${salesManagers.length} sales managers`);

        // Step 2: Get all customers who aren't already in leads table
        const newCustomersQuery = `
            SELECT u.id, u.name, u.email, u.created_at
            FROM users u
            LEFT JOIN leads l ON u.id = l.customer_id
            WHERE u.role = 'customer' AND l.customer_id IS NULL
            ORDER BY u.created_at
        `;
        const newCustomersResult = await db.query(newCustomersQuery);
        const newCustomers = newCustomersResult.rows;

        console.log(`Found ${newCustomers.length} new customers to add as leads`);

        // Step 3: Get existing leads that need status/loan type updates
        const existingLeadsQuery = `
            SELECT l.id, l.customer_id, l.status, l.loan_type, u.name as customer_name
            FROM leads l
            JOIN users u ON l.customer_id = u.id
            WHERE u.role = 'customer'
        `;
        const existingLeadsResult = await db.query(existingLeadsQuery);
        const existingLeads = existingLeadsResult.rows;

        console.log(`Found ${existingLeads.length} existing leads to check for updates`);

        // Step 4: Process new customers
        const leadsCreated = [];
        
        for (let i = 0; i < newCustomers.length; i++) {
            const customer = newCustomers[i];
            
            // Round-robin assignment to sales managers
            const assignedSalesManager = salesManagers[i % salesManagers.length];

            // Determine loan type from loan_requests table
            const loanTypeQuery = `
                SELECT loan_type 
                FROM loan_requests 
                WHERE user_id = $1
                LIMIT 1
            `;
            const loanTypeResult = await db.query(loanTypeQuery, [customer.id]);
            const loanType = loanTypeResult.rows[0]?.loan_type || 'home_loan';

            // Determine status based on document uploads
            const status = await determineCustomerStatus(customer.id);

            // Insert into leads table
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
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;

            const notes = `Auto-assigned customer. Status: ${status}`;
            const result = await db.query(insertLeadQuery, [
                customer.id,
                assignedSalesManager.id,
                loanType,
                status,
                notes,
                customer.created_at, // Use customer's original creation date
                new Date()
            ]);

            leadsCreated.push({
                leadId: result.rows[0].id,
                customerName: customer.name,
                salesManager: assignedSalesManager.name,
                loanType,
                status
            });

            console.log(`Created lead for customer ${customer.name} -> Sales Manager ${assignedSalesManager.name}`);
        }

        // Step 5: Update existing leads
        const leadsUpdated = [];
        
        for (const lead of existingLeads) {
            // Get updated loan type
            const loanTypeQuery = `
                SELECT loan_type 
                FROM loan_requests 
                WHERE user_id = $1
                LIMIT 1
            `;
            const loanTypeResult = await db.query(loanTypeQuery, [lead.customer_id]);
            const currentLoanType = loanTypeResult.rows[0]?.loan_type || 'home_loan';

            // Get updated status
            const currentStatus = await determineCustomerStatus(lead.customer_id);

            // Check if update is needed
            if (currentStatus !== lead.status || currentLoanType !== lead.loan_type) {
                const updateLeadQuery = `
                    UPDATE leads 
                    SET status = $1, loan_type = $2, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $3
                    RETURNING *
                `;

                const result = await db.query(updateLeadQuery, [
                    currentStatus,
                    currentLoanType,
                    lead.id
                ]);

                leadsUpdated.push({
                    leadId: lead.id,
                    customerName: lead.customer_name,
                    oldStatus: lead.status,
                    newStatus: currentStatus,
                    oldLoanType: lead.loan_type,
                    newLoanType: currentLoanType
                });

                console.log(`Updated lead for customer ${lead.customer_name}: Status ${lead.status} -> ${currentStatus}, Loan Type ${lead.loan_type} -> ${currentLoanType}`);
            }
        }

        return res.status(200).json({
            message: "Leads populated and updated successfully",
            leadsCreated: leadsCreated.length,
            leadsUpdated: leadsUpdated.length,
            newLeads: leadsCreated,
            updatedLeads: leadsUpdated,
            salesManagersUsed: salesManagers.length
        });

    } catch (error) {
        console.error("Error populating/updating leads:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Helper function to determine customer status based on document uploads
async function determineCustomerStatus(customerId) {
    try {
        // Check if customer has completed all required forms
        const formsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM personal_details WHERE user_id = $1) as personal_details,
                (SELECT COUNT(*) FROM income_details WHERE user_id = $1) as income_details,
                (SELECT COUNT(*) FROM property_details WHERE user_id = $1) as property_details
        `;
        const formsResult = await db.query(formsQuery, [customerId]);
        const forms = formsResult.rows[0];

        // Check if documents are uploaded
        const documentsQuery = `
            SELECT COUNT(*) as document_count
            FROM documents 
            WHERE user_id = $1
        `;
        const documentsResult = await db.query(documentsQuery, [customerId]);
        const documentCount = parseInt(documentsResult.rows[0].document_count);

        // Determine status based on completion
        const hasAllForms = forms.personal_details > 0 && 
                           forms.income_details > 0 && 
                           forms.property_details > 0;

        if (!hasAllForms) {
            return 'pending'; // Still filling out basic forms
        } else if (documentCount === 0) {
            return 'pending'; // Forms complete but no documents uploaded
        } else if (documentCount < 3) { // Assuming minimum 3 documents required
            return 'pending'; // Some documents uploaded but not all
        } else {
            return 'under_review'; // All forms and documents complete
        }

    } catch (error) {
        console.error("Error determining status for customer", customerId, error);
        return 'pending'; // Default to pending on error
    }
}

// Function to manually assign a customer to a specific sales manager
export async function assignCustomerToSalesManager(req, res) {
    try {
        const { customerId, salesManagerId, loanType } = req.body;

        // Verify customer exists and is not already a lead
        const existingLeadQuery = `
            SELECT id FROM leads WHERE customer_id = $1
        `;
        const existingLead = await db.query(existingLeadQuery, [customerId]);

        if (existingLead.rows.length > 0) {
            return res.status(400).json({ 
                error: "Customer is already assigned as a lead" 
            });
        }

        // Verify sales manager exists
        const salesManagerQuery = `
            SELECT id, name FROM users WHERE id = $1 AND role = 'salesmanager'
        `;
        const salesManagerResult = await db.query(salesManagerQuery, [salesManagerId]);

        if (salesManagerResult.rows.length === 0) {
            return res.status(404).json({ error: "Sales manager not found" });
        }

        // Verify customer exists
        const customerQuery = `
            SELECT id, name FROM users WHERE id = $1 AND role = 'customer'
        `;
        const customerResult = await db.query(customerQuery, [customerId]);

        if (customerResult.rows.length === 0) {
            return res.status(404).json({ error: "Customer not found" });
        }

        // Determine status
        const status = await determineCustomerStatus(customerId);

        // Create lead
        const insertQuery = `
            INSERT INTO leads (customer_id, sales_manager_id, loan_type, status, notes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const notes = `Manually assigned to ${salesManagerResult.rows[0].name}`;
        const result = await db.query(insertQuery, [
            customerId,
            salesManagerId,
            loanType || 'home_loan',
            status,
            notes
        ]);

        return res.status(201).json({
            message: "Customer assigned to sales manager successfully",
            lead: result.rows[0],
            customer: customerResult.rows[0],
            salesManager: salesManagerResult.rows[0]
        });

    } catch (error) {
        console.error("Error assigning customer:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Function to update lead statuses based on current document status
export async function updateLeadStatuses(req, res) {
    try {
        console.log("Updating lead statuses based on current document status...");

        const leadsQuery = `
            SELECT id, customer_id, status
            FROM leads
            WHERE status IN ('pending', 'under_review')
        `;
        const leadsResult = await db.query(leadsQuery);
        const leads = leadsResult.rows;

        let updatedCount = 0;

        for (const lead of leads) {
            const newStatus = await determineCustomerStatus(lead.customer_id);
            
            if (newStatus !== lead.status) {
                const updateQuery = `
                    UPDATE leads 
                    SET status = $1, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $2
                `;
                await db.query(updateQuery, [newStatus, lead.id]);
                updatedCount++;
                console.log(`Updated lead ${lead.id} status from ${lead.status} to ${newStatus}`);
            }
        }

        return res.status(200).json({
            message: "Lead statuses updated successfully",
            totalLeads: leads.length,
            updatedLeads: updatedCount
        });

    } catch (error) {
        console.error("Error updating lead statuses:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
} 