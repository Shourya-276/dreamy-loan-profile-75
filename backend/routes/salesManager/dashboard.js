import { Router } from "express";
import { getDashboardMetrics, getRecentLeads } from "../../controllers/salesManager/dashboardController.js";
import { requireSalesManager } from "../../middleware/roleAuth.js";

const router = Router();

// Apply sales manager role requirement to all routes
router.use(requireSalesManager);

// Dashboard metrics endpoint
router.get("/metrics/:userId", getDashboardMetrics);

// Recent leads endpoint
router.get("/recent-leads/:userId", getRecentLeads);

export default router; 