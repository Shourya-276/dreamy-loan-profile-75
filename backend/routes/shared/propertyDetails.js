import { Router } from "express";
import { savePropertyDetails, getPropertyDetails } from "../../controllers/shared/propertyDetailsController.js";

const router = Router();

router.post("/", savePropertyDetails);
router.get("/:userId", getPropertyDetails);

export default router; 