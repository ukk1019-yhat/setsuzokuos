import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/storage/db';
import {
  ProjectStatus,
  TaskStatus,
  Priority,
  DeliverableStatus,
  ApprovalDecision,
} from '@setsuzoku/shared';

const app = createApp();

describe('Phase 3: Project Execution & Client Portal', () => {
  let ownerToken: string;
  let clientToken: string;
  let orgId: string;
  let clientId: string;
  let acceptedQuoteId: string;

  beforeEach(async () => {
    db.clear();

    // 1. Register organization & owner
    const ownerReg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Creative Agency CEO',
        email: 'ceo@vfxstudio.com',
        password: 'Password123!',
        organizationName: 'VFX & Motion Studio',
      });

    ownerToken = ownerReg.body.data.accessToken;
    orgId = ownerReg.body.data.organizations[0].organization.id;

    // 2. Create Client profile
    const clientRes = await request(app)
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        name: 'Warner Production Head',
        email: 'client@warner.com',
        company: 'Warner Media Global',
      });

    clientId = clientRes.body.data.id;

    // 3. Register client user account for Client Portal access
    const clientUserReg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Warner Production Head',
        email: 'client@warner.com',
        password: 'Password123!',
      });

    clientToken = clientUserReg.body.data.accessToken;

    // 4. Owner invites client user as CLIENT role
    await request(app)
      .post('/api/v1/members/invite')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        email: 'client@warner.com',
        fullName: 'Warner Production Head',
        role: 'CLIENT',
      });

    // 5. Create and accept quotation
    const quoteRes = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        clientId,
        validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
        items: [
          {
            serviceName: '3D VFX Simulation Sequence',
            quantity: 1,
            unitPrice: 125000,
          },
          {
            serviceName: 'Color Grading & Dolby Atmos Mix',
            quantity: 1,
            unitPrice: 45000,
          },
        ],
      });

    acceptedQuoteId = quoteRes.body.data.id;

    // Accept quotation
    await request(app)
      .post(`/api/v1/quotations/${acceptedQuoteId}/accept`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId);
  });

  describe('Module 04: Project Management & Conversion from Quotation', () => {
    it('should spawn a project directly from an accepted quotation with auto-generated deliverables', async () => {
      const convertRes = await request(app)
        .post('/api/v1/projects/convert-quote')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          quotationId: acceptedQuoteId,
          name: 'The Blockbuster Sci-Fi VFX Package',
          deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        });

      expect(convertRes.status).toBe(201);
      expect(convertRes.body.success).toBe(true);
      expect(convertRes.body.data.name).toBe('The Blockbuster Sci-Fi VFX Package');
      expect(convertRes.body.data.budget).toBe(170000); // 125000 + 45000
      expect(convertRes.body.data.status).toBe(ProjectStatus.PLANNING);
      expect(convertRes.body.data.code).toMatch(/^PRJ-\d{4}-\d{3}$/);
      expect(convertRes.body.data.deliverables).toHaveLength(2);
      expect(convertRes.body.data.milestones).toHaveLength(2);
    });
  });

  describe('Module 05: Task Lifecycle & Completion Tracking', () => {
    it('should create tasks, manage subtasks and update project progress percentage', async () => {
      // 1. Create project
      const projRes = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          clientId,
          name: 'Commercial CGI Campaign',
          budget: 80000,
        });

      const projectId = projRes.body.data.id;

      // 2. Create Task
      const taskRes = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          projectId,
          title: '3D Particle Simulation Mesh',
          priority: Priority.HIGH,
        });

      expect(taskRes.status).toBe(201);
      const taskId = taskRes.body.data.id;

      // 3. Add subtask
      const subtaskRes = await request(app)
        .post(`/api/v1/tasks/${taskId}/subtasks`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          title: 'Bake smoke physics cache',
        });

      expect(subtaskRes.status).toBe(201);
      const subtaskId = subtaskRes.body.data.id;

      // Toggle subtask
      const toggleRes = await request(app)
        .post(`/api/v1/tasks/subtasks/${subtaskId}/toggle`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId);

      expect(toggleRes.body.data.isCompleted).toBe(true);

      // 4. Mark task as COMPLETED
      await request(app)
        .patch(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          status: TaskStatus.COMPLETED,
        });

      // 5. Inspect project detail: progressPercentage should now be 100%
      const projDetail = await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId);

      expect(projDetail.status).toBe(200);
      expect(projDetail.body.data.progressPercentage).toBe(100);
    });
  });

  describe('Module 07 & 08: Deliverable Multi-Versioning & Formal Client Approvals', () => {
    it('should handle version increments and revision request followed by approval', async () => {
      // 1. Create project
      const projRes = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          clientId,
          name: 'Main Title Intro',
        });

      const projectId = projRes.body.data.id;

      // 2. Create Deliverable container
      const delivRes = await request(app)
        .post('/api/v1/deliverables')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          projectId,
          title: 'Opening Title 4K ProRes Master',
        });

      const deliverableId = delivRes.body.data.id;

      // 3. Submit Version 1 (v1)
      const v1Res = await request(app)
        .post('/api/v1/deliverables/versions')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          deliverableId,
          storageKey: 's3://deliverables/prj-001/intro-v1.mov',
          fileName: 'intro_rough_cut_v1.mov',
          fileSize: 450000000,
          fileMimeType: 'video/quicktime',
          changelogNotes: 'First pass animatic render with placeholder sound',
        });

      expect(v1Res.status).toBe(201);
      expect(v1Res.body.data.versionNumber).toBe(1);

      // 4. Client requests revision on v1
      const revisionRes = await request(app)
        .post(`/api/v1/deliverables/approvals/${v1Res.body.data.id}/decide`)
        .set('Authorization', `Bearer ${clientToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          decision: ApprovalDecision.REVISION_REQUESTED,
          comments: 'The typography needs to be brighter and reveal at 0:04 instead of 0:02.',
        });

      expect(revisionRes.status).toBe(200);
      expect(revisionRes.body.data.decision).toBe(ApprovalDecision.REVISION_REQUESTED);

      // 5. Employee submits Version 2 (v2)
      const v2Res = await request(app)
        .post('/api/v1/deliverables/versions')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          deliverableId,
          storageKey: 's3://deliverables/prj-001/intro-v2.mov',
          fileName: 'intro_final_polish_v2.mov',
          fileSize: 480000000,
          fileMimeType: 'video/quicktime',
          changelogNotes: 'Brightened typography and adjusted timing to 0:04 per feedback.',
        });

      expect(v2Res.status).toBe(201);
      expect(v2Res.body.data.versionNumber).toBe(2);

      // 6. Client approves Version 2
      const approveRes = await request(app)
        .post(`/api/v1/deliverables/approvals/${v2Res.body.data.id}/decide`)
        .set('Authorization', `Bearer ${clientToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          decision: ApprovalDecision.APPROVED,
          comments: 'Approved! Excellent timing and vibrant typography.',
        });

      expect(approveRes.status).toBe(200);
      expect(approveRes.body.data.decision).toBe(ApprovalDecision.APPROVED);
    });
  });

  describe('Module 06: Dedicated Client Portal', () => {
    it('should isolate client portal view to only the authenticated client projects and deliverables', async () => {
      // Create project for Warner Media
      await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          clientId,
          name: 'Warner Film Project',
        });

      // Create another client & project
      const otherClient = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          name: 'Rival Studio Executive',
          email: 'rival@studio.com',
          company: 'Rival Studios',
        });

      await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Organization-Id', orgId)
        .send({
          clientId: otherClient.body.data.id,
          name: 'Confidential Rival Feature',
        });

      // Warner Media client queries Client Portal
      const portalRes = await request(app)
        .get('/api/v1/portal/dashboard')
        .set('Authorization', `Bearer ${clientToken}`)
        .set('X-Organization-Id', orgId);

      expect(portalRes.status).toBe(200);
      expect(portalRes.body.success).toBe(true);
      expect(portalRes.body.data.client.email).toBe('client@warner.com');
      // Must only see Warner Film Project, NEVER the Rival Feature!
      expect(portalRes.body.data.projects).toHaveLength(1);
      expect(portalRes.body.data.projects[0].name).toBe('Warner Film Project');
    });
  });
});

