import { Router } from "express";
import { saveSubmission } from "../../controllers/shared/documentSubmissionsController.js";

const router = Router();
router.post("/", saveSubmission);
export default router; 