"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.membersRouter = void 0;
const express_1 = require("express");
const shared_1 = require("@setsuzoku/shared");
const members_service_1 = require("./members.service");
const auth_guard_1 = require("../../middleware/auth.guard");
const tenant_guard_1 = require("../../middleware/tenant.guard");
const rbac_guard_1 = require("../../middleware/rbac.guard");
exports.membersRouter = (0, express_1.Router)();
// Apply auth and tenant guards across all member routes
exports.membersRouter.use(auth_guard_1.authGuard);
exports.membersRouter.use(tenant_guard_1.tenantGuard);
// List all members in current organization
exports.membersRouter.get('/', async (req, res, next) => {
    try {
        const list = await members_service_1.membersService.getMembers(req.tenant.organizationId);
        return res.status(200).json({
            success: true,
            data: list,
        });
    }
    catch (err) {
        next(err);
    }
});
// Invite team member
exports.membersRouter.post('/invite', (0, rbac_guard_1.requirePermission)('members:invite'), async (req, res, next) => {
    try {
        const validated = shared_1.InviteMemberSchema.parse(req.body);
        const result = await members_service_1.membersService.inviteMember(req.tenant.organizationId, req.user.id, validated);
        return res.status(201).json({
            success: true,
            data: result,
            message: 'Member invited successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// Update member role
exports.membersRouter.patch('/:id/role', (0, rbac_guard_1.requirePermission)('members:roles:update'), async (req, res, next) => {
    try {
        const validated = shared_1.UpdateMemberRoleSchema.parse(req.body);
        const result = await members_service_1.membersService.updateRole(req.tenant.organizationId, req.user.id, req.params.id, validated.role);
        return res.status(200).json({
            success: true,
            data: result,
            message: 'Member role updated successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// Remove member
exports.membersRouter.delete('/:id', (0, rbac_guard_1.requirePermission)('members:remove'), async (req, res, next) => {
    try {
        await members_service_1.membersService.removeMember(req.tenant.organizationId, req.user.id, req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Member removed successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
