import db from "../../db.js";

// Get all tasks for a user with filtering and pagination
export async function getTasks(req, res) {
    try {
        const { userId } = req.params;
        const { 
            status = 'all', 
            priority = 'all',
            task_type = 'all',
            page = 1, 
            limit = 20, 
            search = '',
            assigned_by = 'all',
            due_date_filter = 'all' // today, overdue, upcoming, all
        } = req.query;

        let whereClause = "t.assigned_to = $1";
        let queryParams = [userId];
        let paramCount = 1;

        // Status filter
        if (status !== 'all') {
            whereClause += ` AND t.status = $${++paramCount}`;
            queryParams.push(status);
        }

        // Priority filter
        if (priority !== 'all') {
            whereClause += ` AND t.priority = $${++paramCount}`;
            queryParams.push(priority);
        }

        // Task type filter
        if (task_type !== 'all') {
            whereClause += ` AND t.task_type = $${++paramCount}`;
            queryParams.push(task_type);
        }

        // Assigned by filter
        if (assigned_by !== 'all') {
            whereClause += ` AND t.assigned_by = $${++paramCount}`;
            queryParams.push(assigned_by);
        }

        // Search filter
        if (search) {
            whereClause += ` AND (t.title ILIKE $${++paramCount} OR t.description ILIKE $${++paramCount})`;
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern);
        }

        // Due date filter
        if (due_date_filter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            switch (due_date_filter) {
                case 'today':
                    whereClause += ` AND t.due_date >= $${++paramCount} AND t.due_date < $${++paramCount}`;
                    queryParams.push(today.toISOString(), tomorrow.toISOString());
                    break;
                case 'overdue':
                    whereClause += ` AND t.due_date < $${++paramCount} AND t.status != 'completed'`;
                    queryParams.push(now.toISOString());
                    break;
                case 'upcoming':
                    whereClause += ` AND t.due_date >= $${++paramCount}`;
                    queryParams.push(tomorrow.toISOString());
                    break;
            }
        }

        const offset = (page - 1) * limit;

        // Count query
        const countQuery = `
            SELECT COUNT(*) as total
            FROM tasks t
            LEFT JOIN users assigned_by_user ON t.assigned_by = assigned_by_user.id
            WHERE ${whereClause}
        `;

        // Main query
        const tasksQuery = `
            SELECT 
                t.*,
                assigned_by_user.name as assigned_by_name,
                assigned_by_user.email as assigned_by_email,
                pt.title as prebuilt_title,
                pt.category as prebuilt_category,
                (SELECT COUNT(*) FROM task_comments tc WHERE tc.task_id = t.id) as comment_count,
                (SELECT COUNT(*) FROM task_attachments ta WHERE ta.task_id = t.id) as attachment_count
            FROM tasks t
            LEFT JOIN users assigned_by_user ON t.assigned_by = assigned_by_user.id
            LEFT JOIN prebuilt_task_templates pt ON t.prebuilt_template_id = pt.id
            WHERE ${whereClause}
            ORDER BY 
                CASE 
                    WHEN t.priority = 'urgent' THEN 1
                    WHEN t.priority = 'high' THEN 2
                    WHEN t.priority = 'medium' THEN 3
                    WHEN t.priority = 'low' THEN 4
                END,
                t.due_date ASC NULLS LAST,
                t.created_at DESC
            LIMIT $${++paramCount} OFFSET $${++paramCount}
        `;

        queryParams.push(limit, offset);

        const [countResult, tasksResult] = await Promise.all([
            db.query(countQuery, queryParams.slice(0, -2)),
            db.query(tasksQuery, queryParams)
        ]);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        const formattedTasks = tasksResult.rows.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            taskType: task.task_type,
            priority: task.priority,
            status: task.status,
            dueDate: task.due_date,
            completedAt: task.completed_at,
            isPrebuilt: task.is_prebuilt,
            prebuiltTemplateId: task.prebuilt_template_id,
            prebuiltTitle: task.prebuilt_title,
            prebuiltCategory: task.prebuilt_category,
            relatedEntityType: task.related_entity_type,
            relatedEntityId: task.related_entity_id,
            metadata: task.metadata,
            reminderSent: task.reminder_sent,
            reminderDate: task.reminder_date,
            assignedBy: {
                id: task.assigned_by,
                name: task.assigned_by_name,
                email: task.assigned_by_email
            },
            commentCount: parseInt(task.comment_count || 0),
            attachmentCount: parseInt(task.attachment_count || 0),
            createdAt: task.created_at,
            updatedAt: task.updated_at
        }));

        return res.status(200).json({
            message: "Tasks retrieved successfully",
            tasks: formattedTasks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            }
        });

    } catch (err) {
        console.error("Error fetching tasks:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Create a new task
export async function createTask(req, res) {
    try {
        const { 
            title, 
            description, 
            assignedTo, 
            assignedBy, 
            taskType = 'custom',
            priority = 'medium',
            dueDate,
            prebuiltTemplateId,
            relatedEntityType,
            relatedEntityId,
            metadata = {},
            reminderDate
        } = req.body;

        // Validate required fields
        if (!title || !assignedTo) {
            return res.status(400).json({ error: "Title and assigned_to are required" });
        }

        // Validate assignedTo user exists
        const userResult = await db.query("SELECT id, name FROM users WHERE id = $1", [assignedTo]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "Assigned user not found" });
        }

        // If prebuilt template is specified, get template details
        let isPrebuilt = false;
        let templateData = {};
        if (prebuiltTemplateId) {
            const templateResult = await db.query(
                "SELECT * FROM prebuilt_task_templates WHERE id = $1 AND is_active = true",
                [prebuiltTemplateId]
            );
            if (templateResult.rows.length > 0) {
                isPrebuilt = true;
                templateData = templateResult.rows[0];
            }
        }

        const insertQuery = `
            INSERT INTO tasks (
                title, description, assigned_to, assigned_by, task_type, priority, 
                due_date, is_prebuilt, prebuilt_template_id, related_entity_type, 
                related_entity_id, metadata, reminder_date, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING *
        `;

        const result = await db.query(insertQuery, [
            title,
            description || templateData.description || null,
            assignedTo,
            assignedBy,
            taskType || templateData.task_type || 'custom',
            priority || templateData.priority || 'medium',
            dueDate || null,
            isPrebuilt,
            prebuiltTemplateId || null,
            relatedEntityType || null,
            relatedEntityId || null,
            JSON.stringify(metadata),
            reminderDate || null
        ]);

        const newTask = result.rows[0];

        // Record status history
        await db.query(
            "INSERT INTO task_status_history (task_id, new_status, changed_by, changed_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)",
            [newTask.id, 'pending', assignedBy]
        );

        // Create notification for assigned user
        if (assignedTo !== assignedBy) {
            await db.query(`
                INSERT INTO task_notifications (
                    task_id, user_id, notification_type, title, message, created_at
                ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            `, [
                newTask.id,
                assignedTo,
                'assignment',
                'New Task Assigned',
                `You have been assigned a new task: ${title}`
            ]);
        }
        console.log(newTask);
        

        return res.status(201).json({
            message: "Task created successfully",
            task: {
                ...newTask,
                metadata: newTask.metadata || '{}'
            }
        });

    } catch (err) {
        console.error("Error creating task:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Update task status
export async function updateTaskStatus(req, res) {
    try {
        const { taskId } = req.params;
        const { status, changedBy, changeReason, notes } = req.body;

        const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'rescheduled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        // Get current task
        const currentTask = await db.query("SELECT * FROM tasks WHERE id = $1", [taskId]);
        if (currentTask.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        const task = currentTask.rows[0];
        const previousStatus = task.status;

        // Update task
        const updateQuery = `
            UPDATE tasks 
            SET status = $1, 
                completed_at = CASE WHEN $1::varchar = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 
            RETURNING *
        `;

        const result = await db.query(updateQuery, [status, taskId]);

        // Record status history - handle optional changeReason
        if (changeReason) {
            await db.query(`
                INSERT INTO task_status_history (
                    task_id, previous_status, new_status, changed_by, change_reason, changed_at
                ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            `, [taskId, previousStatus, status, changedBy, changeReason]);
        } else {
            await db.query(`
                INSERT INTO task_status_history (
                    task_id, previous_status, new_status, changed_by, changed_at
                ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            `, [taskId, previousStatus, status, changedBy]);
        }

        // Add comment if notes provided
        if (notes) {
            await db.query(`
                INSERT INTO task_comments (task_id, user_id, comment, created_at)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            `, [taskId, changedBy, notes]);
        }

        // Create notification for assigned user
        if (task.assigned_to !== changedBy) {
            await db.query(`
                INSERT INTO task_notifications (
                    task_id, user_id, notification_type, title, message, created_at
                ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            `, [
                taskId,
                task.assigned_to,
                'status_change',
                'Task Status Updated',
                `Task "${task.title}" status changed from ${previousStatus} to ${status}`
            ]);
        }

        return res.status(200).json({
            message: "Task status updated successfully",
            task: {
                ...result.rows[0],
                metadata: result.rows[0].metadata || '{}'
            }
        });

    } catch (err) {
        console.error("Error updating task status:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Update task details
export async function updateTask(req, res) {
    try {
        const { taskId } = req.params;
        const { 
            title, 
            description, 
            priority, 
            dueDate, 
            taskType,
            reminderDate,
            metadata,
            updatedBy
        } = req.body;

        // Check if task exists
        const taskResult = await db.query("SELECT * FROM tasks WHERE id = $1", [taskId]);
        if (taskResult.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        const updateQuery = `
            UPDATE tasks 
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                priority = COALESCE($3, priority),
                due_date = COALESCE($4, due_date),
                task_type = COALESCE($5, task_type),
                reminder_date = COALESCE($6, reminder_date),
                metadata = COALESCE($7, metadata),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
            RETURNING *
        `;

        const result = await db.query(updateQuery, [
            title,
            description,
            priority,
            dueDate,
            taskType,
            reminderDate,
            metadata ? JSON.stringify(metadata) : null,
            taskId
        ]);

        return res.status(200).json({
            message: "Task updated successfully",
            task: {
                ...result.rows[0],
                metadata: result.rows[0].metadata || '{}'
            }
        });

    } catch (err) {
        console.error("Error updating task:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Delete task
export async function deleteTask(req, res) {
    try {
        const { taskId } = req.params;
        const { deletedBy } = req.body;

        // Check if task exists
        const taskResult = await db.query("SELECT * FROM tasks WHERE id = $1", [taskId]);
        if (taskResult.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Delete task (cascading will handle related records)
        await db.query("DELETE FROM tasks WHERE id = $1", [taskId]);

        return res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (err) {
        console.error("Error deleting task:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Get task details with comments and history
export async function getTaskDetails(req, res) {
    try {
        const { taskId } = req.params;

        // Get task details
        const taskQuery = `
            SELECT 
                t.*,
                assigned_to_user.name as assigned_to_name,
                assigned_to_user.email as assigned_to_email,
                assigned_by_user.name as assigned_by_name,
                assigned_by_user.email as assigned_by_email,
                pt.title as prebuilt_title,
                pt.category as prebuilt_category,
                pt.description as prebuilt_description
            FROM tasks t
            LEFT JOIN users assigned_to_user ON t.assigned_to = assigned_to_user.id
            LEFT JOIN users assigned_by_user ON t.assigned_by = assigned_by_user.id
            LEFT JOIN prebuilt_task_templates pt ON t.prebuilt_template_id = pt.id
            WHERE t.id = $1
        `;

        const taskResult = await db.query(taskQuery, [taskId]);
        if (taskResult.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        const task = taskResult.rows[0];

        // Get comments
        const commentsQuery = `
            SELECT 
                tc.*,
                u.name as user_name,
                u.email as user_email
            FROM task_comments tc
            JOIN users u ON tc.user_id = u.id
            WHERE tc.task_id = $1
            ORDER BY tc.created_at ASC
        `;

        const commentsResult = await db.query(commentsQuery, [taskId]);

        // Get status history
        const historyQuery = `
            SELECT 
                tsh.*,
                u.name as changed_by_name
            FROM task_status_history tsh
            LEFT JOIN users u ON tsh.changed_by = u.id
            WHERE tsh.task_id = $1
            ORDER BY tsh.changed_at ASC
        `;

        const historyResult = await db.query(historyQuery, [taskId]);

        // Get attachments
        const attachmentsQuery = `
            SELECT 
                ta.*,
                u.name as uploaded_by_name
            FROM task_attachments ta
            LEFT JOIN users u ON ta.uploaded_by = u.id
            WHERE ta.task_id = $1
            ORDER BY ta.uploaded_at DESC
        `;

        const attachmentsResult = await db.query(attachmentsQuery, [taskId]);

        const formattedTask = {
            id: task.id,
            title: task.title,
            description: task.description,
            taskType: task.task_type,
            priority: task.priority,
            status: task.status,
            dueDate: task.due_date,
            completedAt: task.completed_at,
            isPrebuilt: task.is_prebuilt,
            prebuiltTemplateId: task.prebuilt_template_id,
            prebuiltTitle: task.prebuilt_title,
            prebuiltCategory: task.prebuilt_category,
            prebuiltDescription: task.prebuilt_description,
            relatedEntityType: task.related_entity_type,
            relatedEntityId: task.related_entity_id,
            metadata: JSON.parse(task.metadata || '{}'),
            reminderSent: task.reminder_sent,
            reminderDate: task.reminder_date,
            assignedTo: {
                id: task.assigned_to,
                name: task.assigned_to_name,
                email: task.assigned_to_email
            },
            assignedBy: {
                id: task.assigned_by,
                name: task.assigned_by_name,
                email: task.assigned_by_email
            },
            comments: commentsResult.rows.map(comment => ({
                id: comment.id,
                comment: comment.comment,
                isInternal: comment.is_internal,
                user: {
                    id: comment.user_id,
                    name: comment.user_name,
                    email: comment.user_email
                },
                createdAt: comment.created_at,
                updatedAt: comment.updated_at
            })),
            statusHistory: historyResult.rows.map(history => ({
                id: history.id,
                previousStatus: history.previous_status,
                newStatus: history.new_status,
                changeReason: history.change_reason,
                changedBy: {
                    id: history.changed_by,
                    name: history.changed_by_name
                },
                changedAt: history.changed_at
            })),
            attachments: attachmentsResult.rows.map(attachment => ({
                id: attachment.id,
                fileName: attachment.file_name,
                fileUrl: attachment.file_url,
                documentId: attachment.document_id,
                uploadedBy: {
                    id: attachment.uploaded_by,
                    name: attachment.uploaded_by_name
                },
                uploadedAt: attachment.uploaded_at
            })),
            createdAt: task.created_at,
            updatedAt: task.updated_at
        };

        return res.status(200).json({
            message: "Task details retrieved successfully",
            task: formattedTask
        });

    } catch (err) {
        console.error("Error fetching task details:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Add comment to task
export async function addTaskComment(req, res) {
    try {
        const { taskId } = req.params;
        const { userId, comment, isInternal = true } = req.body;

        if (!comment || !comment.trim()) {
            return res.status(400).json({ error: "Comment is required" });
        }

        // Check if task exists
        const taskResult = await db.query("SELECT assigned_to FROM tasks WHERE id = $1", [taskId]);
        if (taskResult.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        const insertQuery = `
            INSERT INTO task_comments (task_id, user_id, comment, is_internal, created_at, updated_at)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `;

        const result = await db.query(insertQuery, [taskId, userId, comment.trim(), isInternal]);

        // Create notification for assigned user if commenter is different
        const task = taskResult.rows[0];
        if (task.assigned_to !== userId) {
            await db.query(`
                INSERT INTO task_notifications (
                    task_id, user_id, notification_type, title, message, created_at
                ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            `, [
                taskId,
                task.assigned_to,
                'comment',
                'New Task Comment',
                `A new comment was added to your task`
            ]);
        }

        return res.status(201).json({
            message: "Comment added successfully",
            comment: result.rows[0]
        });

    } catch (err) {
        console.error("Error adding task comment:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Get prebuilt task templates
export async function getPrebuiltTaskTemplates(req, res) {
    try {
        const { category = 'all', task_type = 'all' } = req.query;

        let whereClause = "is_active = true";
        let queryParams = [];
        let paramCount = 0;

        if (category !== 'all') {
            whereClause += ` AND category = $${++paramCount}`;
            queryParams.push(category);
        }

        if (task_type !== 'all') {
            whereClause += ` AND task_type = $${++paramCount}`;
            queryParams.push(task_type);
        }

        const query = `
            SELECT *
            FROM prebuilt_task_templates
            WHERE ${whereClause}
            ORDER BY category, title
        `;

        const result = await db.query(query, queryParams);

        const templates = result.rows.map(template => ({
            id: template.id,
            title: template.title,
            description: template.description,
            taskType: template.task_type,
            priority: template.priority,
            estimatedDuration: template.estimated_duration,
            category: template.category,
            isActive: template.is_active,
            createdBy: template.created_by,
            createdAt: template.created_at,
            updatedAt: template.updated_at
        }));

        return res.status(200).json({
            message: "Prebuilt task templates retrieved successfully",
            templates
        });

    } catch (err) {
        console.error("Error fetching prebuilt task templates:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Get task statistics for dashboard
export async function getTaskStatistics(req, res) {
    try {
        const { userId } = req.params;

        const statsQuery = `
            SELECT 
                COUNT(*) as total_tasks,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_tasks,
                COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_tasks,
                COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tasks,
                COUNT(CASE WHEN due_date < CURRENT_TIMESTAMP AND status != 'completed' THEN 1 END) as overdue_tasks,
                COUNT(CASE WHEN DATE(due_date) = CURRENT_DATE AND status != 'completed' THEN 1 END) as due_today_tasks
            FROM tasks
            WHERE assigned_to = $1
        `;

        const result = await db.query(statsQuery, [userId]);
        const stats = result.rows[0];

        return res.status(200).json({
            message: "Task statistics retrieved successfully",
            statistics: {
                totalTasks: parseInt(stats.total_tasks),
                pendingTasks: parseInt(stats.pending_tasks),
                inProgressTasks: parseInt(stats.in_progress_tasks),
                completedTasks: parseInt(stats.completed_tasks),
                cancelledTasks: parseInt(stats.cancelled_tasks),
                urgentTasks: parseInt(stats.urgent_tasks),
                highPriorityTasks: parseInt(stats.high_priority_tasks),
                overdueTasks: parseInt(stats.overdue_tasks),
                dueTodayTasks: parseInt(stats.due_today_tasks)
            }
        });

    } catch (err) {
        console.error("Error fetching task statistics:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}



// Create task from prebuilt template
export async function createTaskFromTemplate(req, res) {
    try {
        const { templateId } = req.params;
        const { 
            assignedTo, 
            assignedBy, 
            dueDate, 
            relatedEntityType, 
            relatedEntityId,
            customDescription,
            customPriority
        } = req.body;

        // Get template details
        const templateResult = await db.query(
            "SELECT * FROM prebuilt_task_templates WHERE id = $1 AND is_active = true",
            [templateId]
        );

        if (templateResult.rows.length === 0) {
            return res.status(404).json({ error: "Template not found or inactive" });
        }

        const template = templateResult.rows[0];

        // Create task using template
        const taskData = {
            title: template.title,
            description: customDescription || template.description,
            assignedTo,
            assignedBy,
            taskType: template.task_type,
            priority: customPriority || template.priority,
            dueDate,
            prebuiltTemplateId: templateId,
            relatedEntityType,
            relatedEntityId,
            metadata: {
                templateCategory: template.category,
                estimatedDuration: template.estimated_duration
            }
        };

        // Use the existing createTask logic
        req.body = taskData;
        return await createTask(req, res);

    } catch (err) {
        console.error("Error creating task from template:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Get tasks by related entity (lead, customer, etc.)
export async function getTasksByEntity(req, res) {
    try {
        const { entityType, entityId } = req.params;
        const { status = 'all', page = 1, limit = 20 } = req.query;

        let whereClause = "t.related_entity_type = $1 AND t.related_entity_id = $2";
        let queryParams = [entityType, entityId];
        let paramCount = 2;

        if (status !== 'all') {
            whereClause += ` AND t.status = $${++paramCount}`;
            queryParams.push(status);
        }

        const offset = (page - 1) * limit;

        const tasksQuery = `
            SELECT 
                t.*,
                assigned_to_user.name as assigned_to_name,
                assigned_to_user.email as assigned_to_email,
                assigned_by_user.name as assigned_by_name,
                assigned_by_user.email as assigned_by_email,
                pt.title as prebuilt_title,
                pt.category as prebuilt_category
            FROM tasks t
            LEFT JOIN users assigned_to_user ON t.assigned_to = assigned_to_user.id
            LEFT JOIN users assigned_by_user ON t.assigned_by = assigned_by_user.id
            LEFT JOIN prebuilt_task_templates pt ON t.prebuilt_template_id = pt.id
            WHERE ${whereClause}
            ORDER BY t.created_at DESC
            LIMIT $${++paramCount} OFFSET $${++paramCount}
        `;

        queryParams.push(limit, offset);

        const result = await db.query(tasksQuery, queryParams);

        const formattedTasks = result.rows.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            taskType: task.task_type,
            priority: task.priority,
            status: task.status,
            dueDate: task.due_date,
            completedAt: task.completed_at,
            isPrebuilt: task.is_prebuilt,
            prebuiltTitle: task.prebuilt_title,
            prebuiltCategory: task.prebuilt_category,
            assignedTo: {
                id: task.assigned_to,
                name: task.assigned_to_name,
                email: task.assigned_to_email
            },
            assignedBy: {
                id: task.assigned_by,
                name: task.assigned_by_name,
                email: task.assigned_by_email
            },
            metadata: JSON.parse(task.metadata || '{}'),
            createdAt: task.created_at,
            updatedAt: task.updated_at
        }));

        return res.status(200).json({
            message: "Entity tasks retrieved successfully",
            tasks: formattedTasks,
            entityType,
            entityId
        });

    } catch (err) {
        console.error("Error fetching entity tasks:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
} 