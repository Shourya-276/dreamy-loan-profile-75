import express from "express";
import { 
    getTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getPrebuiltTaskTemplates,
    getTaskStatistics,
    addTaskComment,
    createTaskFromTemplate,
    getTasksByEntity
} from "../../controllers/shared/tasksController.js";
import { requireRole } from "../../middleware/roleAuth.js";

const router = express.Router();

// Apply role-based authentication to all routes
// Tasks are available to all authenticated users with staff roles
router.use(requireRole(['salesmanager', 'loancoordinator', 'loanadministrator', 'admin']));

// Get prebuilt task templates (must come before dynamic routes)
// GET /tasks/templates/prebuilt?category=document_collection&task_type=document
router.get("/templates/prebuilt", getPrebuiltTaskTemplates);

// Get all tasks for a user with filtering and pagination
// GET /tasks/:userId?status=pending&priority=high&page=1&limit=20&search=follow
router.get("/:userId", getTasks);

// Get task statistics for dashboard
// GET /tasks/:userId/statistics
router.get("/:userId/statistics", getTaskStatistics);

// Create a new task
// POST /tasks
// Body: { title, description, assignedTo, assignedBy, taskType, priority, dueDate, prebuiltTemplateId, relatedEntityType, relatedEntityId }
router.post("/", createTask);

// Update task details
// PUT /tasks/:taskId
// Body: { title, description, priority, dueDate, taskType, reminderDate, metadata, updatedBy }
router.put("/:taskId", updateTask);

// Update task status
// PUT /tasks/:taskId/status
// Body: { status, changedBy, changeReason, notes }
router.put("/:taskId/status", updateTaskStatus);

// Delete task
// DELETE /tasks/:taskId
// Body: { deletedBy }
router.delete("/:taskId", deleteTask);

// Add comment to task
// POST /tasks/:taskId/comments
// Body: { userId, comment, isInternal }
router.post("/:taskId/comments", addTaskComment);

// Create task from prebuilt template
// POST /tasks/templates/:templateId/create
// Body: { assignedTo, assignedBy, dueDate, relatedEntityType, relatedEntityId, customDescription, customPriority }
router.post("/templates/:templateId/create", createTaskFromTemplate);

// Get tasks by related entity
// GET /tasks/entity/:entityType/:entityId?status=pending&page=1&limit=20
router.get("/entity/:entityType/:entityId", getTasksByEntity);

export default router; 