import { Router } from "express";
import { createEmployee } from "../../controllers/admin/employeeMasterController.js";
import { requireAdmin } from "../../middleware/roleAuth.js";

const router = Router();

router.use(requireAdmin);

router.post("/createEmployee", createEmployee);

export default router;