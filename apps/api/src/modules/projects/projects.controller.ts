import { Router, Response } from 'express';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ConvertQuotationToProjectSchema,
} from '@setsuzoku/shared';
import { projectsService } from './projects.service';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard';
import { tenantGuard } from '../../middleware/tenant.guard';
import { requirePermission } from '../../middleware/rbac.guard';

export const projectsRouter = Router();

projectsRouter.use(authGuard);
projectsRouter.use(tenantGuard);

// List projects
projectsRouter.get(
  '/',
  requirePermission('projects:view'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const filters = {
        clientId: req.query.clientId as string,
        status: req.query.status as any,
        managerId: req.query.managerId as string,
      };
      const result = await projectsService.getProjects(req.tenant!.organizationId, filters);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Create project manually
projectsRouter.post(
  '/',
  requirePermission('projects:create'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = CreateProjectSchema.parse(req.body);
      const result = await projectsService.createProject(
        req.tenant!.organizationId,
        validated,
        req.user!.id
      );
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Project initiated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Spawn project from accepted quotation
projectsRouter.post(
  '/convert-quote',
  requirePermission('projects:create'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = ConvertQuotationToProjectSchema.parse(req.body);
      const result = await projectsService.convertFromQuotation(
        req.tenant!.organizationId,
        validated,
        req.user!.id
      );
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Project created from accepted quotation successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Get project details
projectsRouter.get(
  '/:id',
  requirePermission('projects:view'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const result = await projectsService.getProjectById(req.tenant!.organizationId, req.params.id);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Update project
projectsRouter.patch(
  '/:id',
  requirePermission('projects:manage'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = UpdateProjectSchema.parse(req.body);
      const result = await projectsService.updateProject(
        req.tenant!.organizationId,
        req.params.id,
        validated,
        req.user!.id
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Project updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

