"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantGuard = tenantGuard;
const db_1 = require("../storage/db");
async function tenantGuard(req, res, next) {
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
    let orgId = req.headers['x-organization-id'] || req.query.organizationId;
    // If no org specified, fallback to user's first active membership
    if (!orgId) {
        const userMemberships = await db_1.db.getUserMemberships(req.user.id);
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
    const membership = await db_1.db.findMembership(orgId, req.user.id);
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
    req.organizationId = orgId;
    next();
}
