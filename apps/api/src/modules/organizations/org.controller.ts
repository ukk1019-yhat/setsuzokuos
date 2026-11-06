import { Router, Response } from 'express';
import { CreateOrganizationSchema, UpdateOrganizationSchema } from '@setsuzoku/shared';
import { organizationService } from './org.service';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard';
import { tenantGuard } from '../../middleware/tenant.guard';
import { requirePermission } from '../../middleware/rbac.guard';

export const organizationRouter = Router();

// Onboarding: create new organization
organizationRouter.post('/', authGuard, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = CreateOrganizationSchema.parse(req.body);
    const result = await organizationService.create(req.user!.id, validated);
    return res.status(201).json({
      success: true,
      data: result,
      message: 'Organization created successfully',
    });
  } catch (err) {
    next(err);
  }
});

// List all organizations the current user belongs to
organizationRouter.get('/my-orgs', authGuard, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await organizationService.getUserOrganizations(req.user!.id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// Get current organization details
organizationRouter.get(
  '/current',
  authGuard,
  tenantGuard,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const result = await organizationService.getById(req.tenant!.organizationId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Update organization details
organizationRouter.patch(
  '/current',
  authGuard,
  tenantGuard,
  requirePermission('org:settings:update'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = UpdateOrganizationSchema.parse(req.body);
      const result = await organizationService.update(
        req.tenant!.organizationId,
        req.user!.id,
        validated
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Organization details updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

