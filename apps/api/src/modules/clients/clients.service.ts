import { db } from '../../storage/db';
import {
  CreateClientInput,
  UpdateClientInput,
  ClientDto,
} from '@setsuzoku/shared';

export class ClientsService {
  private async formatClient(client: any): Promise<ClientDto> {
    const quotations = await db.getQuotations(client.organizationId, { clientId: client.id });
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

  public async getClients(organizationId: string, search?: string): Promise<ClientDto[]> {
    const list = await db.getClients(organizationId, search);
    return Promise.all(list.map((c) => this.formatClient(c)));
  }

  public async getClientById(organizationId: string, id: string): Promise<ClientDto & { quotations: any[] }> {
    const client = await db.findClientById(id);
    if (!client || client.organizationId !== organizationId) {
      const err: any = new Error('Client not found');
      err.statusCode = 404;
      err.code = 'CLIENT_NOT_FOUND';
      throw err;
    }

    const formatted = await this.formatClient(client);
    const quoteList = await db.getQuotations(organizationId, { clientId: id });
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

  public async createClient(
    organizationId: string,
    input: CreateClientInput,
    userId?: string
  ): Promise<ClientDto> {
    const existing = await db.findClientByEmail(organizationId, input.email);
    if (existing) {
      const err: any = new Error('A client with this email already exists in this organization');
      err.statusCode = 409;
      err.code = 'CLIENT_ALREADY_EXISTS';
      throw err;
    }

    const client = await db.createClient({
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

    await db.logAudit({
      organizationId,
      userId,
      action: 'CLIENT_CREATED',
      resource: 'Client',
      resourceId: client.id,
      diff: input,
    });

    return this.formatClient(client);
  }

  public async updateClient(
    organizationId: string,
    id: string,
    input: UpdateClientInput,
    userId?: string
  ): Promise<ClientDto> {
    const existing = await db.findClientById(id);
    if (!existing || existing.organizationId !== organizationId) {
      const err: any = new Error('Client not found');
      err.statusCode = 404;
      err.code = 'CLIENT_NOT_FOUND';
      throw err;
    }

    const updated = await db.updateClient(id, input);

    await db.logAudit({
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

export const clientsService = new ClientsService();

