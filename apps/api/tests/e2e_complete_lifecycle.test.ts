import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/storage/db';
import {
  LeadStatus,
  QuotationStatus,
  ProjectStatus,
  TaskStatus,
  DeliverableStatus,
  ApprovalDecision,
  InvoiceStatus,
  PaymentStatus,
} from '@setsuzoku/shared';
import crypto from 'crypto';

const app = createApp();

describe('SETSUZOKU OS: Master End-to-End Lifecycle', () => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_razorpay_secret_key_12345';

  beforeEach(() => {
    db.clear();
  });

  it('executes unbroken lifecycle: Inquiry -> Lead -> Client -> Quotation -> Project -> Tasks -> Deliverables -> Approval -> Invoice -> Payment -> BI', async () => {
    // =========================================================================
    // STEP 1: ORGANIZATION ONBOARDING & OWNER IDENTITY
    // =========================================================================
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Kenji Sato',
        email: 'kenji@shibuyadigital.io',
        password: 'Password123!',
        organizationName: 'Shibuya Digital Innovations',
      });

    expect(regRes.status).toBe(201);
    const ownerToken = regRes.body.data.accessToken;
    const org = regRes.body.data.organizations[0].organization;
    const orgId = org.id;
    const orgSlug = org.slug;

    // =========================================================================
    // STEP 2: PUBLIC LEAD INTAKE (Agency Website Embed)
    // =========================================================================
    const intakeRes = await request(app)
      .post('/api/v1/leads/intake')
      .send({
        organizationSlug: orgSlug,
        title: 'Complete 3D Commercial & Web Launch',
        contactName: 'Elena Rostova',
        email: 'elena@novatech.io',
        phone: '+91 9988776655',
        companyName: 'Nova Technologies Ltd',
        serviceRequired: 'High-end 3D visual rebrand, design system, and web platform',
        estimatedBudget: 250000,
      });

    expect(intakeRes.status).toBe(201);
    const leadId = intakeRes.body.data.id;
    expect(intakeRes.body.data.status).toBe(LeadStatus.NEW);

    // =========================================================================
    // STEP 3: CRM PIPELINE PROGRESSION & CONVERSION TO CLIENT
    // =========================================================================
    // Qualify lead
    await request(app)
      .patch(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({ status: LeadStatus.QUALIFIED });

    // 1-Click Convert to formal Client profile
    const convertRes = await request(app)
      .post(`/api/v1/leads/${leadId}/convert`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        name: 'Elena Rostova',
        company: 'Nova Technologies Ltd',
        email: 'elena@novatech.io',
        billingAddress: 'Tower B, Tech Park, Bangalore',
        taxId: '29ABCDE1234F1Z5',
      });

    expect(convertRes.status).toBe(200);
    const clientId = convertRes.body.data.id;
    expect(convertRes.body.data.name).toBe('Elena Rostova');

    // =========================================================================
    // STEP 4: QUOTATION & PROPOSAL ENGINE (Decimal-Safe Math)
    // =========================================================================
    const quoteRes = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        clientId,
        title: 'Proposal: Comprehensive 3D Digital Transformation',
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
        currency: 'INR',
        discountAmount: 10000,
        taxAmount: 43200, // 18% GST on (250,000 - 10,000) = 43,200
        paymentTerms: '50% advance upon milestone commencement, 50% on final approval',
        items: [
          { serviceName: 'Brand 3D Guidelines & Tokens', quantity: 1, unitPrice: 100000 },
          { serviceName: 'Interactive Web Storefront', quantity: 1, unitPrice: 150000 },
        ],
      });

    expect(quoteRes.status).toBe(201);
    const quoteId = quoteRes.body.data.id;
    // Subtotal: 250,000. Total: 250,000 - 10,000 + 43,200 = 283,200
    expect(quoteRes.body.data.subtotal).toBe(250000);
    expect(quoteRes.body.data.totalAmount).toBe(283200);

    // Mark proposal accepted by client
    await request(app)
      .patch(`/api/v1/quotations/${quoteId}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({ status: QuotationStatus.ACCEPTED });

    // =========================================================================
    // STEP 5: AUTOMATED PROJECT SPAWNING FROM ACCEPTED QUOTATION
    // =========================================================================
    const spawnRes = await request(app)
      .post('/api/v1/projects/convert-quote')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        quotationId: quoteId,
        name: 'Nova 3D Digital Transformation',
        deadline: new Date(Date.now() + 60 * 86400000).toISOString(),
      });

    expect(spawnRes.status).toBe(201);
    const projectId = spawnRes.body.data.id;
    expect(spawnRes.body.data.budget).toBe(283200);
    expect(spawnRes.body.data.status).toBe(ProjectStatus.PLANNING);

    // Transition project to ACTIVE
    await request(app)
      .patch(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({ status: ProjectStatus.ACTIVE });

    // =========================================================================
    // STEP 6: TASK MANAGEMENT, SUBTASKS & PROGRESS RECONCILIATION
    // =========================================================================
    const taskRes = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        projectId,
        title: 'Design Master 3D Assets',
      });
    const taskId = taskRes.body.data.id;

    // Add subtask and complete it
    const subtaskRes = await request(app)
      .post(`/api/v1/tasks/${taskId}/subtasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({ title: 'Export Blender GLTF models' });

    await request(app)
      .post(`/api/v1/tasks/subtasks/${subtaskRes.body.data.id}/toggle`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId);

    // Mark task as completed
    await request(app)
      .patch(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({ status: TaskStatus.COMPLETED });

    // Verify project progress updated to 100%
    const projCheck = await request(app)
      .get(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId);
    expect(projCheck.body.data.progressPercentage).toBe(100);

    // =========================================================================
    // STEP 7: MULTI-VERSION DELIVERABLES & FORMAL CLIENT APPROVAL AUDIT
    // =========================================================================
    const delivRes = await request(app)
      .post('/api/v1/deliverables')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        projectId,
        title: 'Final 4K Brand Identity Video',
      });
    const deliverableId = delivRes.body.data.id;

    // Staff submits v1.0
    const v1Res = await request(app)
      .post('/api/v1/deliverables/versions')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        deliverableId,
        storageKey: 's3://deliverables/nova-v1.mp4',
        fileName: 'Nova_Brand_Commercial_v1.0.mp4',
        fileSize: 45000000,
        fileMimeType: 'video/mp4',
        changelogNotes: 'First cut with Dolby Atmos audio mix',
      });
    expect(v1Res.status).toBe(201);
    const v1Id = v1Res.body.data.id;

    // Client requests revisions on v1.0
    await request(app)
      .post(`/api/v1/deliverables/approvals/${v1Id}/decide`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        decision: ApprovalDecision.REVISION_REQUESTED,
        comments: 'Please brighten typography contrast at 0:15 and adjust audio level',
      });

    // Staff uploads revised v2.0
    const v2Res = await request(app)
      .post('/api/v1/deliverables/versions')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        deliverableId,
        storageKey: 's3://deliverables/nova-v2.mp4',
        fileName: 'Nova_Brand_Commercial_v2.0.mp4',
        fileSize: 46000000,
        fileMimeType: 'video/mp4',
        changelogNotes: 'Contrast increased and audio remastered to -14 LUFS',
      });
    const v2Id = v2Res.body.data.id;
    expect(v2Res.body.data.versionNumber).toBe(2);

    // Client formally approves v2.0
    const approveRes = await request(app)
      .post(`/api/v1/deliverables/approvals/${v2Id}/decide`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        decision: ApprovalDecision.APPROVED,
        comments: 'Outstanding work. Formally signed off for production launch.',
      });
    expect(approveRes.status).toBe(200);

    // =========================================================================
    // STEP 8: INVOICING & SEQUENTIAL NUMBER GENERATION
    // =========================================================================
    const invoiceRes = await request(app)
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        clientId,
        projectId,
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        currency: 'INR',
        discountAmount: 10000,
        taxAmount: 43200,
        items: [
          { serviceName: 'Delivered 3D Assets & Guidelines', quantity: 1, unitPrice: 100000 },
          { serviceName: 'Deployed Interactive Web Storefront', quantity: 1, unitPrice: 150000 },
        ],
      });

    expect(invoiceRes.status).toBe(201);
    const invoiceId = invoiceRes.body.data.id;
    expect(invoiceRes.body.data.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/);
    expect(invoiceRes.body.data.totalAmount).toBe(283200);
    expect(invoiceRes.body.data.balanceDue).toBe(283200);
    expect(invoiceRes.body.data.status).toBe(InvoiceStatus.ISSUED);

    // =========================================================================
    // STEP 9: VERIFIED PAYMENT VIA RAZORPAY HMAC SHA-256 WEBHOOK
    // =========================================================================
    // 1. Partial advance payment via Wire (100,000)
    await request(app)
      .post('/api/v1/payments/record')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        invoiceId,
        amount: 100000,
        method: 'BANK_TRANSFER',
        transactionRef: 'NEFT-AXIS-99112233',
      });

    // Verify intermediate state
    const midInv = await request(app)
      .get(`/api/v1/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId);
    expect(midInv.body.data.status).toBe(InvoiceStatus.PARTIALLY_PAID);
    expect(midInv.body.data.balanceDue).toBe(183200);

    // 2. Final settlement payment via verified Razorpay Webhook (183,200)
    const razorpayPayload = {
      event: 'payment.captured',
      id: 'evt_master_e2e_settlement',
      payload: {
        payment: {
          entity: {
            id: 'pay_rzp_e2e_live_123',
            amount: 18320000, // 183,200 INR in paise
            currency: 'INR',
            notes: {
              invoiceId,
              organizationId: orgId,
            },
          },
        },
      },
    };

    const payloadRaw = JSON.stringify(razorpayPayload);
    const validHmac = crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadRaw)
      .digest('hex');

    const webhookRes = await request(app)
      .post('/api/v1/payments/razorpay/webhook')
      .set('x-razorpay-signature', validHmac)
      .send(razorpayPayload);

    expect(webhookRes.status).toBe(200);

    // Verify Invoice is now completely PAID and settled to 0
    const finalInv = await request(app)
      .get(`/api/v1/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId);

    expect(finalInv.body.data.amountPaid).toBe(283200);
    expect(finalInv.body.data.balanceDue).toBe(0);
    expect(finalInv.body.data.status).toBe(InvoiceStatus.PAID);

    // =========================================================================
    // STEP 10: REAL-TIME EXECUTIVE BUSINESS INTELLIGENCE
    // =========================================================================
    const biRes = await request(app)
      .get('/api/v1/reports/overview')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId);

    expect(biRes.status).toBe(200);
    const bi = biRes.body.data;

    // Full billed amount settled: 283,200 collected, 0 balance due
    expect(bi.totalInvoiced).toBe(283200);
    expect(bi.totalRevenue).toBe(283200);
    expect(bi.outstandingBalance).toBe(0);
    expect(bi.leadsMetrics.won).toBe(1);
    expect(bi.leadsMetrics.winRate).toBe(100);
    expect(bi.recentPayments.length).toBe(2); // 1 Wire + 1 Razorpay
    expect(bi.recentInvoices.length).toBe(1);
  });
});
