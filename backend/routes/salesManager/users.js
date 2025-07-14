import { Router } from "express";
import { searchUsers } from "../../controllers/salesManager/usersController.js";
import { requireSalesManager } from "../../middleware/roleAuth.js";

const router = Router();

// Apply sales manager role requirement to all routes
router.use(requireSalesManager);

router.get("/search", searchUsers);

export default router;