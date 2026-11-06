import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.guard';
import { db } from '../storage/db';

export async function tenantGuard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required prior to tenant verification',
      },
    });
  }

  // Read organization ID from header or query param
  let orgId = (req.headers['x-organization-id'] as string) || (req.query.organizationId as string);

  // If no org specified, fallback to user's first active membership
  if (!orgId) {
    const userMemberships = await db.getUserMemberships(req.user.id);
    if (userMemberships.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_ORGANIZATION',
          message: 'User does not belong to any organization. Please complete organization onboarding.',
        },
      });
    }
    orgId = userMemberships[0].organization.id;
  }

  // Verify membership and fetch role
  const membership = await db.findMembership(orgId, req.user.id);
  if (!membership || !membership.isActive) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'TENANT_FORBIDDEN',
        message: 'You are not an active member of this organization',
      },
    });
  }

  req.tenant = {
    organizationId: orgId,
    role: membership.role,
    membershipId: membership.id,
  };
  (req as any).organizationId = orgId;

  next();
}

