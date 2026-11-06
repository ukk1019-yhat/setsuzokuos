"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoicesRouter = void 0;
const express_1 = require("express");
const auth_guard_1 = require("../../middleware/auth.guard");
const tenant_guard_1 = require("../../middleware/tenant.guard");
const rbac_guard_1 = require("../../middleware/rbac.guard");
const shared_1 = require("@setsuzoku/shared");
const invoices_service_1 = require("./invoices.service");
exports.invoicesRouter = (0, express_1.Router)();
// Apply authGuard and tenantGuard to all invoice management routes
exports.invoicesRouter.use(auth_guard_1.authGuard);
exports.invoicesRouter.use(tenant_guard_1.tenantGuard);
// 1. Create Invoice
exports.invoicesRouter.post('/', (0, rbac_guard_1.requirePermission)('invoices:create'), async (req, res, next) => {
    try {
        const validated = shared_1.CreateInvoiceSchema.parse(req.body);
        const organizationId = req.tenant?.organizationId || req.organizationId;
        const invoice = await invoices_service_1.invoicesService.createInvoice(organizationId, validated);
        res.status(201).json({
            success: true,
            data: invoice,
            message: 'Invoice created successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// 2. List Invoices with optional filters
exports.invoicesRouter.get('/', (0, rbac_guard_1.requirePermission)('invoices:view'), async (req, res, next) => {
    try {
        const organizationId = req.tenant?.organizationId || req.organizationId;
        const { clientId, status, projectId } = req.query;
        const invoices = await invoices_service_1.invoicesService.getInvoices(organizationId, {
            clientId: clientId,
            status: status,
            projectId: projectId,
        });
        res.status(200).json({
            success: true,
            data: invoices,
        });
    }
    catch (err) {
        next(err);
    }
});
// 3. Get Invoice Details
exports.invoicesRouter.get('/:id', (0, rbac_guard_1.requirePermission)('invoices:view'), async (req, res, next) => {
    try {
        const organizationId = req.tenant?.organizationId || req.organizationId;
        const invoice = await invoices_service_1.invoicesService.getInvoiceById(organizationId, req.params.id);
        res.status(200).json({
            success: true,
            data: invoice,
        });
    }
    catch (err) {
        next(err);
    }
});
// 4. Update Invoice
exports.invoicesRouter.patch('/:id', (0, rbac_guard_1.requirePermission)('invoices:manage'), async (req, res, next) => {
    try {
        const validated = shared_1.UpdateInvoiceSchema.parse(req.body);
        const organizationId = req.tenant?.organizationId || req.organizationId;
        const invoice = await invoices_service_1.invoicesService.updateInvoice(organizationId, req.params.id, validated);
        res.status(200).json({
            success: true,
            data: invoice,
            message: 'Invoice updated successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// 5. Delete Invoice
exports.invoicesRouter.delete('/:id', (0, rbac_guard_1.requirePermission)('invoices:manage'), async (req, res, next) => {
    try {
        const organizationId = req.tenant?.organizationId || req.organizationId;
        await invoices_service_1.invoicesService.deleteInvoice(organizationId, req.params.id);
        res.status(200).json({
            success: true,
            message: 'Invoice deleted successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
