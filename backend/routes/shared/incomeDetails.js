import { Router } from "express";
import { saveIncomeDetails, getIncomeDetails } from "../../controllers/shared/incomeDetailsController.js";

const router = Router();

router.post("/", saveIncomeDetails);
router.get("/:userId", getIncomeDetails);

export default router; 