import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/storage/db';

const app = createApp();

describe('Authentication API (/api/v1/auth)', () => {
  beforeEach(() => {
    db.clear();
  });

  it('should register a new user successfully and return tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
        organizationName: 'Acme Digital Studio',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('jane@example.com');
    expect(res.body.data.user.fullName).toBe('Jane Doe');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.organizations).toHaveLength(1);
    expect(res.body.data.organizations[0].organization.name).toBe('Acme Digital Studio');
    expect(res.body.data.organizations[0].role).toBe('ORGANIZATION_OWNER');
  });

  it('should reject registration if email is already taken', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Jane Doe',
        email: 'duplicate@example.com',
        password: 'Password123!',
      });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Jane Doe Two',
        email: 'duplicate@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('USER_ALREADY_EXISTS');
  });

  it('should reject registration with weak password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Weak Pass',
        email: 'weak@example.com',
        password: 'pass',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should login an existing user with valid credentials', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Alice Smith',
        email: 'alice@example.com',
        password: 'ValidPassword123!',
        organizationName: 'Alice Agency',
      });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'ValidPassword123!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.accessToken).toBeDefined();
    expect(loginRes.body.data.user.email).toBe('alice@example.com');
  });

  it('should reject login with wrong password', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Bob Smith',
        email: 'bob@example.com',
        password: 'ValidPassword123!',
      });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'bob@example.com',
        password: 'WrongPassword999!',
      });

    expect(loginRes.status).toBe(401);
    expect(loginRes.body.success).toBe(false);
    expect(loginRes.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should allow authenticated user to fetch their profile via /me', async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Charlie Profile',
        email: 'charlie@example.com',
        password: 'ValidPassword123!',
      });

    const token = regRes.body.data.accessToken;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe('charlie@example.com');
  });

  it('should reject /me without Bearer token', async () => {
    const meRes = await request(app).get('/api/v1/auth/me');
    expect(meRes.status).toBe(401);
    expect(meRes.body.error.code).toBe('UNAUTHORIZED');
  });
});

