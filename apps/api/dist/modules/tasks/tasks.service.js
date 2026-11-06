"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksService = exports.TasksService = void 0;
const db_1 = require("../../storage/db");
class TasksService {
    async formatTask(task) {
        const assignee = task.assignedToId ? await db_1.db.findUserById(task.assignedToId) : null;
        const subtasks = await db_1.db.getSubtasks(task.id);
        const comments = await db_1.db.getTaskComments(task.id);
        const formattedComments = await Promise.all(comments.map(async (c) => {
            const user = await db_1.db.findUserById(c.userId);
            return {
                id: c.id,
                taskId: c.taskId,
                userId: c.userId,
                userName: user?.fullName || 'Colleague',
                content: c.content,
                createdAt: c.createdAt.toISOString(),
            };
        }));
        return {
            ...task,
            dueDate: task.dueDate ? task.dueDate.toISOString() : null,
            completedAt: task.completedAt ? task.completedAt.toISOString() : null,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
            assignedTo: assignee
                ? {
                    id: assignee.id,
                    fullName: assignee.fullName,
                    email: assignee.email,
                }
                : null,
            subtasks: subtasks.map((s) => ({
                id: s.id,
                taskId: s.taskId,
                title: s.title,
                isCompleted: s.isCompleted,
                completedAt: s.completedAt ? s.completedAt.toISOString() : null,
            })),
            comments: formattedComments,
        };
    }
    async getTasks(organizationId, filters) {
        const list = await db_1.db.getTasks(organizationId, filters);
        return Promise.all(list.map((t) => this.formatTask(t)));
    }
    async getTaskById(organizationId, id) {
        const task = await db_1.db.findTaskById(id);
        if (!task) {
            const err = new Error('Task not found');
            err.statusCode = 404;
            err.code = 'TASK_NOT_FOUND';
            throw err;
        }
        const proj = await db_1.db.findProjectById(task.projectId);
        if (!proj || proj.organizationId !== organizationId) {
            const err = new Error('Task not found in this organization');
            err.statusCode = 404;
            err.code = 'TASK_NOT_FOUND';
            throw err;
        }
        return this.formatTask(task);
    }
    async createTask(organizationId, input, userId) {
        const proj = await db_1.db.findProjectById(input.projectId);
        if (!proj || proj.organizationId !== organizationId) {
            const err = new Error('Project not found');
            err.statusCode = 404;
            err.code = 'PROJECT_NOT_FOUND';
            throw err;
        }
        const task = await db_1.db.createTask({
            projectId: input.projectId,
            milestoneId: input.milestoneId,
            assignedToId: input.assignedToId,
            title: input.title,
            description: input.description,
            priority: input.priority,
            dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        });
        await db_1.db.logAudit({
            organizationId,
            userId,
            action: 'TASK_CREATED',
            resource: 'Task',
            resourceId: task.id,
            diff: input,
        });
        return this.formatTask(task);
    }
    async updateTask(organizationId, id, input, userId) {
        const task = await db_1.db.findTaskById(id);
        if (!task) {
            const err = new Error('Task not found');
            err.statusCode = 404;
            err.code = 'TASK_NOT_FOUND';
            throw err;
        }
        const proj = await db_1.db.findProjectById(task.projectId);
        if (!proj || proj.organizationId !== organizationId) {
            const err = new Error('Task not found');
            err.statusCode = 404;
            err.code = 'TASK_NOT_FOUND';
            throw err;
        }
        const updated = await db_1.db.updateTask(id, {
            ...input,
            dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        });
        await db_1.db.logAudit({
            organizationId,
            userId,
            action: 'TASK_UPDATED',
            resource: 'Task',
            resourceId: id,
            diff: { before: task, after: updated },
        });
        return this.formatTask(updated);
    }
    async addSubtask(taskId, input) {
        const task = await db_1.db.findTaskById(taskId);
        if (!task)
            throw new Error('Task not found');
        return db_1.db.addSubtask(taskId, input.title);
    }
    async toggleSubtask(subtaskId) {
        return db_1.db.toggleSubtask(subtaskId);
    }
    async addComment(taskId, userId, input) {
        const task = await db_1.db.findTaskById(taskId);
        if (!task)
            throw new Error('Task not found');
        return db_1.db.addTaskComment({
            taskId,
            userId,
            content: input.content,
        });
    }
}
exports.TasksService = TasksService;
exports.tasksService = new TasksService();
