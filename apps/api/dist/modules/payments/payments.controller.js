"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsRouter = void 0;
const express_1 = require("express");
const auth_guard_1 = require("../../middleware/auth.guard");
const tenant_guard_1 = require("../../middleware/tenant.guard");
const rbac_guard_1 = require("../../middleware/rbac.guard");
const shared_1 = require("@setsuzoku/shared");
const payments_service_1 = require("./payments.service");
exports.paymentsRouter = (0, express_1.Router)();
// 1. Webhook endpoint (MUST be before authenticated routes and NOT require authGuard)
exports.paymentsRouter.post('/razorpay/webhook', async (req, res, next) => {
    try {
        const signature = req.headers['x-razorpay-signature'] || '';
        // If rawBody is not set on req, serialize req.body
        const rawBody = req.rawBody || JSON.stringify(req.body);
        const result = await payments_service_1.paymentsService.processRazorpayWebhook(rawBody, signature, req.body);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Authenticated & Tenant-scoped routes
exports.paymentsRouter.use(auth_guard_1.authGuard);
exports.paymentsRouter.use(tenant_guard_1.tenantGuard);
// 2. Record Manual Payment
exports.paymentsRouter.post('/record', (0, rbac_guard_1.requirePermission)('payments:record'), async (req, res, next) => {
    try {
        const validated = shared_1.RecordPaymentSchema.parse(req.body);
        const organizationId = req.tenant?.organizationId || req.organizationId;
        const userId = req.user?.id;
        const payment = await payments_service_1.paymentsService.recordManualPayment(organizationId, validated, userId);
        res.status(201).json({
            success: true,
            data: payment,
            message: 'Payment recorded and balance updated successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// 3. Create Razorpay Payment Order
exports.paymentsRouter.post('/razorpay/order', async (req, res, next) => {
    try {
        const validated = shared_1.RazorpayCreateOrderSchema.parse(req.body);
        const organizationId = req.tenant?.organizationId || req.organizationId;
        const order = await payments_service_1.paymentsService.createRazorpayOrder(organizationId, validated);
        res.status(200).json({
            success: true,
            data: order,
        });
    }
    catch (err) {
        next(err);
    }
});
// 4. List Payments
exports.paymentsRouter.get('/', (0, rbac_guard_1.requirePermission)('payments:view'), async (req, res, next) => {
    try {
        const organizationId = req.tenant?.organizationId || req.organizationId;
        const { invoiceId, status } = req.query;
        const payments = await payments_service_1.paymentsService.getPayments(organizationId, {
            invoiceId: invoiceId,
            status: status,
        });
        res.status(200).json({
            success: true,
            data: payments,
        });
    }
    catch (err) {
        next(err);
    }
});
// 5. Get Payment by ID
exports.paymentsRouter.get('/:id', (0, rbac_guard_1.requirePermission)('payments:view'), async (req, res, next) => {
    try {
        const organizationId = req.tenant?.organizationId || req.organizationId;
        const payment = await payments_service_1.paymentsService.getPaymentById(organizationId, req.params.id);
        res.status(200).json({
            success: true,
            data: payment,
        });
    }
    catch (err) {
        next(err);
    }
});
