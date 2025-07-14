import { Router } from "express";
import { getAllLeads, updateLeadStatus, createLead } from "../../controllers/salesManager/leadsController.js";
import { requireSalesManager } from "../../middleware/roleAuth.js";

const router = Router();

// Apply sales manager role requirement to all routes
router.use(requireSalesManager);

// Get all leads for a sales manager
router.get("/:userId", getAllLeads);

// Update lead status
router.put("/:leadId/status", updateLeadStatus);

// Create new lead
router.post("/", createLead);

export default router; 