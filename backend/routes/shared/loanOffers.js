import { Router } from "express";
import { getLoanOffers, getLFISanctions, getAllLFISanctions, getSalesManagerLoanOffers, generateLFISanctionLetter } from "../../controllers/shared/loanOffersController.js";

const router = Router();

// More specific routes first
router.post("/sales-manager-check", getSalesManagerLoanOffers);
router.get("/lfi-sanctions/all", getAllLFISanctions);
router.get("/lfi-sanctions/:userId", getLFISanctions);
router.get("/lfi-sanction-letter/:userId", generateLFISanctionLetter);
router.get("/:userId", getLoanOffers);

export default router;