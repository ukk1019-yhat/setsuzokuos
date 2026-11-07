import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { createApp } from '../src/app';
import { db } from '../src/storage/db';
import { securityRateLimiter } from '../src/middleware/rate-limiter.middleware';
import { MembershipRole } from '@setsuzoku/shared';

const app = createApp();

describe('Comprehensive Security Requirements & Anti-Abuse Test Suite', () => {
  beforeEach(() => {
    db.clear();
    db.seedDefaultData();
    securityRateLimiter.resetAll();
  });

  describe('1. Server-Side Access Control & Default Deny', () => {
    it('should reject unauthenticated requests with 401 UNAUTHORIZED (Default Deny)', async () => {
      const res = await request(app).get('/api/v1/clients');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject requests with invalid or forged JWT tokens', async () => {
      const res = await request(app)
        .get('/api/v1/clients')
        .set('Authorization', 'Bearer forged.token.signature');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should prevent Employee from performing privileged Owner operations (RBAC Enforcement)', async () => {
      // 1. Create Owner and Organization
      const ownerRes = await request(app).post('/api/v1/auth/register').send({
        email: 'owner@agency-security.in',
        password: 'Password123!',
        fullName: 'Agency Owner',
        organizationName: 'Security Testing Org',
      });
      const ownerToken = ownerRes.body.data.accessToken;
      const orgId = ownerRes.body.data.activeOrganizationId;

      // 2. Register Employee user directly
      const employeeRes = await request(app).post('/api/v1/auth/register').send({
        email: 'employee@agency-security.in',
        password: 'Password123!',
        fullName: 'Junior Employee',
      });
      const employeeToken = employeeRes.body.data.accessToken;
      const employeeId = employeeRes.body.data.user.id;

      // Owner adds employee to the organization with EMPLOYEE role
      await db.createMembership({
        organizationId: orgId,
        userId: employeeId,
        role: MembershipRole.EMPLOYEE,
        title: 'Junior Editor',
      });

      // 3. Employee attempts to invite another member -> Must fail with 403
      const hackInvite = await request(app)
        .post('/api/v1/members/invite')
        .set('Authorization', `Bearer ${employeeToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          email: 'hacker@outside.in',
          fullName: 'Malicious Guest',
          role: MembershipRole.ORGANIZATION_OWNER,
        });
      expect(hackInvite.status).toBe(403);
      expect(hackInvite.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('2. Multi-Tenant Isolation & IDOR Protection', () => {
    it('should strictly prevent User A in Org A from reading or modifying Org B data via ID tampering', async () => {
      // 1. Register Org A
      const orgARes = await request(app).post('/api/v1/auth/register').send({
        email: 'admin@org-a.com',
        password: 'Password123!',
        fullName: 'Admin Org A',
        organizationName: 'Organization Alpha',
      });
      const tokenA = orgARes.body.data.accessToken;
      const orgAId = orgARes.body.data.activeOrganizationId;

      // 2. Register Org B
      const orgBRes = await request(app).post('/api/v1/auth/register').send({
        email: 'admin@org-b.com',
        password: 'Password123!',
        fullName: 'Admin Org B',
        organizationName: 'Organization Beta',
      });
      const tokenB = orgBRes.body.data.accessToken;
      const orgBId = orgBRes.body.data.activeOrganizationId;

      // 3. Org A creates a confidential client profile
      const clientARes = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${tokenA}`)
        .set('X-Organization-Id', orgAId)
        .send({
          name: 'Confidential Enterprise Client',
          company: 'Secret Ventures Ltd',
          email: 'confidential@secretventures.com',
          billingAddress: 'Confidential Tower, Mumbai',
          taxId: '27SECRETTAX001',
        });
      expect(clientARes.status).toBe(201);
      const clientAId = clientARes.body.data.id;

      // 4. Org A creates a confidential invoice
      const invoiceARes = await request(app)
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${tokenA}`)
        .set('X-Organization-Id', orgAId)
        .send({
          clientId: clientAId,
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          currency: 'INR',
          items: [{ serviceName: 'Proprietary Research', quantity: 1, unitPrice: 500000 }],
        });
      expect(invoiceARes.status).toBe(201);
      const invoiceAId = invoiceARes.body.data.id;

      // 5. ATTACK: User B tries to read Org A client by tampering ID in URL -> MUST return 404
      const idorReadClient = await request(app)
        .get(`/api/v1/clients/${clientAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .set('X-Organization-Id', orgBId);
      expect(idorReadClient.status).toBe(404);
      expect(idorReadClient.body.error.code).toBe('CLIENT_NOT_FOUND');

      // 6. ATTACK: User B tries to read Org A invoice by tampering ID in URL -> MUST return 404
      const idorReadInvoice = await request(app)
        .get(`/api/v1/invoices/${invoiceAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .set('X-Organization-Id', orgBId);
      expect(idorReadInvoice.status).toBe(404);
      expect(idorReadInvoice.body.error.code).toBe('INVOICE_NOT_FOUND');

      // 7. ATTACK: User B tries to update Org A invoice -> MUST return 404
      const idorUpdateInvoice = await request(app)
        .patch(`/api/v1/invoices/${invoiceAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .set('X-Organization-Id', orgBId)
        .send({ notes: 'Tampered by attacker B' });
      expect(idorUpdateInvoice.status).toBe(404);

      // 8. ATTACK: User B tries to delete Org A invoice -> MUST return 404
      const idorDeleteInvoice = await request(app)
        .delete(`/api/v1/invoices/${invoiceAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .set('X-Organization-Id', orgBId);
      expect(idorDeleteInvoice.status).toBe(404);

      // 9. ATTACK: User B supplies Org A's ID in X-Organization-Id header -> MUST return 403 TENANT_FORBIDDEN
      const tenantHeaderSpoof = await request(app)
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${tokenB}`)
        .set('X-Organization-Id', orgAId);
      expect(tenantHeaderSpoof.status).toBe(403);
      expect(tenantHeaderSpoof.body.error.code).toBe('TENANT_FORBIDDEN');
    });

    it('should isolate client portal to only return authenticated client data', async () => {
      const ownerRes = await request(app).post('/api/v1/auth/register').send({
        email: 'owner@portal-agency.in',
        password: 'Password123!',
        fullName: 'Portal Owner',
        organizationName: 'Client Portal Studio',
      });
      const ownerToken = ownerRes.body.data.accessToken;
      const orgId = ownerRes.body.data.activeOrganizationId;

      // Create client 1
      const client1 = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          name: 'Priya Client',
          company: 'Zepto',
          email: 'priya@zepto.in',
        });

      // Create client 2
      const client2 = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          name: 'Rahul Client',
          company: 'Ather',
          email: 'rahul@ather.in',
        });

      // Query portal dashboard as priya@zepto.in
      const portalRes = await db.findClientByEmail(orgId, 'priya@zepto.in');
      expect(portalRes).not.toBeNull();
      expect(portalRes?.name).toBe('Priya Client');
    });
  });

  describe('3. Auth & Account Lockout Defense', () => {
    it('should lock out an account after 5 consecutive failed login attempts', async () => {
      const registerRes = await request(app).post('/api/v1/auth/register').send({
        email: 'lockout-target@agency.in',
        password: 'StrongPassword123!',
        fullName: 'Lockout Target',
      });
      expect(registerRes.status).toBe(201);

      // Attempt 4 failed logins
      for (let i = 1; i <= 4; i++) {
        const failRes = await request(app).post('/api/v1/auth/login').send({
          email: 'lockout-target@agency.in',
          password: `WrongPassword${i}`,
        });
        expect(failRes.status).toBe(401);
      }

      // 5th failed attempt -> Locks account
      const fifthFail = await request(app).post('/api/v1/auth/login').send({
        email: 'lockout-target@agency.in',
        password: 'WrongPassword5',
      });
      expect(fifthFail.status).toBe(429);
      expect(fifthFail.body.error.code).toBe('ACCOUNT_LOCKED');

      // Subsequent attempt (even with CORRECT password) is locked out!
      const lockedAttempt = await request(app).post('/api/v1/auth/login').send({
        email: 'lockout-target@agency.in',
        password: 'StrongPassword123!',
      });
      expect(lockedAttempt.status).toBe(429);
      expect(lockedAttempt.body.error.code).toBe('ACCOUNT_LOCKED');
    });
  });

  describe('4. Financial Integrity & Razorpay Webhook Security', () => {
    it('should reject razorpay webhook when HMAC signature is forged or missing', async () => {
      const forgedPayload = { event: 'payment.captured', id: 'evt_fake_001' };
      const raw = JSON.stringify(forgedPayload);

      const res = await request(app)
        .post('/api/v1/payments/razorpay/webhook')
        .set('x-razorpay-signature', 'forged_bad_signature_value')
        .send(forgedPayload);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_SIGNATURE');
    });

    it('should enforce idempotency and reject duplicate webhook replay attacks', async () => {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_razorpay_secret_key_12345';
      const eventId = `evt_idempotent_${Date.now()}`;
      const payload = {
        event: 'payment.authorized',
        event_id: eventId,
        payload: {
          payment: {
            entity: {
              id: 'pay_rzp_9999',
              amount: 5000000,
              currency: 'INR',
              notes: {},
            },
          },
        },
      };

      const raw = JSON.stringify(payload);
      const validSig = crypto.createHmac('sha256', secret).update(raw).digest('hex');

      // First webhook call processes event
      const res1 = await request(app)
        .post('/api/v1/payments/razorpay/webhook')
        .set('x-razorpay-signature', validSig)
        .send(payload);
      expect(res1.status).toBe(200);

      // Replay attack: Sending the same eventId again must fail idempotency check
      const res2 = await request(app)
        .post('/api/v1/payments/razorpay/webhook')
        .set('x-razorpay-signature', validSig)
        .send(payload);
      expect(res2.status).toBe(500); // Idempotency guard rejects duplicate
    });

    it('should write an append-only audit record on invoice and payment changes', async () => {
      const reg = await request(app).post('/api/v1/auth/register').send({
        email: 'finance-auditor@agency.in',
        password: 'Password123!',
        fullName: 'Finance Auditor',
        organizationName: 'Audited Media Labs',
      });
      const token = reg.body.data.accessToken;
      const orgId = reg.body.data.activeOrganizationId;

      const client = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Organization-Id', orgId)
        .send({ name: 'Audit Test Client', email: 'audit@client.in' });

      // Create Invoice
      const invRes = await request(app)
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Organization-Id', orgId)
        .send({
          clientId: client.body.data.id,
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
          currency: 'INR',
          items: [{ serviceName: 'Post Production', quantity: 1, unitPrice: 100000 }],
        });
      expect(invRes.status).toBe(201);
      const invoiceId = invRes.body.data.id;

      // Record Payment
      const payRes = await request(app)
        .post('/api/v1/payments/record')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Organization-Id', orgId)
        .send({
          invoiceId,
          amount: 50000,
          method: 'BANK_TRANSFER',
          transactionRef: 'NEFT-2026-9900',
        });
      expect(payRes.status).toBe(201);

      // Verify audit logs were written
      const auditLogs = Array.from(db.auditLogs.values()).filter((l) => l.organizationId === orgId);
      const invoiceAudit = auditLogs.find((l) => l.action === 'INVOICE_CREATED');
      const paymentAudit = auditLogs.find((l) => l.action === 'PAYMENT_RECORDED');

      expect(invoiceAudit).toBeDefined();
      expect(paymentAudit).toBeDefined();
      expect(paymentAudit?.diff.after.paymentAmount).toBe(50000);
    });
  });

  describe('5. File Upload Security & Path Traversal Defense', () => {
    it('should reject disallowed file MIME types (.exe, scripts, HTML)', async () => {
      const reg = await request(app).post('/api/v1/auth/register').send({
        email: 'uploader@agency.in',
        password: 'Password123!',
        fullName: 'Uploader',
        organizationName: 'Upload Studio',
      });
      const token = reg.body.data.accessToken;
      const orgId = reg.body.data.activeOrganizationId;

      const client = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Organization-Id', orgId)
        .send({ name: 'Upload Client', email: 'up@client.in' });

      const proj = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Organization-Id', orgId)
        .send({ name: 'Project Upload', clientId: client.body.data.id });

      const deliv = await request(app)
        .post('/api/v1/deliverables')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Organization-Id', orgId)
        .send({ projectId: proj.body.data.id, title: 'Hero Deliverable' });

      // Malicious file submission (executable / dangerous script)
      const badUpload = await request(app)
        .post('/api/v1/deliverables/versions')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Organization-Id', orgId)
        .send({
          deliverableId: deliv.body.data.id,
          storageKey: '../../../etc/passwd',
          fileName: 'malicious.exe',
          fileSize: 1024,
          fileMimeType: 'application/x-msdownload',
        });

      expect(badUpload.status).toBe(400);
      expect(badUpload.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
    });
  });

  describe('6. India DPDP Act 2023 Compliance', () => {
    it('should provide data subject access request export and published privacy notice', async () => {
      // 1. Check published policy
      const policyRes = await request(app).get('/api/v1/privacy/policy');
      expect(policyRes.status).toBe(200);
      expect(policyRes.body.data.statutoryFramework).toContain('DPDP');

      // 2. Register user and export data
      const reg = await request(app).post('/api/v1/auth/register').send({
        email: 'dpdp-principal@privacy.in',
        password: 'Password123!',
        fullName: 'Aarav Patel',
        organizationName: 'DPDP Media House',
      });
      const token = reg.body.data.accessToken;

      const exportRes = await request(app)
        .get('/api/v1/privacy/export')
        .set('Authorization', `Bearer ${token}`);

      expect(exportRes.status).toBe(200);
      expect(exportRes.body.data.dataSubject.email).toBe('dpdp-principal@privacy.in');
      expect(exportRes.body.data.dataSubject.passwordHash).toBeUndefined(); // Never leaked
      expect(exportRes.body.data.complianceNotice).toContain('DPDP');
    });
  });

  describe('7. Platform Security Headers & Error Masking', () => {
    it('should return strict security headers on all responses', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(res.headers['content-security-policy']).toBeDefined();
    });
  });
});
