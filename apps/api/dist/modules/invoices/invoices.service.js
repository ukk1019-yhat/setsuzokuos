"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoicesService = exports.InvoicesService = void 0;
const db_1 = require("../../storage/db");
const shared_1 = require("@setsuzoku/shared");
class InvoicesService {
    async createInvoice(organizationId, input) {
        const client = await db_1.db.findClientById(input.clientId);
        if (!client || client.organizationId !== organizationId) {
            const err = new Error('Client not found in this organization');
            err.statusCode = 404;
            err.code = 'CLIENT_NOT_FOUND';
            throw err;
        }
        if (input.projectId) {
            const project = await db_1.db.findProjectById(input.projectId);
            if (!project || project.organizationId !== organizationId) {
                const err = new Error('Project not found in this organization');
                err.statusCode = 404;
                err.code = 'PROJECT_NOT_FOUND';
                throw err;
            }
        }
        const { invoice, items } = await db_1.db.createInvoice({
            organizationId,
            clientId: input.clientId,
            projectId: input.projectId,
            invoiceNumber: input.invoiceNumber,
            issuedDate: input.issuedDate,
            dueDate: input.dueDate,
            currency: input.currency || 'INR',
            discountAmount: input.discountAmount || 0,
            taxAmount: input.taxAmount || 0,
            notes: input.notes,
            paymentTerms: input.paymentTerms,
            items: input.items,
        });
        return this.enrichInvoice(organizationId, invoice, items);
    }
    async getInvoices(organizationId, filter) {
        const invoices = await db_1.db.getInvoices(organizationId, filter);
        const enriched = [];
        for (const inv of invoices) {
            const items = await db_1.db.getInvoiceItems(inv.id);
            enriched.push(await this.enrichInvoice(organizationId, inv, items));
        }
        return enriched;
    }
    async getInvoiceById(organizationId, id) {
        const inv = await db_1.db.findInvoiceById(id);
        if (!inv || inv.organizationId !== organizationId) {
            const err = new Error('Invoice not found');
            err.statusCode = 404;
            err.code = 'INVOICE_NOT_FOUND';
            throw err;
        }
        const items = await db_1.db.getInvoiceItems(inv.id);
        const payments = await db_1.db.getPaymentsByInvoice(inv.id);
        const paymentDtos = payments.map((p) => ({
            id: p.id,
            organizationId: p.organizationId,
            invoiceId: p.invoiceId,
            invoiceNumber: inv.invoiceNumber,
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
        }));
        const result = await this.enrichInvoice(organizationId, inv, items);
        result.payments = paymentDtos;
        return result;
    }
    async updateInvoice(organizationId, id, input) {
        const inv = await db_1.db.findInvoiceById(id);
        if (!inv || inv.organizationId !== organizationId) {
            const err = new Error('Invoice not found');
            err.statusCode = 404;
            err.code = 'INVOICE_NOT_FOUND';
            throw err;
        }
        const updates = {};
        if (input.status)
            updates.status = input.status;
        if (input.dueDate)
            updates.dueDate = new Date(input.dueDate);
        if (input.notes !== undefined)
            updates.notes = input.notes;
        if (input.paymentTerms !== undefined)
            updates.paymentTerms = input.paymentTerms;
        const updated = await db_1.db.updateInvoice(id, updates);
        const items = await db_1.db.getInvoiceItems(updated.id);
        return this.enrichInvoice(organizationId, updated, items);
    }
    async deleteInvoice(organizationId, id) {
        const inv = await db_1.db.findInvoiceById(id);
        if (!inv || inv.organizationId !== organizationId) {
            const err = new Error('Invoice not found');
            err.statusCode = 404;
            err.code = 'INVOICE_NOT_FOUND';
            throw err;
        }
        if (inv.status === shared_1.InvoiceStatus.PAID) {
            const err = new Error('Cannot delete an invoice that has been marked as PAID');
            err.statusCode = 400;
            err.code = 'CANNOT_DELETE_PAID_INVOICE';
            throw err;
        }
        await db_1.db.deleteInvoice(id);
    }
    async enrichInvoice(organizationId, inv, items) {
        const client = await db_1.db.findClientById(inv.clientId);
        let project = null;
        if (inv.projectId) {
            const pr = await db_1.db.findProjectById(inv.projectId);
            if (pr) {
                project = {
                    id: pr.id,
                    name: pr.name,
                    code: pr.code,
                };
            }
        }
        const itemDtos = items.map((it) => ({
            id: it.id,
            invoiceId: it.invoiceId,
            serviceName: it.serviceName,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            totalPrice: it.totalPrice,
        }));
        return {
            id: inv.id,
            organizationId: inv.organizationId,
            clientId: inv.clientId,
            client: client
                ? {
                    id: client.id,
                    organizationId: client.organizationId,
                    name: client.name,
                    company: client.company,
                    email: client.email,
                    phone: client.phone,
                    billingAddress: client.billingAddress,
                    taxId: client.taxId,
                    category: client.category,
                    notes: client.notes,
                    createdAt: client.createdAt.toISOString(),
                    updatedAt: client.updatedAt.toISOString(),
                }
                : undefined,
            projectId: inv.projectId,
            project,
            invoiceNumber: inv.invoiceNumber,
            status: inv.status,
            subtotal: inv.subtotal,
            discountAmount: inv.discountAmount,
            taxAmount: inv.taxAmount,
            totalAmount: inv.totalAmount,
            amountPaid: inv.amountPaid,
            balanceDue: inv.balanceDue,
            currency: inv.currency,
            issuedDate: inv.issuedDate.toISOString(),
            dueDate: inv.dueDate.toISOString(),
            notes: inv.notes,
            paymentTerms: inv.paymentTerms,
            createdAt: inv.createdAt.toISOString(),
            updatedAt: inv.updatedAt.toISOString(),
            items: itemDtos,
        };
    }
}
exports.InvoicesService = InvoicesService;
exports.invoicesService = new InvoicesService();
