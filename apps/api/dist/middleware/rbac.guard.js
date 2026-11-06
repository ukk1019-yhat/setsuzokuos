"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
exports.requirePermission = requirePermission;
const shared_1 = require("@setsuzoku/shared");
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.tenant) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Tenant context is missing',
                },
            });
        }
        const currentRole = req.tenant.role;
        if (currentRole === shared_1.MembershipRole.SUPER_ADMIN || allowedRoles.includes(currentRole)) {
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
function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.tenant) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Tenant context is missing',
                },
            });
        }
        const currentRole = req.tenant.role;
        if ((0, shared_1.hasPermission)(currentRole, permission)) {
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
