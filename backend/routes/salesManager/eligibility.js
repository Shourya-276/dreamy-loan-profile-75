import { Router } from "express";
import { quickEligibilityCheck, getEligibilityHistory } from "../../controllers/salesManager/eligibilityController.js";
import { requireSalesManager } from "../../middleware/roleAuth.js";

const router = Router();

// Require sales manager role for all routes here
router.use(requireSalesManager);

// Submit quick eligibility data
router.post("/", quickEligibilityCheck);

// Get eligibility history for a sales manager
router.get("/:salesManagerId", getEligibilityHistory);

export default router; 