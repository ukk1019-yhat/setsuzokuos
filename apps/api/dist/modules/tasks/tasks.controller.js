"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksRouter = void 0;
const express_1 = require("express");
const shared_1 = require("@setsuzoku/shared");
const tasks_service_1 = require("./tasks.service");
const auth_guard_1 = require("../../middleware/auth.guard");
const tenant_guard_1 = require("../../middleware/tenant.guard");
const rbac_guard_1 = require("../../middleware/rbac.guard");
exports.tasksRouter = (0, express_1.Router)();
exports.tasksRouter.use(auth_guard_1.authGuard);
exports.tasksRouter.use(tenant_guard_1.tenantGuard);
// List tasks
exports.tasksRouter.get('/', (0, rbac_guard_1.requirePermission)('tasks:view'), async (req, res, next) => {
    try {
        const filters = {
            projectId: req.query.projectId,
            assignedToId: req.query.assignedToId,
            status: req.query.status,
        };
        const result = await tasks_service_1.tasksService.getTasks(req.tenant.organizationId, filters);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Create task
exports.tasksRouter.post('/', (0, rbac_guard_1.requirePermission)('tasks:create'), async (req, res, next) => {
    try {
        const validated = shared_1.CreateTaskSchema.parse(req.body);
        const result = await tasks_service_1.tasksService.createTask(req.tenant.organizationId, validated, req.user.id);
        return res.status(201).json({
            success: true,
            data: result,
            message: 'Task created successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// Get task detail
exports.tasksRouter.get('/:id', (0, rbac_guard_1.requirePermission)('tasks:view'), async (req, res, next) => {
    try {
        const result = await tasks_service_1.tasksService.getTaskById(req.tenant.organizationId, req.params.id);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Update task
exports.tasksRouter.patch('/:id', (0, rbac_guard_1.requirePermission)('tasks:update'), async (req, res, next) => {
    try {
        const validated = shared_1.UpdateTaskSchema.parse(req.body);
        const result = await tasks_service_1.tasksService.updateTask(req.tenant.organizationId, req.params.id, validated, req.user.id);
        return res.status(200).json({
            success: true,
            data: result,
            message: 'Task updated successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// Add subtask
exports.tasksRouter.post('/:id/subtasks', (0, rbac_guard_1.requirePermission)('tasks:update'), async (req, res, next) => {
    try {
        const validated = shared_1.CreateSubtaskSchema.parse(req.body);
        const result = await tasks_service_1.tasksService.addSubtask(req.params.id, validated);
        return res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Toggle subtask completion
exports.tasksRouter.post('/subtasks/:subtaskId/toggle', (0, rbac_guard_1.requirePermission)('tasks:update'), async (req, res, next) => {
    try {
        const result = await tasks_service_1.tasksService.toggleSubtask(req.params.subtaskId);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Add task discussion comment
exports.tasksRouter.post('/:id/comments', (0, rbac_guard_1.requirePermission)('tasks:update'), async (req, res, next) => {
    try {
        const validated = shared_1.CreateTaskCommentSchema.parse(req.body);
        const result = await tasks_service_1.tasksService.addComment(req.params.id, req.user.id, validated);
        return res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
