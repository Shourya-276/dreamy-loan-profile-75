import { Router } from "express";
import { saveCoApplicants, getCoApplicants } from "../../controllers/shared/coApplicantsController.js";

const router = Router();

router.post("/", saveCoApplicants);
router.get("/:userId", getCoApplicants);

export default router; 