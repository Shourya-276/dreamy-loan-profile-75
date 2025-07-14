import { Router } from "express";
import { 
    getBanks, 
    getBankROIConfig, 
    saveBankROIConfig, 
    deleteROIConfig, 
    getApplicableROI,
    getAllROIConfigurations 
} from "../../controllers/admin/bankROIController.js";
import { requireAdmin } from "../../middleware/roleAuth.js";

const router = Router();

// Public route for getting applicable ROI (used by loan calculation services)
router.get("/applicable", getApplicableROI);

// Admin protected routes
router.get("/banks", requireAdmin, getBanks);
router.get("/configurations", requireAdmin, getAllROIConfigurations);
router.get("/bank/:bankId", requireAdmin, getBankROIConfig);
router.post("/bank/:bankId", requireAdmin, saveBankROIConfig);
router.delete("/config/:configId", requireAdmin, deleteROIConfig);

export default router; 