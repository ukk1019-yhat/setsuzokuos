import { Router, Response } from 'express';
import { clientPortalService } from './portal.service';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard';
import { tenantGuard } from '../../middleware/tenant.guard';

export const portalRouter = Router();

portalRouter.use(authGuard);
portalRouter.use(tenantGuard);

portalRouter.get('/dashboard', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await clientPortalService.getClientDashboard(
      req.tenant!.organizationId,
      req.user!.email
    );
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

