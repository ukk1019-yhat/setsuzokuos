import { Router, Request, Response, NextFunction } from 'express';
import { authGuard } from '../../middleware/auth.guard';
import { tenantGuard } from '../../middleware/tenant.guard';
import { requirePermission } from '../../middleware/rbac.guard';
import {
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
  InvoiceStatus,
} from '@setsuzoku/shared';
import { invoicesService } from './invoices.service';

export const invoicesRouter = Router();

// Apply authGuard and tenantGuard to all invoice management routes
invoicesRouter.use(authGuard);
invoicesRouter.use(tenantGuard);

// 1. Create Invoice
invoicesRouter.post(
  '/',
  requirePermission('invoices:create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = CreateInvoiceSchema.parse(req.body);
      const organizationId = (req as any).tenant?.organizationId || (req as any).organizationId;

      const invoice = await invoicesService.createInvoice(
        organizationId,
        validated,
        (req as any).user?.id,
        req.ip || (req.headers['x-forwarded-for'] as string),
        req.headers['user-agent'] as string
      );
      res.status(201).json({
        success: true,
        data: invoice,
        message: 'Invoice created successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// 2. List Invoices with optional filters
invoicesRouter.get(
  '/',
  requirePermission('invoices:view'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = (req as any).tenant?.organizationId || (req as any).organizationId;
      const { clientId, status, projectId } = req.query;

      const invoices = await invoicesService.getInvoices(organizationId, {
        clientId: clientId as string | undefined,
        status: status as InvoiceStatus | undefined,
        projectId: projectId as string | undefined,
      });

      res.status(200).json({
        success: true,
        data: invoices,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 3. Get Invoice Details
invoicesRouter.get(
  '/:id',
  requirePermission('invoices:view'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = (req as any).tenant?.organizationId || (req as any).organizationId;
      const invoice = await invoicesService.getInvoiceById(organizationId, req.params.id);

      res.status(200).json({
        success: true,
        data: invoice,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 4. Update Invoice
invoicesRouter.patch(
  '/:id',
  requirePermission('invoices:manage'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = UpdateInvoiceSchema.parse(req.body);
      const organizationId = (req as any).tenant?.organizationId || (req as any).organizationId;

      const invoice = await invoicesService.updateInvoice(
        organizationId,
        req.params.id,
        validated,
        (req as any).user?.id,
        req.ip || (req.headers['x-forwarded-for'] as string),
        req.headers['user-agent'] as string
      );

      res.status(200).json({
        success: true,
        data: invoice,
        message: 'Invoice updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// 5. Delete Invoice
invoicesRouter.delete(
  '/:id',
  requirePermission('invoices:manage'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = (req as any).tenant?.organizationId || (req as any).organizationId;
      await invoicesService.deleteInvoice(
        organizationId,
        req.params.id,
        (req as any).user?.id,
        req.ip || (req.headers['x-forwarded-for'] as string),
        req.headers['user-agent'] as string
      );

      res.status(200).json({
        success: true,
        message: 'Invoice deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);
