import { Router, Request, Response, NextFunction } from 'express';
import { authGuard } from '../../middleware/auth.guard';
import { tenantGuard } from '../../middleware/tenant.guard';
import { requirePermission } from '../../middleware/rbac.guard';
import { reportsService } from './reports.service';

export const reportsRouter = Router();

reportsRouter.use(authGuard);
reportsRouter.use(tenantGuard);

// 1. Get Live Business Overview Intelligence Report
reportsRouter.get(
  '/overview',
  requirePermission('reports:view'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = (req as any).tenant?.organizationId || (req as any).organizationId;
      const overview = await reportsService.getBusinessOverview(organizationId);

      res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (err) {
      next(err);
    }
  }
);
