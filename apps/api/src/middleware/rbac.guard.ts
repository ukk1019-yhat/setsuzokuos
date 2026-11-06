import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.guard';
import { MembershipRole, hasPermission } from '@setsuzoku/shared';

export function requireRole(...allowedRoles: MembershipRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.tenant) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Tenant context is missing',
        },
      });
    }

    const currentRole = req.tenant.role as MembershipRole;
    if (currentRole === MembershipRole.SUPER_ADMIN || allowedRoles.includes(currentRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Action requires one of the following roles: ${allowedRoles.join(', ')}. Current role: ${currentRole}`,
      },
    });
  };
}

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.tenant) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Tenant context is missing',
        },
      });
    }

    const currentRole = req.tenant.role as MembershipRole;
    if (hasPermission(currentRole, permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Your role (${currentRole}) lacks the required permission: '${permission}'`,
      },
    });
  };
}

