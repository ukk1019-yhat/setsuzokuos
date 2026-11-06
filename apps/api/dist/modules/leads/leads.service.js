"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadsService = exports.LeadsService = void 0;
const db_1 = require("../../storage/db");
const shared_1 = require("@setsuzoku/shared");
class LeadsService {
    async formatLead(lead, includeActivities = false) {
        let assignedTo = null;
        if (lead.assignedToId) {
            const user = await db_1.db.findUserById(lead.assignedToId);
            if (user) {
                assignedTo = {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                };
            }
        }
        let activities = undefined;
        if (includeActivities) {
            const rawActivities = await db_1.db.getLeadActivities(lead.id);
            activities = rawActivities.map((a) => ({
                id: a.id,
                leadId: a.leadId,
                activityType: a.activityType,
                description: a.description,
                createdAt: a.createdAt.toISOString(),
            }));
        }
        return {
            ...lead,
            createdAt: lead.createdAt.toISOString(),
            updatedAt: lead.updatedAt.toISOString(),
            expectedClose: lead.expectedClose ? lead.expectedClose.toISOString() : null,
            assignedTo,
            activities,
        };
    }
    async getLeads(organizationId, filters) {
        const list = await db_1.db.getLeads(organizationId, filters);
        return Promise.all(list.map((lead) => this.formatLead(lead, false)));
    }
    async getLeadById(organizationId, id) {
        const lead = await db_1.db.findLeadById(id);
        if (!lead || lead.organizationId !== organizationId) {
            const err = new Error('Lead not found in this organization');
            err.statusCode = 404;
            err.code = 'LEAD_NOT_FOUND';
            throw err;
        }
        return this.formatLead(lead, true);
    }
    async createLead(organizationId, input, userId) {
        const lead = await db_1.db.createLead({
            organizationId,
            title: input.title,
            contactName: input.contactName,
            email: input.email,
            phone: input.phone,
            companyName: input.companyName,
            source: input.source,
            status: input.status,
            priority: input.priority,
            estimatedBudget: input.estimatedBudget,
            expectedClose: input.expectedClose ? new Date(input.expectedClose) : undefined,
            serviceRequired: input.serviceRequired,
            notes: input.notes,
            tags: input.tags,
            assignedToId: input.assignedToId,
        });
        await db_1.db.addLeadActivity({
            leadId: lead.id,
            activityType: shared_1.LeadActivityType.NOTE,
            description: 'Lead created in CRM pipeline',
        });
        await db_1.db.logAudit({
            organizationId,
            userId,
            action: 'LEAD_CREATED',
            resource: 'Lead',
            resourceId: lead.id,
            diff: input,
        });
        return this.formatLead(lead, true);
    }
    async publicIntake(input) {
        const org = await db_1.db.findOrgBySlug(input.organizationSlug);
        if (!org) {
            const err = new Error('Organization not found');
            err.statusCode = 404;
            err.code = 'ORG_NOT_FOUND';
            throw err;
        }
        const lead = await db_1.db.createLead({
            organizationId: org.id,
            title: input.title,
            contactName: input.contactName,
            email: input.email,
            phone: input.phone,
            companyName: input.companyName,
            source: 'Public Web Intake',
            serviceRequired: input.serviceRequired,
            estimatedBudget: input.estimatedBudget,
        });
        await db_1.db.addLeadActivity({
            leadId: lead.id,
            activityType: shared_1.LeadActivityType.NOTE,
            description: `Inbound lead captured via public web intake form (${input.email})`,
        });
        return this.formatLead(lead, false);
    }
    async updateLead(organizationId, id, input, userId) {
        const existing = await db_1.db.findLeadById(id);
        if (!existing || existing.organizationId !== organizationId) {
            const err = new Error('Lead not found in this organization');
            err.statusCode = 404;
            err.code = 'LEAD_NOT_FOUND';
            throw err;
        }
        const updated = await db_1.db.updateLead(id, {
            ...input,
            expectedClose: input.expectedClose ? new Date(input.expectedClose) : undefined,
        });
        if (input.status && input.status !== existing.status) {
            await db_1.db.addLeadActivity({
                leadId: id,
                activityType: shared_1.LeadActivityType.STATUS_CHANGE,
                description: `Lead status changed from ${existing.status} to ${input.status}`,
            });
        }
        await db_1.db.logAudit({
            organizationId,
            userId,
            action: 'LEAD_UPDATED',
            resource: 'Lead',
            resourceId: id,
            diff: { before: existing, after: updated },
        });
        return this.formatLead(updated, true);
    }
    async addActivity(organizationId, id, input, userId) {
        const lead = await db_1.db.findLeadById(id);
        if (!lead || lead.organizationId !== organizationId) {
            const err = new Error('Lead not found');
            err.statusCode = 404;
            err.code = 'LEAD_NOT_FOUND';
            throw err;
        }
        const activity = await db_1.db.addLeadActivity({
            leadId: id,
            activityType: input.activityType,
            description: input.description,
        });
        return {
            id: activity.id,
            leadId: activity.leadId,
            activityType: activity.activityType,
            description: activity.description,
            createdAt: activity.createdAt.toISOString(),
        };
    }
    async convertToClient(organizationId, leadId, input, userId) {
        const lead = await db_1.db.findLeadById(leadId);
        if (!lead || lead.organizationId !== organizationId) {
            const err = new Error('Lead not found');
            err.statusCode = 404;
            err.code = 'LEAD_NOT_FOUND';
            throw err;
        }
        if (lead.convertedToClientId) {
            const existingClient = await db_1.db.findClientById(lead.convertedToClientId);
            if (existingClient) {
                return {
                    ...existingClient,
                    createdAt: existingClient.createdAt.toISOString(),
                    updatedAt: existingClient.updatedAt.toISOString(),
                };
            }
        }
        // Create formal Client
        const client = await db_1.db.createClient({
            organizationId,
            name: lead.contactName,
            company: lead.companyName || undefined,
            email: lead.email,
            phone: lead.phone || undefined,
            billingAddress: input.billingAddress,
            taxId: input.taxId,
            category: input.category || 'Standard',
            notes: `Converted from Lead: ${lead.title}. ${input.notes || ''}`.trim(),
        });
        // Update lead status to WON and link to client
        await db_1.db.updateLead(leadId, {
            status: shared_1.LeadStatus.WON,
            convertedToClientId: client.id,
        });
        await db_1.db.addLeadActivity({
            leadId,
            activityType: shared_1.LeadActivityType.STATUS_CHANGE,
            description: `Lead converted to formal Client entity (${client.name} - ${client.id})`,
        });
        await db_1.db.logAudit({
            organizationId,
            userId,
            action: 'LEAD_CONVERTED_TO_CLIENT',
            resource: 'Lead',
            resourceId: leadId,
            diff: { clientId: client.id },
        });
        return {
            ...client,
            createdAt: client.createdAt.toISOString(),
            updatedAt: client.updatedAt.toISOString(),
        };
    }
}
exports.LeadsService = LeadsService;
exports.leadsService = new LeadsService();
