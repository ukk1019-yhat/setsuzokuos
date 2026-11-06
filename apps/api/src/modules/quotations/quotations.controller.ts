import { Router, Response } from 'express';
import { CreateQuotationSchema } from '@setsuzoku/shared';
import { quotationsService } from './quotations.service';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard';
import { tenantGuard } from '../../middleware/tenant.guard';
import { requirePermission } from '../../middleware/rbac.guard';

export const quotationsRouter = Router();

quotationsRouter.use(authGuard);
quotationsRouter.use(tenantGuard);

// List quotations
quotationsRouter.get(
  '/',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const filters = {
        clientId: req.query.clientId as string,
        status: req.query.status as any,
      };
      const result = await quotationsService.getQuotations(req.tenant!.organizationId, filters);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Create quotation
quotationsRouter.post(
  '/',
  requirePermission('quotations:create'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = CreateQuotationSchema.parse(req.body);
      const result = await quotationsService.createQuotation(
        req.tenant!.organizationId,
        req.user!.id,
        validated
      );
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Quotation created successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Get quotation detail
quotationsRouter.get(
  '/:id',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const result = await quotationsService.getQuotationById(req.tenant!.organizationId, req.params.id);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Send quotation
quotationsRouter.post(
  '/:id/send',
  requirePermission('quotations:send'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const result = await quotationsService.sendQuotation(
        req.tenant!.organizationId,
        req.params.id,
        req.user!.id
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Quotation sent to client',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Accept quotation
quotationsRouter.post(
  '/:id/accept',
  requirePermission('quotations:accept'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const result = await quotationsService.acceptQuotation(
        req.tenant!.organizationId,
        req.params.id,
        req.user!.id
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Quotation accepted. Ready to convert to active project.',
      });
    } catch (err) {
      next(err);
    }
  }
);

