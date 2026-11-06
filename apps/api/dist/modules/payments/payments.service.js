"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsService = exports.PaymentsService = void 0;
const db_1 = require("../../storage/db");
const shared_1 = require("@setsuzoku/shared");
const crypto_1 = __importDefault(require("crypto"));
class PaymentsService {
    webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_razorpay_secret_key_12345';
    async recordManualPayment(organizationId, input, recordedById) {
        const invoice = await db_1.db.findInvoiceById(input.invoiceId);
        if (!invoice || invoice.organizationId !== organizationId) {
            const err = new Error('Invoice not found in this organization');
            err.statusCode = 404;
            err.code = 'INVOICE_NOT_FOUND';
            throw err;
        }
        if (invoice.status === shared_1.InvoiceStatus.PAID || invoice.balanceDue <= 0) {
            const err = new Error('Invoice is already fully paid');
            err.statusCode = 400;
            err.code = 'INVOICE_ALREADY_PAID';
            throw err;
        }
        if (input.amount <= 0) {
            const err = new Error('Payment amount must be greater than zero');
            err.statusCode = 400;
            err.code = 'INVALID_PAYMENT_AMOUNT';
            throw err;
        }
        const payment = await db_1.db.recordPayment({
            organizationId,
            invoiceId: input.invoiceId,
            amount: input.amount,
            currency: input.currency || invoice.currency,
            method: input.method,
            status: shared_1.PaymentStatus.VERIFIED,
            isManual: input.isManual ?? true,
            transactionRef: input.transactionRef,
            receiptNumber: input.receiptNumber,
            notes: input.notes,
            recordedById,
        });
        return {
            id: payment.id,
            organizationId: payment.organizationId,
            invoiceId: payment.invoiceId,
            invoiceNumber: invoice.invoiceNumber,
            amount: payment.amount,
            currency: payment.currency,
            method: payment.method,
            status: payment.status,
            isManual: payment.isManual,
            transactionRef: payment.transactionRef,
            gatewayOrderId: payment.gatewayOrderId,
            receiptNumber: payment.receiptNumber,
            notes: payment.notes,
            verifiedAt: payment.verifiedAt ? payment.verifiedAt.toISOString() : null,
            recordedById: payment.recordedById,
            createdAt: payment.createdAt.toISOString(),
        };
    }
    async getPayments(organizationId, filter) {
        const payments = await db_1.db.getPayments(organizationId, filter);
        const enriched = [];
        for (const p of payments) {
            const inv = await db_1.db.findInvoiceById(p.invoiceId);
            enriched.push({
                id: p.id,
                organizationId: p.organizationId,
                invoiceId: p.invoiceId,
                invoiceNumber: inv?.invoiceNumber,
                amount: p.amount,
                currency: p.currency,
                method: p.method,
                status: p.status,
                isManual: p.isManual,
                transactionRef: p.transactionRef,
                gatewayOrderId: p.gatewayOrderId,
                receiptNumber: p.receiptNumber,
                notes: p.notes,
                verifiedAt: p.verifiedAt ? p.verifiedAt.toISOString() : null,
                recordedById: p.recordedById,
                createdAt: p.createdAt.toISOString(),
            });
        }
        return enriched;
    }
    async getPaymentById(organizationId, id) {
        const payment = await db_1.db.findPaymentById(id);
        if (!payment || payment.organizationId !== organizationId) {
            const err = new Error('Payment not found');
            err.statusCode = 404;
            err.code = 'PAYMENT_NOT_FOUND';
            throw err;
        }
        const inv = await db_1.db.findInvoiceById(payment.invoiceId);
        return {
            id: payment.id,
            organizationId: payment.organizationId,
            invoiceId: payment.invoiceId,
            invoiceNumber: inv?.invoiceNumber,
            amount: payment.amount,
            currency: payment.currency,
            method: payment.method,
            status: payment.status,
            isManual: payment.isManual,
            transactionRef: payment.transactionRef,
            gatewayOrderId: payment.gatewayOrderId,
            receiptNumber: payment.receiptNumber,
            notes: payment.notes,
            verifiedAt: payment.verifiedAt ? payment.verifiedAt.toISOString() : null,
            recordedById: payment.recordedById,
            createdAt: payment.createdAt.toISOString(),
        };
    }
    async createRazorpayOrder(organizationId, input) {
        const invoice = await db_1.db.findInvoiceById(input.invoiceId);
        if (!invoice || invoice.organizationId !== organizationId) {
            const err = new Error('Invoice not found in this organization');
            err.statusCode = 404;
            err.code = 'INVOICE_NOT_FOUND';
            throw err;
        }
        if (invoice.balanceDue <= 0 || invoice.status === shared_1.InvoiceStatus.PAID) {
            const err = new Error('Invoice has no outstanding balance');
            err.statusCode = 400;
            err.code = 'NO_BALANCE_DUE';
            throw err;
        }
        const chargeAmount = input.amount
            ? Math.min(input.amount, invoice.balanceDue)
            : invoice.balanceDue;
        const orderId = `order_${crypto_1.default.randomUUID().replace(/-/g, '').slice(0, 16)}`;
        const amountInPaise = Math.round(chargeAmount * 100);
        return {
            orderId,
            amount: amountInPaise,
            chargeAmount,
            currency: invoice.currency,
            receipt: invoice.invoiceNumber,
            notes: {
                invoiceId: invoice.id,
                organizationId: invoice.organizationId,
            },
        };
    }
    async processRazorpayWebhook(rawBody, signature, payload) {
        if (!signature) {
            const err = new Error('Missing Razorpay webhook signature header');
            err.statusCode = 400;
            err.code = 'MISSING_SIGNATURE';
            throw err;
        }
        // Verify HMAC SHA-256 signature
        const expectedSignature = crypto_1.default
            .createHmac('sha256', this.webhookSecret)
            .update(rawBody)
            .digest('hex');
        const signatureBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);
        if (signatureBuffer.length !== expectedBuffer.length ||
            !crypto_1.default.timingSafeEqual(signatureBuffer, expectedBuffer)) {
            const err = new Error('Invalid Razorpay signature');
            err.statusCode = 400;
            err.code = 'INVALID_SIGNATURE';
            throw err;
        }
        const eventId = payload.event_id || payload.id || `evt_${crypto_1.default.randomUUID()}`;
        const eventType = payload.event;
        // Idempotency check: Record webhook event
        const webhookRecord = await db_1.db.recordPaymentWebhookEvent({
            gateway: 'RAZORPAY',
            eventId,
            eventType,
            payload,
            signature,
            isVerified: true,
        });
        let paymentRecord = null;
        // Handle payment.captured or order.paid
        if (eventType === 'payment.captured' || eventType === 'order.paid') {
            const paymentEntity = payload.payload?.payment?.entity || payload.entity;
            const notes = paymentEntity?.notes || {};
            const invoiceId = notes.invoiceId;
            const organizationId = notes.organizationId;
            const amount = paymentEntity?.amount ? paymentEntity.amount / 100 : 0;
            const transactionRef = paymentEntity?.id;
            const gatewayOrderId = paymentEntity?.order_id;
            if (invoiceId && organizationId && amount > 0) {
                paymentRecord = await db_1.db.recordPayment({
                    organizationId,
                    invoiceId,
                    amount,
                    currency: paymentEntity?.currency || 'INR',
                    method: shared_1.PaymentMethod.RAZORPAY,
                    status: shared_1.PaymentStatus.VERIFIED,
                    isManual: false,
                    transactionRef,
                    gatewayOrderId,
                    receiptNumber: `RZP-${transactionRef}`,
                    notes: `Razorpay Webhook: ${eventType}`,
                });
                webhookRecord.paymentId = paymentRecord.id;
            }
        }
        return {
            status: 'PROCESSED',
            eventId,
            eventType,
            paymentId: paymentRecord?.id,
        };
    }
}
exports.PaymentsService = PaymentsService;
exports.paymentsService = new PaymentsService();
