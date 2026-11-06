import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/storage/db';
import crypto from 'crypto';

const app = createApp();

describe('Phase 4: Financial Engine, Invoices & Verified Payments', () => {
  let ownerToken: string;
  let clientToken: string;
  let orgId: string;
  let clientId: string;
  let projectId: string;

  beforeEach(async () => {
    db.clear();

    // 1. Register Owner & Organization
    const ownerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'finance_owner@setsuzoku.io',
        password: 'Password123!',
        fullName: 'Setsuzoku Finance Owner',
        organizationName: 'Kyoto Digital Labs',
      });
    ownerToken = ownerRes.body.data.accessToken;
    orgId = ownerRes.body.data.organizations[0].organization.id;

    // 2. Create a formal Client
    const clientRes = await request(app)
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        name: 'Tanaka Enterprises',
        company: 'Tanaka Global Corp',
        email: 'billing@tanaka.com',
        billingAddress: '4-12 Marunouchi, Tokyo',
        taxId: 'GSTIN27AABCT1234F1Z5',
      });
    clientId = clientRes.body.data.id;

    // 4. Create a Project
    const projRes = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        name: 'Global Cloud Migration',
        clientId,
        budget: 150000,
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
      });
    projectId = projRes.body.data.id;
  });

  describe('Module 13: Invoicing & Decimal-Safe Ledger Calculations', () => {
    it('should create an invoice with multiple line items, tax, and discount with decimal precision', async () => {
      const res = await request(app)
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          clientId,
          projectId,
          dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
          currency: 'INR',
          discountAmount: 500.5,
          taxAmount: 1800.25,
          notes: 'Standard 15 days net payment',
          paymentTerms: 'Net 15',
          items: [
            {
              serviceName: 'Backend Architecture Consulting',
              quantity: 2.5,
              unitPrice: 10000,
            }, // 25,000.00
            {
              serviceName: 'Cloud Infrastructure Setup',
              quantity: 1,
              unitPrice: 15500.75,
            }, // 15,500.75
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const invoice = res.body.data;

      // Subtotal = 25,000 + 15,500.75 = 40,500.75
      expect(invoice.subtotal).toBe(40500.75);
      expect(invoice.discountAmount).toBe(500.5);
      expect(invoice.taxAmount).toBe(1800.25);
      // Total = 40500.75 - 500.5 + 1800.25 = 41,800.50
      expect(invoice.totalAmount).toBe(41800.5);
      expect(invoice.amountPaid).toBe(0);
      expect(invoice.balanceDue).toBe(41800.5);
      expect(invoice.status).toBe('ISSUED');
      expect(invoice.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/);
      expect(invoice.items.length).toBe(2);
    });

    it('should list invoices with client and project relationships', async () => {
      // Create invoice
      await request(app)
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          clientId,
          projectId,
          dueDate: new Date().toISOString(),
          items: [{ serviceName: 'SEO Audit', quantity: 1, unitPrice: 5000 }],
        });

      const res = await request(app)
        .get('/api/v1/invoices')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].client.name).toBe('Tanaka Enterprises');
      expect(res.body.data[0].project.name).toBe('Global Cloud Migration');
    });
  });

  describe('Module 14: Payment Recording, Aging & State Machine', () => {
    let invoiceId: string;

    beforeEach(async () => {
      const invRes = await request(app)
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          clientId,
          projectId,
          dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
          currency: 'INR',
          items: [
            { serviceName: 'UI Design System', quantity: 1, unitPrice: 50000 },
            { serviceName: 'Design Tokens Specification', quantity: 1, unitPrice: 10000 },
          ], // Total 60,000
        });
      invoiceId = invRes.body.data.id;
    });

    it('should record a partial manual payment (Bank Transfer) and update invoice to PARTIALLY_PAID', async () => {
      const payRes = await request(app)
        .post('/api/v1/payments/record')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          invoiceId,
          amount: 25000,
          currency: 'INR',
          method: 'BANK_TRANSFER',
          transactionRef: 'UTR998877665544',
          notes: '50% initial milestone deposit via NEFT',
        });

      expect(payRes.status).toBe(201);
      expect(payRes.body.data.status).toBe('VERIFIED');
      expect(payRes.body.data.amount).toBe(25000);
      expect(payRes.body.data.transactionRef).toBe('UTR998877665544');

      // Fetch invoice details to inspect updated balance and status
      const invRes = await request(app)
        .get(`/api/v1/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId);

      expect(invRes.status).toBe(200);
      expect(invRes.body.data.amountPaid).toBe(25000);
      expect(invRes.body.data.balanceDue).toBe(35000);
      expect(invRes.body.data.status).toBe('PARTIALLY_PAID');
    });

    it('should record final settlement payment and transition invoice status to PAID with zero balance', async () => {
      // 1. First partial payment: 20,000
      await request(app)
        .post('/api/v1/payments/record')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          invoiceId,
          amount: 20000,
          method: 'UPI',
          transactionRef: 'UPI-TXN-112233',
        });

      // 2. Second settlement payment: 40,000
      const finalPayRes = await request(app)
        .post('/api/v1/payments/record')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          invoiceId,
          amount: 40000,
          method: 'BANK_TRANSFER',
          transactionRef: 'UTR-FINAL-9900',
        });

      expect(finalPayRes.status).toBe(201);

      // Verify invoice is completely settled
      const invRes = await request(app)
        .get(`/api/v1/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId);

      expect(invRes.body.data.amountPaid).toBe(60000);
      expect(invRes.body.data.balanceDue).toBe(0);
      expect(invRes.body.data.status).toBe('PAID');

      // Verify subsequent payment attempt is rejected
      const overPayRes = await request(app)
        .post('/api/v1/payments/record')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          invoiceId,
          amount: 500,
          method: 'CASH',
        });

      expect(overPayRes.status).toBe(400);
      expect(overPayRes.body.error.code).toBe('INVOICE_ALREADY_PAID');
    });
  });

  describe('Razorpay Integration & Server-to-Server Webhook Security', () => {
    let invoiceId: string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_razorpay_secret_key_12345';

    beforeEach(async () => {
      const invRes = await request(app)
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          clientId,
          dueDate: new Date().toISOString(),
          items: [{ serviceName: 'Social Media Management', quantity: 1, unitPrice: 30000 }],
        });
      invoiceId = invRes.body.data.id;
    });

    it('should generate a Razorpay payment order in paise', async () => {
      const res = await request(app)
        .post('/api/v1/payments/razorpay/order')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({ invoiceId });

      expect(res.status).toBe(200);
      expect(res.body.data.orderId).toMatch(/^order_/);
      expect(res.body.data.amount).toBe(3000000); // 30,000 INR = 3,000,000 paise
      expect(res.body.data.currency).toBe('INR');
      expect(res.body.data.notes.invoiceId).toBe(invoiceId);
    });

    it('should reject razorpay webhook when HMAC signature is invalid or forged', async () => {
      const webhookPayload = {
        event: 'payment.captured',
        id: 'evt_fake_12345',
        payload: {
          payment: {
            entity: {
              id: 'pay_tampered_001',
              amount: 3000000,
              currency: 'INR',
              notes: {
                invoiceId,
                organizationId: orgId,
              },
            },
          },
        },
      };

      const res = await request(app)
        .post('/api/v1/payments/razorpay/webhook')
        .set('x-razorpay-signature', 'invalid_tampered_hmac_hex')
        .send(webhookPayload);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_SIGNATURE');
    });

    it('should cryptographically verify Razorpay HMAC SHA-256 signature and mark invoice as PAID', async () => {
      const webhookPayload = {
        event: 'payment.captured',
        id: 'evt_valid_998877',
        payload: {
          payment: {
            entity: {
              id: 'pay_rzp_live_998811',
              order_id: 'order_test_123',
              amount: 3000000, // 30,000 INR
              currency: 'INR',
              notes: {
                invoiceId,
                organizationId: orgId,
              },
            },
          },
        },
      };

      const payloadString = JSON.stringify(webhookPayload);
      const validSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payloadString)
        .digest('hex');

      const res = await request(app)
        .post('/api/v1/payments/razorpay/webhook')
        .set('x-razorpay-signature', validSignature)
        .send(webhookPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PROCESSED');

      // Verify invoice was credited and marked PAID
      const invRes = await request(app)
        .get(`/api/v1/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId);

      expect(invRes.body.data.amountPaid).toBe(30000);
      expect(invRes.body.data.balanceDue).toBe(0);
      expect(invRes.body.data.status).toBe('PAID');

      // Verify idempotent replay rejection
      const duplicateRes = await request(app)
        .post('/api/v1/payments/razorpay/webhook')
        .set('x-razorpay-signature', validSignature)
        .send(webhookPayload);

      expect(duplicateRes.status).toBe(500); // Idempotency violation rejected
    });
  });

  describe('Multi-Tenant Financial Isolation', () => {
    it('should strictly block organization B from accessing or paying organization A invoices', async () => {
      // 1. Create invoice in Org A
      const invA = await request(app)
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          clientId,
          dueDate: new Date().toISOString(),
          items: [{ serviceName: 'Internal Confidential Audit', quantity: 1, unitPrice: 80000 }],
        });

      // 2. Create another user & Organization B
      const userBRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'competitor@anothercorp.com',
          password: 'Password123!',
          fullName: 'Competitor Owner',
          organizationName: 'Rival Agency',
        });
      const tokenB = userBRes.body.data.accessToken;
      const orgBId = userBRes.body.data.organizations[0].organization.id;

      // 3. Org B attempts to read Org A invoice
      const readRes = await request(app)
        .get(`/api/v1/invoices/${invA.body.data.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .set('X-Organization-Id', orgBId);

      expect(readRes.status).toBe(404);

      // 4. Org B attempts to record payment on Org A invoice
      const payRes = await request(app)
        .post('/api/v1/payments/record')
        .set('Authorization', `Bearer ${tokenB}`)
        .set('X-Organization-Id', orgBId)
        .send({
          invoiceId: invA.body.data.id,
          amount: 5000,
          method: 'CASH',
        });

      expect(payRes.status).toBe(404);
    });
  });
});
