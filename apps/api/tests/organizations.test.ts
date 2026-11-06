import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/storage/db';

const app = createApp();

describe('Organization & Onboarding API (/api/v1/organizations)', () => {
  let authToken: string;

  beforeEach(async () => {
    db.clear();

    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Dev Owner',
        email: 'owner@devagency.com',
        password: 'Password123!',
      });

    authToken = reg.body.data.accessToken;
  });

  it('should onboard and create a new organization with currency and tax info', async () => {
    const res = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Nexus Tech Studio',
        currency: 'USD',
        timezone: 'America/New_York',
        country: 'US',
        businessEmail: 'contact@nexustech.io',
        taxNumber: 'US-987654321',
        description: 'Boutique web and mobile engineering firm.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Nexus Tech Studio');
    expect(res.body.data.currency).toBe('USD');
    expect(res.body.data.slug).toBe('nexus-tech-studio');
    expect(res.body.data.taxNumber).toBe('US-987654321');
  });

  it('should fetch the current organization details', async () => {
    const createRes = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Alpha Creative',
        currency: 'INR',
      });

    const orgId = createRes.body.data.id;

    const currentRes = await request(app)
      .get('/api/v1/organizations/current')
      .set('Authorization', `Bearer ${authToken}`)
      .set('X-Organization-Id', orgId);

    expect(currentRes.status).toBe(200);
    expect(currentRes.body.data.id).toBe(orgId);
    expect(currentRes.body.data.name).toBe('Alpha Creative');
    expect(currentRes.body.data.currency).toBe('INR');
  });

  it('should update organization business details and settings', async () => {
    const createRes = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Beta Media',
      });

    const orgId = createRes.body.data.id;

    const patchRes = await request(app)
      .patch('/api/v1/organizations/current')
      .set('Authorization', `Bearer ${authToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        name: 'Beta Media Global',
        description: 'Updated video production powerhouse.',
        currency: 'EUR',
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.name).toBe('Beta Media Global');
    expect(patchRes.body.data.currency).toBe('EUR');
    expect(patchRes.body.data.description).toBe('Updated video production powerhouse.');
  });

  it('should list all organizations a user belongs to', async () => {
    await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'First Org' });

    await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Second Org' });

    const listRes = await request(app)
      .get('/api/v1/organizations/my-orgs')
      .set('Authorization', `Bearer ${authToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(2);
    expect(listRes.body.data[0].role).toBe('ORGANIZATION_OWNER');
  });
});

