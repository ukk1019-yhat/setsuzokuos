"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientsService = exports.ClientsService = void 0;
const db_1 = require("../../storage/db");
class ClientsService {
    async formatClient(client) {
        const quotations = await db_1.db.getQuotations(client.organizationId, { clientId: client.id });
        const totalInvoiced = quotations
            .filter((q) => q.quotation.status === 'ACCEPTED')
            .reduce((sum, q) => sum + q.quotation.totalAmount, 0);
        return {
            ...client,
            createdAt: client.createdAt.toISOString(),
            updatedAt: client.updatedAt.toISOString(),
            stats: {
                totalQuotations: quotations.length,
                totalProjects: client.projectsCount || 0,
                totalInvoiced,
            },
        };
    }
    async getClients(organizationId, search) {
        const list = await db_1.db.getClients(organizationId, search);
        return Promise.all(list.map((c) => this.formatClient(c)));
    }
    async getClientById(organizationId, id) {
        const client = await db_1.db.findClientById(id);
        if (!client || client.organizationId !== organizationId) {
            const err = new Error('Client not found');
            err.statusCode = 404;
            err.code = 'CLIENT_NOT_FOUND';
            throw err;
        }
        const formatted = await this.formatClient(client);
        const quoteList = await db_1.db.getQuotations(organizationId, { clientId: id });
        const quotations = quoteList.map((item) => ({
            ...item.quotation,
            createdAt: item.quotation.createdAt.toISOString(),
            validUntil: item.quotation.validUntil.toISOString(),
            items: item.items,
        }));
        return {
            ...formatted,
            quotations,
        };
    }
    async createClient(organizationId, input, userId) {
        const existing = await db_1.db.findClientByEmail(organizationId, input.email);
        if (existing) {
            const err = new Error('A client with this email already exists in this organization');
            err.statusCode = 409;
            err.code = 'CLIENT_ALREADY_EXISTS';
            throw err;
        }
        const client = await db_1.db.createClient({
            organizationId,
            name: input.name,
            company: input.company,
            email: input.email,
            phone: input.phone,
            billingAddress: input.billingAddress,
            taxId: input.taxId,
            category: input.category,
            notes: input.notes,
        });
        await db_1.db.logAudit({
            organizationId,
            userId,
            action: 'CLIENT_CREATED',
            resource: 'Client',
            resourceId: client.id,
            diff: input,
        });
        return this.formatClient(client);
    }
    async updateClient(organizationId, id, input, userId) {
        const existing = await db_1.db.findClientById(id);
        if (!existing || existing.organizationId !== organizationId) {
            const err = new Error('Client not found');
            err.statusCode = 404;
            err.code = 'CLIENT_NOT_FOUND';
            throw err;
        }
        const updated = await db_1.db.updateClient(id, input);
        await db_1.db.logAudit({
            organizationId,
            userId,
            action: 'CLIENT_UPDATED',
            resource: 'Client',
            resourceId: id,
            diff: { before: existing, after: updated },
        });
        return this.formatClient(updated);
    }
}
exports.ClientsService = ClientsService;
exports.clientsService = new ClientsService();
