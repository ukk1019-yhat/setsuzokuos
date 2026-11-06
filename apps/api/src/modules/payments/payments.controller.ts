import { Router, Request, Response, NextFunction } from 'express';
import { authGuard } from '../../middleware/auth.guard';
import { tenantGuard } from '../../middleware/tenant.guard';
import { requirePermission } from '../../middleware/rbac.guard';
import {
  RecordPaymentSchema,
  RazorpayCreateOrderSchema,
  PaymentStatus,
} from '@setsuzoku/shared';
import { paymentsService } from './payments.service';

export const paymentsRouter = Router();

// 1. Webhook endpoint (MUST be before authenticated routes and NOT require authGuard)
paymentsRouter.post('/razorpay/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = (req.headers['x-razorpay-signature'] as string) || '';
    // If rawBody is not set on req, serialize req.body
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    const result = await paymentsService.processRazorpayWebhook(rawBody, signature, req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// Authenticated & Tenant-scoped routes
paymentsRouter.use(authGuard);
paymentsRouter.use(tenantGuard);

// 2. Record Manual Payment
paymentsRouter.post(
  '/record',
  requirePermission('payments:record'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = RecordPaymentSchema.parse(req.body);
      const organizationId = (req as any).tenant?.organizationId || (req as any).organizationId;
      const userId = (req as any).user?.id;

      const payment = await paymentsService.recordManualPayment(
        organizationId,
        validated,
        userId
      );

      res.status(201).json({
        success: true,
        data: payment,
        message: 'Payment recorded and balance updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// 3. Create Razorpay Payment Order
paymentsRouter.post(
  '/razorpay/order',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = RazorpayCreateOrderSchema.parse(req.body);
      const organizationId = (req as any).tenant?.organizationId || (req as any).organizationId;

      const order = await paymentsService.createRazorpayOrder(organizationId, validated);

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 4. List Payments
paymentsRouter.get(
  '/',
  requirePermission('payments:view'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = (req as any).tenant?.organizationId || (req as any).organizationId;
      const { invoiceId, status } = req.query;

      const payments = await paymentsService.getPayments(organizationId, {
        invoiceId: invoiceId as string | undefined,
        status: status as PaymentStatus | undefined,
      });

      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 5. Get Payment by ID
paymentsRouter.get(
  '/:id',
  requirePermission('payments:view'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = (req as any).tenant?.organizationId || (req as any).organizationId;
      const payment = await paymentsService.getPaymentById(organizationId, req.params.id);

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  }
);
