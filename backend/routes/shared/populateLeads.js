import express from "express";
import { 
    populateLeadsFromCustomers, 
    assignCustomerToSalesManager, 
    updateLeadStatuses 
} from "../../controllers/shared/populateLeads.js";
import { 
    getLeadsOverview, 
    getUnassignedCustomers 
} from "../../controllers/shared/leadsOverviewController.js";
import { requireRole } from "../../middleware/roleAuth.js";

const router = express.Router();

// Route to populate leads table with all customers (Admin only)
router.post('/populate', requireRole(['admin', 'loanadministrator']), populateLeadsFromCustomers);

// Route to manually assign a customer to a sales manager (Admin only)
router.post('/assign', requireRole(['admin', 'loanadministrator']), assignCustomerToSalesManager);

// Route to update lead statuses based on current document status (Admin/Sales Manager)
router.put('/update-statuses', requireRole(['admin', 'loanadministrator', 'salesmanager']), updateLeadStatuses);

// Route to get leads overview and statistics (Admin only)
router.get('/overview', requireRole(['admin', 'loanadministrator']), getLeadsOverview);

// Route to get unassigned customers (Admin only)
router.get('/unassigned', requireRole(['admin', 'loanadministrator']), getUnassignedCustomers);

export default router; 