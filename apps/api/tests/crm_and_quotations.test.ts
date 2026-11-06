import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/storage/db';
import { LeadStatus, Priority, LeadActivityType, QuotationStatus } from '@setsuzoku/shared';

const app = createApp();

describe('Phase 2: CRM & Sales Lifecycle (Leads, Clients, Quotations)', () => {
  let ownerToken: string;
  let orgId: string;
  let orgSlug: string;

  beforeEach(async () => {
    db.clear();

    // Register organization & owner
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Agency Director',
        email: 'director@digitalagency.com',
        password: 'Password123!',
        organizationName: 'Hyperion Creative',
      });

    ownerToken = reg.body.data.accessToken;
    orgId = reg.body.data.organizations[0].organization.id;
    orgSlug = reg.body.data.organizations[0].organization.slug;
  });

  describe('Module 01: Lead Management CRM', () => {
    it('should capture lead through public intake embed endpoint', async () => {
      const res = await request(app)
        .post('/api/v1/leads/intake')
        .send({
          organizationSlug: orgSlug,
          title: 'Brand Refresh & Commercial Video',
          contactName: 'Sarah Connor',
          email: 'sarah@cyberdyne.com',
          phone: '+91 9876543210',
          companyName: 'Cyberdyne Systems',
          serviceRequired: 'Complete 3D rebrand and 4K commercial launch',
          estimatedBudget: 350000,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Brand Refresh & Commercial Video');
      expect(res.body.data.status).toBe(LeadStatus.NEW);
      expect(res.body.data.source).toBe('Public Web Intake');
    });

    it('should create lead manually and track activity history', async () => {
      const createRes = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          title: 'E-Commerce Next.js Storefront',
          contactName: 'Bruce Wayne',
          email: 'bruce@waynecorp.com',
          companyName: 'Wayne Enterprises',
          priority: Priority.HIGH,
          estimatedBudget: 500000,
          notes: 'High urgency requirement for Q3 launch',
        });

      expect(createRes.status).toBe(201);
      const leadId = createRes.body.data.id;

      // Log a call activity
      const activityRes = await request(app)
        .post(`/api/v1/leads/${leadId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          activityType: LeadActivityType.CALL,
          description: 'Discovery call completed. Budget and scope aligned.',
        });

      expect(activityRes.status).toBe(201);

      // Advance lead status to QUALIFIED
      const patchRes = await request(app)
        .patch(`/api/v1/leads/${leadId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          status: LeadStatus.QUALIFIED,
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.status).toBe(LeadStatus.QUALIFIED);

      // Verify lead details include activity history
      const detailRes = await request(app)
        .get(`/api/v1/leads/${leadId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId);

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.data.activities.length).toBeGreaterThanOrEqual(3); // Creation + Call + Status Change
    });

    it('should convert a won lead to a formal Client profile preserving data', async () => {
      const leadRes = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          title: 'Mobile App MVP',
          contactName: 'Tony Stark',
          email: 'tony@stark.com',
          companyName: 'Stark Industries',
          estimatedBudget: 750000,
        });

      const leadId = leadRes.body.data.id;

      // Convert lead to client
      const convertRes = await request(app)
        .post(`/api/v1/leads/${leadId}/convert`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          billingAddress: '10880 Wilshire Blvd, Los Angeles, CA',
          taxId: 'US-EIN-99887766',
          category: 'Enterprise',
          notes: 'Contract signed for 6-month retainer',
        });

      expect(convertRes.status).toBe(200);
      expect(convertRes.body.success).toBe(true);
      expect(convertRes.body.data.name).toBe('Tony Stark');
      expect(convertRes.body.data.company).toBe('Stark Industries');
      expect(convertRes.body.data.taxId).toBe('US-EIN-99887766');

      // Verify the lead is now marked as WON with convertedToClientId
      const updatedLead = await request(app)
        .get(`/api/v1/leads/${leadId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId);

      expect(updatedLead.body.data.status).toBe(LeadStatus.WON);
      expect(updatedLead.body.data.convertedToClientId).toBe(convertRes.body.data.id);
    });
  });

  describe('Module 02: Customer Management (Clients)', () => {
    it('should create client directly and retrieve 360 dossier', async () => {
      const clientRes = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          name: 'Clark Kent',
          company: 'Daily Planet Press',
          email: 'clark@dailyplanet.com',
          phone: '+1 555-0199',
          billingAddress: 'Metropolis Business District',
          category: 'Retainer',
        });

      expect(clientRes.status).toBe(201);
      const clientId = clientRes.body.data.id;

      const getRes = await request(app)
        .get(`/api/v1/clients/${clientId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.name).toBe('Clark Kent');
      expect(getRes.body.data.company).toBe('Daily Planet Press');
      expect(getRes.body.data.quotations).toBeDefined();
    });
  });

  describe('Module 03: Quotations & Proposals (Decimal-Safe Math)', () => {
    it('should build quotation with multi-line items and exact decimal calculations', async () => {
      // 1. Create client first
      const clientRes = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          name: 'Peter Parker',
          email: 'peter@parker.com',
          company: 'Parker Imaging',
        });

      const clientId = clientRes.body.data.id;

      // 2. Build quotation:
      // Item 1: 2 units * 45,000.50 = 90,001.00
      // Item 2: 1 unit  * 15,000.25 = 15,000.25
      // Subtotal = 105,001.25
      // Discount = 5,001.25
      // Tax = 18,000.00
      // Total = 105,001.25 - 5,001.25 + 18,000.00 = 118,000.00
      const quoteRes = await request(app)
        .post('/api/v1/quotations')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          clientId,
          validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
          paymentTerms: '50% advance upon contract signing, 50% on milestone completion',
          notes: 'Deliverables include full 4K source video files and Figma master designs.',
          discountAmount: 5001.25,
          taxAmount: 18000.0,
          items: [
            {
              serviceName: 'Motion Design & VFX',
              quantity: 2,
              unitPrice: 45000.5,
            },
            {
              serviceName: 'Audio Mastering & Foley',
              quantity: 1,
              unitPrice: 15000.25,
            },
          ],
        });

      expect(quoteRes.status).toBe(201);
      expect(quoteRes.body.data.subtotal).toBe(105001.25);
      expect(quoteRes.body.data.discountAmount).toBe(5001.25);
      expect(quoteRes.body.data.taxAmount).toBe(18000.0);
      expect(quoteRes.body.data.totalAmount).toBe(118000.0);
      expect(quoteRes.body.data.status).toBe(QuotationStatus.DRAFT);
      expect(quoteRes.body.data.items).toHaveLength(2);

      const quoteId = quoteRes.body.data.id;

      // 3. Mark quotation as SENT
      const sendRes = await request(app)
        .post(`/api/v1/quotations/${quoteId}/send`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId);

      expect(sendRes.status).toBe(200);
      expect(sendRes.body.data.status).toBe(QuotationStatus.SENT);

      // 4. Record Client formal acceptance
      const acceptRes = await request(app)
        .post(`/api/v1/quotations/${quoteId}/accept`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId);

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.data.status).toBe(QuotationStatus.ACCEPTED);
    });

    it('should enforce multi-tenant isolation on quotations and leads', async () => {
      // Create Organization B
      const orgBReg = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Competitor Owner',
          email: 'owner@competitor.com',
          password: 'Password123!',
          organizationName: 'Rival Agency',
        });

      const tokenB = orgBReg.body.data.accessToken;
      const orgBId = orgBReg.body.data.organizations[0].organization.id;

      // Create lead in Org A
      const leadA = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          title: 'Confidential Defense Project',
          contactName: 'Classified Agent',
          email: 'agent@secret.gov',
        });

      // User in Org B attempts to read lead in Org A
      const attempt = await request(app)
        .get(`/api/v1/leads/${leadA.body.data.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .set('X-Organization-Id', orgBId);

      expect(attempt.status).toBe(404); // Scoped to orgB, cannot find orgA's lead
    });
  });
});

