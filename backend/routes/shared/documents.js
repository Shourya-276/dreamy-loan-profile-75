import { Router } from "express";
import { saveDocument, listDocuments, deleteDocument } from "../../controllers/shared/documentController.js";

const router = Router();

router.post("/", saveDocument);
router.get("/:userId", listDocuments);
router.delete("/:id", deleteDocument);

export default router;
