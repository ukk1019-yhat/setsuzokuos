"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quotationsService = exports.QuotationsService = void 0;
const db_1 = require("../../storage/db");
const shared_1 = require("@setsuzoku/shared");
class QuotationsService {
    // Decimal-safe fixed arithmetic helper (rounds to 2 decimal places cleanly)
    round(val) {
        return Math.round((val + Number.EPSILON) * 100) / 100;
    }
    async formatQuotation(item) {
        const q = item.quotation;
        const client = await db_1.db.findClientById(q.clientId);
        const user = await db_1.db.findUserById(q.createdById);
        return {
            ...q,
            createdAt: q.createdAt.toISOString(),
            updatedAt: q.updatedAt.toISOString(),
            validUntil: q.validUntil.toISOString(),
            client: client
                ? {
                    ...client,
                    createdAt: client.createdAt.toISOString(),
                    updatedAt: client.updatedAt.toISOString(),
                }
                : undefined,
            createdBy: user
                ? {
                    id: user.id,
                    fullName: user.fullName,
                }
                : undefined,
            items: item.items.map((i) => ({
                id: i.id,
                quotationId: i.quotationId,
                serviceName: i.serviceName,
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                totalPrice: i.totalPrice,
            })),
        };
    }
    async getQuotations(organizationId, filters) {
        const list = await db_1.db.getQuotations(organizationId, filters);
        return Promise.all(list.map((q) => this.formatQuotation(q)));
    }
    async getQuotationById(organizationId, id) {
        const found = await db_1.db.findQuotationById(id);
        if (!found || found.quotation.organizationId !== organizationId) {
            const err = new Error('Quotation not found');
            err.statusCode = 404;
            err.code = 'QUOTATION_NOT_FOUND';
            throw err;
        }
        return this.formatQuotation(found);
    }
    async createQuotation(organizationId, createdById, input) {
        const client = await db_1.db.findClientById(input.clientId);
        if (!client || client.organizationId !== organizationId) {
            const err = new Error('Client not found');
            err.statusCode = 404;
            err.code = 'CLIENT_NOT_FOUND';
            throw err;
        }
        // Decimal-safe calculations for line items
        let subtotal = 0;
        const computedItems = input.items.map((item) => {
            const lineTotal = this.round(item.quantity * item.unitPrice);
            subtotal = this.round(subtotal + lineTotal);
            return {
                serviceName: item.serviceName,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: lineTotal,
            };
        });
        const discountAmount = this.round(input.discountAmount || 0);
        const taxAmount = this.round(input.taxAmount || 0);
        const totalAmount = this.round(subtotal - discountAmount + taxAmount);
        const quoteNumber = input.quoteNumber ||
            `QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const org = await db_1.db.findOrgById(organizationId);
        const created = await db_1.db.createQuotation({
            organizationId,
            clientId: input.clientId,
            createdById,
            quoteNumber,
            subtotal,
            discountAmount,
            taxAmount,
            totalAmount,
            currency: org?.currency || 'INR',
            validUntil: new Date(input.validUntil),
            paymentTerms: input.paymentTerms,
            notes: input.notes,
        }, computedItems);
        await db_1.db.logAudit({
            organizationId,
            userId: createdById,
            action: 'QUOTATION_CREATED',
            resource: 'Quotation',
            resourceId: created.quotation.id,
            diff: { quoteNumber, totalAmount },
        });
        return this.formatQuotation(created);
    }
    async sendQuotation(organizationId, id, userId) {
        const found = await db_1.db.findQuotationById(id);
        if (!found || found.quotation.organizationId !== organizationId) {
            const err = new Error('Quotation not found');
            err.statusCode = 404;
            err.code = 'QUOTATION_NOT_FOUND';
            throw err;
        }
        const updated = await db_1.db.updateQuotationStatus(id, shared_1.QuotationStatus.SENT);
        await db_1.db.logAudit({
            organizationId,
            userId,
            action: 'QUOTATION_SENT',
            resource: 'Quotation',
            resourceId: id,
        });
        return this.formatQuotation({ quotation: updated, items: found.items });
    }
    async acceptQuotation(organizationId, id, userId) {
        const found = await db_1.db.findQuotationById(id);
        if (!found || found.quotation.organizationId !== organizationId) {
            const err = new Error('Quotation not found');
            err.statusCode = 404;
            err.code = 'QUOTATION_NOT_FOUND';
            throw err;
        }
        if (found.quotation.status === shared_1.QuotationStatus.ACCEPTED) {
            return this.formatQuotation(found);
        }
        const updated = await db_1.db.updateQuotationStatus(id, shared_1.QuotationStatus.ACCEPTED);
        await db_1.db.logAudit({
            organizationId,
            userId,
            action: 'QUOTATION_ACCEPTED',
            resource: 'Quotation',
            resourceId: id,
        });
        return this.formatQuotation({ quotation: updated, items: found.items });
    }
}
exports.QuotationsService = QuotationsService;
exports.quotationsService = new QuotationsService();
