import express from "express";
import { getSanctionsForSalesManager } from "../../controllers/salesManager/sanctionsController.js";
import { requireSalesManager } from "../../middleware/roleAuth.js";

const router = express.Router();

// Apply role authentication middleware
router.use(requireSalesManager);

// Get all LFI sanctions for a sales manager (with unique users)
router.get("/:salesManagerId", getSanctionsForSalesManager);

export default router; 