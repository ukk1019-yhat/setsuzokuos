import { Router, Response } from 'express';
import {
  CreateDeliverableSchema,
  SubmitDeliverableVersionSchema,
  DecideApprovalSchema,
} from '@setsuzoku/shared';
import { deliverablesService } from './deliverables.service';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard';
import { tenantGuard } from '../../middleware/tenant.guard';
import { requirePermission } from '../../middleware/rbac.guard';

export const deliverablesRouter = Router();

deliverablesRouter.use(authGuard);
deliverablesRouter.use(tenantGuard);

// Create deliverable container
deliverablesRouter.post(
  '/',
  requirePermission('deliverables:submit'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = CreateDeliverableSchema.parse(req.body);
      const result = await deliverablesService.createDeliverable(
        req.tenant!.organizationId,
        validated,
        req.user!.id
      );
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Deliverable registered successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Submit new version
deliverablesRouter.post(
  '/versions',
  requirePermission('deliverables:submit'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = SubmitDeliverableVersionSchema.parse(req.body);
      const result = await deliverablesService.submitVersion(
        req.tenant!.organizationId,
        validated,
        req.user!.id
      );
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Deliverable version submitted for client review',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Get approvals queue
deliverablesRouter.get('/approvals/queue', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await deliverablesService.getApprovalsQueue(req.tenant!.organizationId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// Formal client approval or revision request
deliverablesRouter.post(
  '/approvals/:versionId/decide',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = DecideApprovalSchema.parse(req.body);
      const result = await deliverablesService.decideApproval(
        req.tenant!.organizationId,
        req.params.versionId,
        validated,
        {
          id: req.user!.id,
          fullName: req.user!.fullName,
          role: req.tenant!.role,
        },
        req.ip,
        req.headers['user-agent']
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: `Deliverable marked as ${validated.decision}`,
      });
    } catch (err) {
      next(err);
    }
  }
);

