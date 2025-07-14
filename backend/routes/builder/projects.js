import { Router } from "express";
import { 
    createProject, 
    getBuilderProjects, 
    getProjectDetails, 
    updateProject, 
    deleteProject,
    getAPFDocuments,
    updateAPFDocument,
    getProjectInventory,
    updateProjectInventory,
    generateUploadUrl,
    confirmDocumentUpload,
    generateDownloadUrl,
    deleteAPFDocument
} from "../../controllers/builder/projectController.js";
import { requireBuilder } from "../../middleware/roleAuth.js";

const router = Router();

// Apply builder role requirement to all routes
router.use(requireBuilder);

// Project management routes
router.post("/", createProject);                                    // POST /builder/projects
router.get("/:builderId", getBuilderProjects);                     // GET /builder/projects/:builderId
router.get("/details/:projectId", getProjectDetails);              // GET /builder/projects/details/:projectId
router.put("/:projectId", updateProject);                          // PUT /builder/projects/:projectId
router.delete("/:projectId", deleteProject);                       // DELETE /builder/projects/:projectId

// APF Documents routes
router.get("/:projectId/apf-documents", getAPFDocuments);          // GET /builder/projects/:projectId/apf-documents
router.put("/apf-documents/:documentId", updateAPFDocument);       // PUT /builder/projects/apf-documents/:documentId
router.post("/documents/upload-url", generateUploadUrl);           // POST /builder/projects/documents/upload-url
router.post("/documents/:documentId/confirm", confirmDocumentUpload); // POST /builder/projects/documents/:documentId/confirm
router.get("/documents/:documentId/download", generateDownloadUrl); // GET /builder/projects/documents/:documentId/download
router.delete("/apf-documents/:documentId", deleteAPFDocument);

// Inventory management routes
router.get("/:projectId/inventory", getProjectInventory);          // GET /builder/projects/:projectId/inventory
router.put("/inventory/:inventoryId", updateProjectInventory);     // PUT /builder/projects/inventory/:inventoryId

export default router; 