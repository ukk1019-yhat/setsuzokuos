"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRouter = void 0;
const express_1 = require("express");
const shared_1 = require("@setsuzoku/shared");
const org_service_1 = require("./org.service");
const auth_guard_1 = require("../../middleware/auth.guard");
const tenant_guard_1 = require("../../middleware/tenant.guard");
const rbac_guard_1 = require("../../middleware/rbac.guard");
exports.organizationRouter = (0, express_1.Router)();
// Public organization details for intake / invoices
exports.organizationRouter.get('/public/:slug', async (req, res, next) => {
    try {
        const result = await org_service_1.organizationService.getBySlug(req.params.slug);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Onboarding: create new organization
exports.organizationRouter.post('/', auth_guard_1.authGuard, async (req, res, next) => {
    try {
        const validated = shared_1.CreateOrganizationSchema.parse(req.body);
        const result = await org_service_1.organizationService.create(req.user.id, validated);
        return res.status(201).json({
            success: true,
            data: result,
            message: 'Organization created successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// List all organizations the current user belongs to
exports.organizationRouter.get('/my-orgs', auth_guard_1.authGuard, async (req, res, next) => {
    try {
        const result = await org_service_1.organizationService.getUserOrganizations(req.user.id);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Get current organization details
exports.organizationRouter.get('/current', auth_guard_1.authGuard, tenant_guard_1.tenantGuard, async (req, res, next) => {
    try {
        const result = await org_service_1.organizationService.getById(req.tenant.organizationId);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Update organization details
exports.organizationRouter.patch('/current', auth_guard_1.authGuard, tenant_guard_1.tenantGuard, (0, rbac_guard_1.requirePermission)('org:settings:update'), async (req, res, next) => {
    try {
        const validated = shared_1.UpdateOrganizationSchema.parse(req.body);
        const result = await org_service_1.organizationService.update(req.tenant.organizationId, req.user.id, validated);
        return res.status(200).json({
            success: true,
            data: result,
            message: 'Organization details updated successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
