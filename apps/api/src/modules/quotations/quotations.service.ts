import { db } from '../../storage/db';
import {
  CreateQuotationInput,
  QuotationStatus,
  QuotationDto,
} from '@setsuzoku/shared';

export class QuotationsService {
  // Decimal-safe fixed arithmetic helper (rounds to 2 decimal places cleanly)
  private round(val: number): number {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }

  private async formatQuotation(
    item: { quotation: any; items: any[] }
  ): Promise<QuotationDto> {
    const q = item.quotation;
    const client = await db.findClientById(q.clientId);
    const user = await db.findUserById(q.createdById);

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

  public async getQuotations(
    organizationId: string,
    filters?: { clientId?: string; status?: QuotationStatus }
  ): Promise<QuotationDto[]> {
    const list = await db.getQuotations(organizationId, filters);
    return Promise.all(list.map((q) => this.formatQuotation(q)));
  }

  public async getQuotationById(organizationId: string, id: string): Promise<QuotationDto> {
    const found = await db.findQuotationById(id);
    if (!found || found.quotation.organizationId !== organizationId) {
      const err: any = new Error('Quotation not found');
      err.statusCode = 404;
      err.code = 'QUOTATION_NOT_FOUND';
      throw err;
    }
    return this.formatQuotation(found);
  }

  public async createQuotation(
    organizationId: string,
    createdById: string,
    input: CreateQuotationInput
  ): Promise<QuotationDto> {
    const client = await db.findClientById(input.clientId);
    if (!client || client.organizationId !== organizationId) {
      const err: any = new Error('Client not found');
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

    const quoteNumber =
      input.quoteNumber ||
      `QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const org = await db.findOrgById(organizationId);

    const created = await db.createQuotation(
      {
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
      },
      computedItems
    );

    await db.logAudit({
      organizationId,
      userId: createdById,
      action: 'QUOTATION_CREATED',
      resource: 'Quotation',
      resourceId: created.quotation.id,
      diff: { quoteNumber, totalAmount },
    });

    return this.formatQuotation(created);
  }

  public async sendQuotation(organizationId: string, id: string, userId: string): Promise<QuotationDto> {
    const found = await db.findQuotationById(id);
    if (!found || found.quotation.organizationId !== organizationId) {
      const err: any = new Error('Quotation not found');
      err.statusCode = 404;
      err.code = 'QUOTATION_NOT_FOUND';
      throw err;
    }

    const updated = await db.updateQuotationStatus(id, QuotationStatus.SENT);

    await db.logAudit({
      organizationId,
      userId,
      action: 'QUOTATION_SENT',
      resource: 'Quotation',
      resourceId: id,
    });

    return this.formatQuotation({ quotation: updated, items: found.items });
  }

  public async acceptQuotation(organizationId: string, id: string, userId?: string): Promise<QuotationDto> {
    const found = await db.findQuotationById(id);
    if (!found || found.quotation.organizationId !== organizationId) {
      const err: any = new Error('Quotation not found');
      err.statusCode = 404;
      err.code = 'QUOTATION_NOT_FOUND';
      throw err;
    }

    if (found.quotation.status === QuotationStatus.ACCEPTED) {
      return this.formatQuotation(found);
    }

    const updated = await db.updateQuotationStatus(id, QuotationStatus.ACCEPTED);

    await db.logAudit({
      organizationId,
      userId,
      action: 'QUOTATION_ACCEPTED',
      resource: 'Quotation',
      resourceId: id,
    });

    return this.formatQuotation({ quotation: updated, items: found.items });
  }
}

export const quotationsService = new QuotationsService();

