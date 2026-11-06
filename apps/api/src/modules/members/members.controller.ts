import { Router, Response } from 'express';
import { InviteMemberSchema, UpdateMemberRoleSchema } from '@setsuzoku/shared';
import { membersService } from './members.service';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard';
import { tenantGuard } from '../../middleware/tenant.guard';
import { requirePermission } from '../../middleware/rbac.guard';

export const membersRouter = Router();

// Apply auth and tenant guards across all member routes
membersRouter.use(authGuard);
membersRouter.use(tenantGuard);

// List all members in current organization
membersRouter.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const list = await membersService.getMembers(req.tenant!.organizationId);
    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (err) {
    next(err);
  }
});

// Invite team member
membersRouter.post(
  '/invite',
  requirePermission('members:invite'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = InviteMemberSchema.parse(req.body);
      const result = await membersService.inviteMember(
        req.tenant!.organizationId,
        req.user!.id,
        validated
      );
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Member invited successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Update member role
membersRouter.patch(
  '/:id/role',
  requirePermission('members:roles:update'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = UpdateMemberRoleSchema.parse(req.body);
      const result = await membersService.updateRole(
        req.tenant!.organizationId,
        req.user!.id,
        req.params.id,
        validated.role
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Member role updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Remove member
membersRouter.delete(
  '/:id',
  requirePermission('members:remove'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      await membersService.removeMember(
        req.tenant!.organizationId,
        req.user!.id,
        req.params.id
      );
      return res.status(200).json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

