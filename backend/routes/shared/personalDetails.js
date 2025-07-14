import { Router } from "express";
import { savePersonalDetails, getPersonalDetails } from "../../controllers/shared/personalDetailsController.js";

const router = Router();

router.post("/", savePersonalDetails);
router.get("/:userId", getPersonalDetails);

export default router; 