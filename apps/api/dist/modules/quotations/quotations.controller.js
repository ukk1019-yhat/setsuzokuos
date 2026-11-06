"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quotationsRouter = void 0;
const express_1 = require("express");
const shared_1 = require("@setsuzoku/shared");
const quotations_service_1 = require("./quotations.service");
const auth_guard_1 = require("../../middleware/auth.guard");
const tenant_guard_1 = require("../../middleware/tenant.guard");
const rbac_guard_1 = require("../../middleware/rbac.guard");
exports.quotationsRouter = (0, express_1.Router)();
exports.quotationsRouter.use(auth_guard_1.authGuard);
exports.quotationsRouter.use(tenant_guard_1.tenantGuard);
// List quotations
exports.quotationsRouter.get('/', async (req, res, next) => {
    try {
        const filters = {
            clientId: req.query.clientId,
            status: req.query.status,
        };
        const result = await quotations_service_1.quotationsService.getQuotations(req.tenant.organizationId, filters);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Create quotation
exports.quotationsRouter.post('/', (0, rbac_guard_1.requirePermission)('quotations:create'), async (req, res, next) => {
    try {
        const validated = shared_1.CreateQuotationSchema.parse(req.body);
        const result = await quotations_service_1.quotationsService.createQuotation(req.tenant.organizationId, req.user.id, validated);
        return res.status(201).json({
            success: true,
            data: result,
            message: 'Quotation created successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// Get quotation detail
exports.quotationsRouter.get('/:id', async (req, res, next) => {
    try {
        const result = await quotations_service_1.quotationsService.getQuotationById(req.tenant.organizationId, req.params.id);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Send quotation
exports.quotationsRouter.post('/:id/send', (0, rbac_guard_1.requirePermission)('quotations:send'), async (req, res, next) => {
    try {
        const result = await quotations_service_1.quotationsService.sendQuotation(req.tenant.organizationId, req.params.id, req.user.id);
        return res.status(200).json({
            success: true,
            data: result,
            message: 'Quotation sent to client',
        });
    }
    catch (err) {
        next(err);
    }
});
// Accept quotation
exports.quotationsRouter.post('/:id/accept', (0, rbac_guard_1.requirePermission)('quotations:accept'), async (req, res, next) => {
    try {
        const result = await quotations_service_1.quotationsService.acceptQuotation(req.tenant.organizationId, req.params.id, req.user.id);
        return res.status(200).json({
            success: true,
            data: result,
            message: 'Quotation accepted. Ready to convert to active project.',
        });
    }
    catch (err) {
        next(err);
    }
});
