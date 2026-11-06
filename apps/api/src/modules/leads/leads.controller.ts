import { Router, Response } from 'express';
import {
  CreateLeadSchema,
  UpdateLeadSchema,
  PublicLeadIntakeSchema,
  CreateLeadActivitySchema,
  ConvertLeadToClientSchema,
} from '@setsuzoku/shared';
import { leadsService } from './leads.service';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard';
import { tenantGuard } from '../../middleware/tenant.guard';
import { requirePermission } from '../../middleware/rbac.guard';

export const leadsRouter = Router();

// Public Lead Intake (embed form)
leadsRouter.post('/intake', async (req, res, next) => {
  try {
    const validated = PublicLeadIntakeSchema.parse(req.body);
    const result = await leadsService.publicIntake(validated);
    return res.status(201).json({
      success: true,
      data: result,
      message: 'Inquiry received successfully. Our team will contact you shortly.',
    });
  } catch (err) {
    next(err);
  }
});

// Guarded internal CRM routes
leadsRouter.use(authGuard);
leadsRouter.use(tenantGuard);

// List leads
leadsRouter.get(
  '/',
  requirePermission('leads:read'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const filters = {
        status: req.query.status as any,
        search: req.query.search as string,
        assignedToId: req.query.assignedToId as string,
      };
      const result = await leadsService.getLeads(req.tenant!.organizationId, filters);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Create lead manually
leadsRouter.post(
  '/',
  requirePermission('leads:write'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = CreateLeadSchema.parse(req.body);
      const result = await leadsService.createLead(
        req.tenant!.organizationId,
        validated,
        req.user!.id
      );
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Lead created successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Get lead detail
leadsRouter.get(
  '/:id',
  requirePermission('leads:read'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const result = await leadsService.getLeadById(req.tenant!.organizationId, req.params.id);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Update lead
leadsRouter.patch(
  '/:id',
  requirePermission('leads:write'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = UpdateLeadSchema.parse(req.body);
      const result = await leadsService.updateLead(
        req.tenant!.organizationId,
        req.params.id,
        validated,
        req.user!.id
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Lead updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Add lead activity (call log, note, email)
leadsRouter.post(
  '/:id/activities',
  requirePermission('leads:write'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = CreateLeadActivitySchema.parse(req.body);
      const result = await leadsService.addActivity(
        req.tenant!.organizationId,
        req.params.id,
        validated,
        req.user!.id
      );
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Activity logged successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Convert lead to client
leadsRouter.post(
  '/:id/convert',
  requirePermission('leads:convert'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = ConvertLeadToClientSchema.parse(req.body);
      const result = await leadsService.convertToClient(
        req.tenant!.organizationId,
        req.params.id,
        validated,
        req.user!.id
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Lead converted to formal client profile successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

