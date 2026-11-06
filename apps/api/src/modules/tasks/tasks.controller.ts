import { Router, Response } from 'express';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  CreateSubtaskSchema,
  CreateTaskCommentSchema,
} from '@setsuzoku/shared';
import { tasksService } from './tasks.service';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard';
import { tenantGuard } from '../../middleware/tenant.guard';
import { requirePermission } from '../../middleware/rbac.guard';

export const tasksRouter = Router();

tasksRouter.use(authGuard);
tasksRouter.use(tenantGuard);

// List tasks
tasksRouter.get(
  '/',
  requirePermission('tasks:view'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const filters = {
        projectId: req.query.projectId as string,
        assignedToId: req.query.assignedToId as string,
        status: req.query.status as any,
      };
      const result = await tasksService.getTasks(req.tenant!.organizationId, filters);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Create task
tasksRouter.post(
  '/',
  requirePermission('tasks:create'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = CreateTaskSchema.parse(req.body);
      const result = await tasksService.createTask(
        req.tenant!.organizationId,
        validated,
        req.user!.id
      );
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Task created successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Get task detail
tasksRouter.get(
  '/:id',
  requirePermission('tasks:view'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const result = await tasksService.getTaskById(req.tenant!.organizationId, req.params.id);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Update task
tasksRouter.patch(
  '/:id',
  requirePermission('tasks:update'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = UpdateTaskSchema.parse(req.body);
      const result = await tasksService.updateTask(
        req.tenant!.organizationId,
        req.params.id,
        validated,
        req.user!.id
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Task updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Add subtask
tasksRouter.post(
  '/:id/subtasks',
  requirePermission('tasks:update'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = CreateSubtaskSchema.parse(req.body);
      const result = await tasksService.addSubtask(req.params.id, validated);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Toggle subtask completion
tasksRouter.post(
  '/subtasks/:subtaskId/toggle',
  requirePermission('tasks:update'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const result = await tasksService.toggleSubtask(req.params.subtaskId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Add task discussion comment
tasksRouter.post(
  '/:id/comments',
  requirePermission('tasks:update'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = CreateTaskCommentSchema.parse(req.body);
      const result = await tasksService.addComment(req.params.id, req.user!.id, validated);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

