"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadsRouter = void 0;
const express_1 = require("express");
const shared_1 = require("@setsuzoku/shared");
const leads_service_1 = require("./leads.service");
const auth_guard_1 = require("../../middleware/auth.guard");
const tenant_guard_1 = require("../../middleware/tenant.guard");
const rbac_guard_1 = require("../../middleware/rbac.guard");
exports.leadsRouter = (0, express_1.Router)();
// Public Lead Intake (embed form)
exports.leadsRouter.post('/intake', async (req, res, next) => {
    try {
        const validated = shared_1.PublicLeadIntakeSchema.parse(req.body);
        const result = await leads_service_1.leadsService.publicIntake(validated);
        return res.status(201).json({
            success: true,
            data: result,
            message: 'Inquiry received successfully. Our team will contact you shortly.',
        });
    }
    catch (err) {
        next(err);
    }
});
// Guarded internal CRM routes
exports.leadsRouter.use(auth_guard_1.authGuard);
exports.leadsRouter.use(tenant_guard_1.tenantGuard);
// List leads
exports.leadsRouter.get('/', (0, rbac_guard_1.requirePermission)('leads:read'), async (req, res, next) => {
    try {
        const filters = {
            status: req.query.status,
            search: req.query.search,
            assignedToId: req.query.assignedToId,
        };
        const result = await leads_service_1.leadsService.getLeads(req.tenant.organizationId, filters);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Create lead manually
exports.leadsRouter.post('/', (0, rbac_guard_1.requirePermission)('leads:write'), async (req, res, next) => {
    try {
        const validated = shared_1.CreateLeadSchema.parse(req.body);
        const result = await leads_service_1.leadsService.createLead(req.tenant.organizationId, validated, req.user.id);
        return res.status(201).json({
            success: true,
            data: result,
            message: 'Lead created successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// Get lead detail
exports.leadsRouter.get('/:id', (0, rbac_guard_1.requirePermission)('leads:read'), async (req, res, next) => {
    try {
        const result = await leads_service_1.leadsService.getLeadById(req.tenant.organizationId, req.params.id);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Update lead
exports.leadsRouter.patch('/:id', (0, rbac_guard_1.requirePermission)('leads:write'), async (req, res, next) => {
    try {
        const validated = shared_1.UpdateLeadSchema.parse(req.body);
        const result = await leads_service_1.leadsService.updateLead(req.tenant.organizationId, req.params.id, validated, req.user.id);
        return res.status(200).json({
            success: true,
            data: result,
            message: 'Lead updated successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// Add lead activity (call log, note, email)
exports.leadsRouter.post('/:id/activities', (0, rbac_guard_1.requirePermission)('leads:write'), async (req, res, next) => {
    try {
        const validated = shared_1.CreateLeadActivitySchema.parse(req.body);
        const result = await leads_service_1.leadsService.addActivity(req.tenant.organizationId, req.params.id, validated, req.user.id);
        return res.status(201).json({
            success: true,
            data: result,
            message: 'Activity logged successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// Convert lead to client
exports.leadsRouter.post('/:id/convert', (0, rbac_guard_1.requirePermission)('leads:convert'), async (req, res, next) => {
    try {
        const validated = shared_1.ConvertLeadToClientSchema.parse(req.body);
        const result = await leads_service_1.leadsService.convertToClient(req.tenant.organizationId, req.params.id, validated, req.user.id);
        return res.status(200).json({
            success: true,
            data: result,
            message: 'Lead converted to formal client profile successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
