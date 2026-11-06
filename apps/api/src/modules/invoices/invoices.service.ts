import { db } from '../../storage/db';
import {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceDto,
  InvoiceItemDto,
  InvoiceStatus,
  PaymentDto,
} from '@setsuzoku/shared';

export class InvoicesService {
  public async createInvoice(
    organizationId: string,
    input: CreateInvoiceInput
  ): Promise<InvoiceDto> {
    const client = await db.findClientById(input.clientId);
    if (!client || client.organizationId !== organizationId) {
      const err = new Error('Client not found in this organization');
      (err as any).statusCode = 404;
      (err as any).code = 'CLIENT_NOT_FOUND';
      throw err;
    }

    if (input.projectId) {
      const project = await db.findProjectById(input.projectId);
      if (!project || project.organizationId !== organizationId) {
        const err = new Error('Project not found in this organization');
        (err as any).statusCode = 404;
        (err as any).code = 'PROJECT_NOT_FOUND';
        throw err;
      }
    }

    const { invoice, items } = await db.createInvoice({
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

  public async getInvoices(
    organizationId: string,
    filter?: { clientId?: string; status?: InvoiceStatus; projectId?: string }
  ): Promise<InvoiceDto[]> {
    const invoices = await db.getInvoices(organizationId, filter);
    const enriched: InvoiceDto[] = [];

    for (const inv of invoices) {
      const items = await db.getInvoiceItems(inv.id);
      enriched.push(await this.enrichInvoice(organizationId, inv, items));
    }

    return enriched;
  }

  public async getInvoiceById(organizationId: string, id: string): Promise<InvoiceDto> {
    const inv = await db.findInvoiceById(id);
    if (!inv || inv.organizationId !== organizationId) {
      const err = new Error('Invoice not found');
      (err as any).statusCode = 404;
      (err as any).code = 'INVOICE_NOT_FOUND';
      throw err;
    }

    const items = await db.getInvoiceItems(inv.id);
    const payments = await db.getPaymentsByInvoice(inv.id);

    const paymentDtos: PaymentDto[] = payments.map((p) => ({
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

  public async updateInvoice(
    organizationId: string,
    id: string,
    input: UpdateInvoiceInput
  ): Promise<InvoiceDto> {
    const inv = await db.findInvoiceById(id);
    if (!inv || inv.organizationId !== organizationId) {
      const err = new Error('Invoice not found');
      (err as any).statusCode = 404;
      (err as any).code = 'INVOICE_NOT_FOUND';
      throw err;
    }

    const updates: any = {};
    if (input.status) updates.status = input.status;
    if (input.dueDate) updates.dueDate = new Date(input.dueDate);
    if (input.notes !== undefined) updates.notes = input.notes;
    if (input.paymentTerms !== undefined) updates.paymentTerms = input.paymentTerms;

    const updated = await db.updateInvoice(id, updates);
    const items = await db.getInvoiceItems(updated.id);
    return this.enrichInvoice(organizationId, updated, items);
  }

  public async deleteInvoice(organizationId: string, id: string): Promise<void> {
    const inv = await db.findInvoiceById(id);
    if (!inv || inv.organizationId !== organizationId) {
      const err = new Error('Invoice not found');
      (err as any).statusCode = 404;
      (err as any).code = 'INVOICE_NOT_FOUND';
      throw err;
    }

    if (inv.status === InvoiceStatus.PAID) {
      const err = new Error('Cannot delete an invoice that has been marked as PAID');
      (err as any).statusCode = 400;
      (err as any).code = 'CANNOT_DELETE_PAID_INVOICE';
      throw err;
    }

    await db.deleteInvoice(id);
  }

  private async enrichInvoice(
    organizationId: string,
    inv: any,
    items: any[]
  ): Promise<InvoiceDto> {
    const client = await db.findClientById(inv.clientId);
    let project = null;
    if (inv.projectId) {
      const pr = await db.findProjectById(inv.projectId);
      if (pr) {
        project = {
          id: pr.id,
          name: pr.name,
          code: pr.code,
        };
      }
    }

    const itemDtos: InvoiceItemDto[] = items.map((it) => ({
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

export const invoicesService = new InvoicesService();
