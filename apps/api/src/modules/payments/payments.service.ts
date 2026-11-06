import { db } from '../../storage/db';
import {
  RecordPaymentInput,
  RazorpayCreateOrderInput,
  PaymentDto,
  PaymentMethod,
  PaymentStatus,
  InvoiceStatus,
} from '@setsuzoku/shared';
import crypto from 'crypto';

export class PaymentsService {
  private webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_razorpay_secret_key_12345';

  public async recordManualPayment(
    organizationId: string,
    input: RecordPaymentInput,
    recordedById?: string
  ): Promise<PaymentDto> {
    const invoice = await db.findInvoiceById(input.invoiceId);
    if (!invoice || invoice.organizationId !== organizationId) {
      const err = new Error('Invoice not found in this organization');
      (err as any).statusCode = 404;
      (err as any).code = 'INVOICE_NOT_FOUND';
      throw err;
    }

    if (invoice.status === InvoiceStatus.PAID || invoice.balanceDue <= 0) {
      const err = new Error('Invoice is already fully paid');
      (err as any).statusCode = 400;
      (err as any).code = 'INVOICE_ALREADY_PAID';
      throw err;
    }

    if (input.amount <= 0) {
      const err = new Error('Payment amount must be greater than zero');
      (err as any).statusCode = 400;
      (err as any).code = 'INVALID_PAYMENT_AMOUNT';
      throw err;
    }

    const payment = await db.recordPayment({
      organizationId,
      invoiceId: input.invoiceId,
      amount: input.amount,
      currency: input.currency || invoice.currency,
      method: input.method,
      status: PaymentStatus.VERIFIED,
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

  public async getPayments(
    organizationId: string,
    filter?: { invoiceId?: string; status?: PaymentStatus }
  ): Promise<PaymentDto[]> {
    const payments = await db.getPayments(organizationId, filter);
    const enriched: PaymentDto[] = [];

    for (const p of payments) {
      const inv = await db.findInvoiceById(p.invoiceId);
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

  public async getPaymentById(organizationId: string, id: string): Promise<PaymentDto> {
    const payment = await db.findPaymentById(id);
    if (!payment || payment.organizationId !== organizationId) {
      const err = new Error('Payment not found');
      (err as any).statusCode = 404;
      (err as any).code = 'PAYMENT_NOT_FOUND';
      throw err;
    }

    const inv = await db.findInvoiceById(payment.invoiceId);
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

  public async createRazorpayOrder(
    organizationId: string,
    input: RazorpayCreateOrderInput
  ) {
    const invoice = await db.findInvoiceById(input.invoiceId);
    if (!invoice || invoice.organizationId !== organizationId) {
      const err = new Error('Invoice not found in this organization');
      (err as any).statusCode = 404;
      (err as any).code = 'INVOICE_NOT_FOUND';
      throw err;
    }

    if (invoice.balanceDue <= 0 || invoice.status === InvoiceStatus.PAID) {
      const err = new Error('Invoice has no outstanding balance');
      (err as any).statusCode = 400;
      (err as any).code = 'NO_BALANCE_DUE';
      throw err;
    }

    const chargeAmount = input.amount
      ? Math.min(input.amount, invoice.balanceDue)
      : invoice.balanceDue;

    const orderId = `order_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
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

  public async processRazorpayWebhook(
    rawBody: string,
    signature: string,
    payload: any
  ) {
    if (!signature) {
      const err = new Error('Missing Razorpay webhook signature header');
      (err as any).statusCode = 400;
      (err as any).code = 'MISSING_SIGNATURE';
      throw err;
    }

    // Verify HMAC SHA-256 signature
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      const err = new Error('Invalid Razorpay signature');
      (err as any).statusCode = 400;
      (err as any).code = 'INVALID_SIGNATURE';
      throw err;
    }

    const eventId = payload.event_id || payload.id || `evt_${crypto.randomUUID()}`;
    const eventType = payload.event;

    // Idempotency check: Record webhook event
    const webhookRecord = await db.recordPaymentWebhookEvent({
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
        paymentRecord = await db.recordPayment({
          organizationId,
          invoiceId,
          amount,
          currency: paymentEntity?.currency || 'INR',
          method: PaymentMethod.RAZORPAY,
          status: PaymentStatus.VERIFIED,
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

export const paymentsService = new PaymentsService();

