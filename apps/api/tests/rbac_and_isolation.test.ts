import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/storage/db';
import { MembershipRole } from '@setsuzoku/shared';

const app = createApp();

describe('Multi-Tenant Isolation & Role-Based Access Control (RBAC)', () => {
  let ownerToken: string;
  let orgId: string;
  let employeeToken: string;

  beforeEach(async () => {
    db.clear();

    // 1. Create Organization Owner
    const ownerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Boss Owner',
        email: 'boss@agency.com',
        password: 'Password123!',
        organizationName: 'Premier Agency',
      });

    ownerToken = ownerRes.body.data.accessToken;
    orgId = ownerRes.body.data.organizations[0].organization.id;

    // 2. Create another user who will be an employee
    const empReg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Worker Bee',
        email: 'worker@agency.com',
        password: 'Password123!',
      });

    employeeToken = empReg.body.data.accessToken;

    // 3. Owner invites Worker Bee as EMPLOYEE to Premier Agency
    await request(app)
      .post('/api/v1/members/invite')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        email: 'worker@agency.com',
        fullName: 'Worker Bee',
        role: MembershipRole.EMPLOYEE,
        title: 'Junior Developer',
      });
  });

  it('should enforce strict tenant isolation: uninvited user cannot access organization', async () => {
    // Register outsider user
    const outsider = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Intruder Malory',
        email: 'malory@outside.com',
        password: 'Password123!',
      });

    const outsiderToken = outsider.body.data.accessToken;

    // Intruder attempts to access Premier Agency
    const res = await request(app)
      .get('/api/v1/organizations/current')
      .set('Authorization', `Bearer ${outsiderToken}`)
      .set('X-Organization-Id', orgId);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('TENANT_FORBIDDEN');
  });

  it('should allow Owner to view all members of the organization', async () => {
    const res = await request(app)
      .get('/api/v1/members')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2); // Owner + Employee
  });

  it('should prevent Employee from inviting other members (INSUFFICIENT_PERMISSIONS)', async () => {
    const res = await request(app)
      .post('/api/v1/members/invite')
      .set('Authorization', `Bearer ${employeeToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        email: 'another@agency.com',
        fullName: 'Another Worker',
        role: MembershipRole.EMPLOYEE,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
  });

  it('should allow Owner to promote Employee to Manager', async () => {
    const membersRes = await request(app)
      .get('/api/v1/members')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId);

    const employeeMem = membersRes.body.data.find(
      (m: any) => m.user.email === 'worker@agency.com'
    );

    const patchRes = await request(app)
      .patch(`/api/v1/members/${employeeMem.membershipId}/role`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        role: MembershipRole.MANAGER,
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.role).toBe(MembershipRole.MANAGER);
  });

  it('should prevent Employee from changing member roles', async () => {
    const membersRes = await request(app)
      .get('/api/v1/members')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId);

    const employeeMem = membersRes.body.data.find(
      (m: any) => m.user.email === 'worker@agency.com'
    );

    const patchRes = await request(app)
      .patch(`/api/v1/members/${employeeMem.membershipId}/role`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        role: MembershipRole.ADMIN,
      });

    expect(patchRes.status).toBe(403);
    expect(patchRes.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
  });

  it('should prevent deleting or demoting the sole organization owner', async () => {
    const membersRes = await request(app)
      .get('/api/v1/members')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId);

    const ownerMem = membersRes.body.data.find(
      (m: any) => m.user.email === 'boss@agency.com'
    );

    // Try to demote owner to employee
    const demoteRes = await request(app)
      .patch(`/api/v1/members/${ownerMem.membershipId}/role`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        role: MembershipRole.EMPLOYEE,
      });

    expect(demoteRes.status).toBe(400);
    expect(demoteRes.body.error.code).toBe('CANNOT_DEMOTE_SOLE_OWNER');

    // Try to delete owner
    const deleteRes = await request(app)
      .delete(`/api/v1/members/${ownerMem.membershipId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Organization-Id', orgId);

    expect(deleteRes.status).toBe(400);
    expect(deleteRes.body.error.code).toBe('CANNOT_REMOVE_OWNER');
  });
});

