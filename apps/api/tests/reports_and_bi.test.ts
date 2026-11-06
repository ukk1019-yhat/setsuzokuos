import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/storage/db';

const app = createApp();

describe('Phase 5: Business Intelligence & Operational Reports', () => {
  let ownerToken: string;
  let orgId: string;
  let clientId: string;

  beforeEach(async () => {
    db.clear();

    // 1. Register Owner & Organization
    const ownerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'bi_owner@setsuzoku.io',
        password: 'Password123!',
        fullName: 'Setsuzoku BI Executive',
        organizationName: 'Neo Tokyo Creative Studio',
      });
    ownerToken = ownerRes.body.data.accessToken;
    orgId = ownerRes.body.data.organizations[0].organization.id;

    // 2. Create Client
    const clientRes = await request(app)
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        name: 'Cyberpunk Media Corp',
        email: 'accounts@cyberpunk.io',
      });
    clientId = clientRes.body.data.id;

    // 4. Create Leads: 1 Won, 1 Lost, 2 Active with Budgets
    await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        title: 'Won E-commerce Site',
        contactName: 'Alice',
        email: 'alice@won.com',
        status: 'WON',
        estimatedBudget: 80000,
      });

    await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        title: 'Lost Mobile App',
        contactName: 'Bob',
        email: 'bob@lost.com',
        status: 'LOST',
        estimatedBudget: 50000,
      });

    await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        title: 'Active Brand Redesign',
        contactName: 'Carol',
        email: 'carol@active.com',
        status: 'QUALIFIED',
        estimatedBudget: 120000,
      });

    // 5. Create an Active Project
    await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        name: 'OmniChannel Portal',
        clientId,
        budget: 200000,
        status: 'ACTIVE',
      });

    // 6. Create Invoices and Payments
    // Invoice 1: 100,000 Total, 60,000 Paid (Partially Paid, 40,000 balance due, due in 5 days -> Current)
    const inv1 = await request(app)
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        clientId,
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        items: [{ serviceName: 'Sprint 1 & 2', quantity: 1, unitPrice: 100000 }],
      });

    await request(app)
      .post('/api/v1/payments/record')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        invoiceId: inv1.body.data.id,
        amount: 60000,
        method: 'BANK_TRANSFER',
      });

    // Invoice 2: 50,000 Total, fully settled (0 balance due)
    const inv2 = await request(app)
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        clientId,
        dueDate: new Date().toISOString(),
        items: [{ serviceName: 'Discovery Workshop', quantity: 1, unitPrice: 50000 }],
      });

    await request(app)
      .post('/api/v1/payments/record')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        invoiceId: inv2.body.data.id,
        amount: 50000,
        method: 'UPI',
      });
  });

  it('should generate real-time aggregated operational reports and BI metrics', async () => {
    const res = await request(app)
      .get('/api/v1/reports/overview')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const report = res.body.data;

    // Total Invoiced: 100,000 + 50,000 = 150,000
    expect(report.totalInvoiced).toBe(150000);

    // Total Revenue Collected: 60,000 + 50,000 = 110,000
    expect(report.totalRevenue).toBe(110000);

    // Outstanding Balance: 40,000
    expect(report.outstandingBalance).toBe(40000);

    // Active projects count
    expect(report.activeProjectsCount).toBe(1);

    // CRM Lead Pipeline
    expect(report.leadsMetrics.total).toBe(3);
    expect(report.leadsMetrics.won).toBe(1);
    expect(report.leadsMetrics.lost).toBe(1);
    expect(report.leadsMetrics.winRate).toBe(33); // 1 / 3 = 33%
    expect(report.pipelineValue).toBe(120000); // 120,000 active

    // Aging Receivables: 40,000 current
    expect(report.agingReceivables.current).toBe(40000);

    // Recent invoices and payments lists populated
    expect(report.recentInvoices.length).toBe(2);
    expect(report.recentPayments.length).toBe(2);
  });
});
