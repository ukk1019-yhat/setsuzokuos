import { Router, Response } from 'express';
import { CreateClientSchema, UpdateClientSchema } from '@setsuzoku/shared';
import { clientsService } from './clients.service';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard';
import { tenantGuard } from '../../middleware/tenant.guard';
import { requirePermission } from '../../middleware/rbac.guard';

export const clientsRouter = Router();

clientsRouter.use(authGuard);
clientsRouter.use(tenantGuard);

// List clients
clientsRouter.get(
  '/',
  requirePermission('clients:manage'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const search = req.query.search as string;
      const result = await clientsService.getClients(req.tenant!.organizationId, search);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Create client
clientsRouter.post(
  '/',
  requirePermission('clients:manage'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = CreateClientSchema.parse(req.body);
      const result = await clientsService.createClient(
        req.tenant!.organizationId,
        validated,
        req.user!.id
      );
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Client profile created successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Get client detail & 360 dossier
clientsRouter.get(
  '/:id',
  requirePermission('clients:manage'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const result = await clientsService.getClientById(req.tenant!.organizationId, req.params.id);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Update client
clientsRouter.patch(
  '/:id',
  requirePermission('clients:manage'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = UpdateClientSchema.parse(req.body);
      const result = await clientsService.updateClient(
        req.tenant!.organizationId,
        req.params.id,
        validated,
        req.user!.id
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Client profile updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

