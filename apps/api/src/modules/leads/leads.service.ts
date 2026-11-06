import { db } from '../../storage/db';
import {
  CreateLeadInput,
  UpdateLeadInput,
  PublicLeadIntakeInput,
  CreateLeadActivityInput,
  ConvertLeadToClientInput,
  LeadStatus,
  LeadActivityType,
  LeadDto,
  ClientDto,
} from '@setsuzoku/shared';

export class LeadsService {
  private async formatLead(lead: any, includeActivities: boolean = false): Promise<LeadDto> {
    let assignedTo = null;
    if (lead.assignedToId) {
      const user = await db.findUserById(lead.assignedToId);
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
      const rawActivities = await db.getLeadActivities(lead.id);
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

  public async getLeads(
    organizationId: string,
    filters?: { status?: LeadStatus; search?: string; assignedToId?: string }
  ): Promise<LeadDto[]> {
    const list = await db.getLeads(organizationId, filters);
    return Promise.all(list.map((lead) => this.formatLead(lead, false)));
  }

  public async getLeadById(organizationId: string, id: string): Promise<LeadDto> {
    const lead = await db.findLeadById(id);
    if (!lead || lead.organizationId !== organizationId) {
      const err: any = new Error('Lead not found in this organization');
      err.statusCode = 404;
      err.code = 'LEAD_NOT_FOUND';
      throw err;
    }
    return this.formatLead(lead, true);
  }

  public async createLead(
    organizationId: string,
    input: CreateLeadInput,
    userId?: string
  ): Promise<LeadDto> {
    const lead = await db.createLead({
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

    await db.addLeadActivity({
      leadId: lead.id,
      activityType: LeadActivityType.NOTE,
      description: 'Lead created in CRM pipeline',
    });

    await db.logAudit({
      organizationId,
      userId,
      action: 'LEAD_CREATED',
      resource: 'Lead',
      resourceId: lead.id,
      diff: input,
    });

    return this.formatLead(lead, true);
  }

  public async publicIntake(input: PublicLeadIntakeInput): Promise<LeadDto> {
    const org = await db.findOrgBySlug(input.organizationSlug);
    if (!org) {
      const err: any = new Error('Organization not found');
      err.statusCode = 404;
      err.code = 'ORG_NOT_FOUND';
      throw err;
    }

    const lead = await db.createLead({
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

    await db.addLeadActivity({
      leadId: lead.id,
      activityType: LeadActivityType.NOTE,
      description: `Inbound lead captured via public web intake form (${input.email})`,
    });

    return this.formatLead(lead, false);
  }

  public async updateLead(
    organizationId: string,
    id: string,
    input: UpdateLeadInput,
    userId: string
  ): Promise<LeadDto> {
    const existing = await db.findLeadById(id);
    if (!existing || existing.organizationId !== organizationId) {
      const err: any = new Error('Lead not found in this organization');
      err.statusCode = 404;
      err.code = 'LEAD_NOT_FOUND';
      throw err;
    }

    const updated = await db.updateLead(id, {
      ...input,
      expectedClose: input.expectedClose ? new Date(input.expectedClose) : undefined,
    });

    if (input.status && input.status !== existing.status) {
      await db.addLeadActivity({
        leadId: id,
        activityType: LeadActivityType.STATUS_CHANGE,
        description: `Lead status changed from ${existing.status} to ${input.status}`,
      });
    }

    await db.logAudit({
      organizationId,
      userId,
      action: 'LEAD_UPDATED',
      resource: 'Lead',
      resourceId: id,
      diff: { before: existing, after: updated },
    });

    return this.formatLead(updated, true);
  }

  public async addActivity(
    organizationId: string,
    id: string,
    input: CreateLeadActivityInput,
    userId: string
  ) {
    const lead = await db.findLeadById(id);
    if (!lead || lead.organizationId !== organizationId) {
      const err: any = new Error('Lead not found');
      err.statusCode = 404;
      err.code = 'LEAD_NOT_FOUND';
      throw err;
    }

    const activity = await db.addLeadActivity({
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

  public async convertToClient(
    organizationId: string,
    leadId: string,
    input: ConvertLeadToClientInput,
    userId: string
  ): Promise<ClientDto> {
    const lead = await db.findLeadById(leadId);
    if (!lead || lead.organizationId !== organizationId) {
      const err: any = new Error('Lead not found');
      err.statusCode = 404;
      err.code = 'LEAD_NOT_FOUND';
      throw err;
    }

    if (lead.convertedToClientId) {
      const existingClient = await db.findClientById(lead.convertedToClientId);
      if (existingClient) {
        return {
          ...existingClient,
          createdAt: existingClient.createdAt.toISOString(),
          updatedAt: existingClient.updatedAt.toISOString(),
        };
      }
    }

    // Create formal Client
    const client = await db.createClient({
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
    await db.updateLead(leadId, {
      status: LeadStatus.WON,
      convertedToClientId: client.id,
    });

    await db.addLeadActivity({
      leadId,
      activityType: LeadActivityType.STATUS_CHANGE,
      description: `Lead converted to formal Client entity (${client.name} - ${client.id})`,
    });

    await db.logAudit({
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

export const leadsService = new LeadsService();

