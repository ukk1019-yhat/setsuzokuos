/**
 * Copyright (c) 2026 Setsuzoku Media Labs. All rights reserved.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/storage/db';
import { securityRateLimiter } from '../src/middleware/rate-limiter.middleware';

const app = createApp();

describe('Website View Counter Analytics API (/api/v1/analytics/views)', () => {
  beforeEach(() => {
    db.clear();
    securityRateLimiter.resetAll();
  });

  it('should start at 0 views and increment views and unique visitors accurately', async () => {
    const initial = await request(app).get('/api/v1/analytics/views');
    expect(initial.status).toBe(200);
    expect(initial.body.success).toBe(true);
    expect(initial.body.data).toEqual({ totalViews: 0, uniqueVisitors: 0 });

    const first = await request(app)
      .post('/api/v1/analytics/views')
      .send({ visitorId: 'visitor_alpha_001' });
    expect(first.status).toBe(200);
    expect(first.body.data).toEqual({ totalViews: 1, uniqueVisitors: 1 });

    // Same visitor visiting again increments totalViews but preserves uniqueVisitors = 1
    const repeat = await request(app)
      .post('/api/v1/analytics/views')
      .send({ visitorId: 'visitor_alpha_001' });
    expect(repeat.status).toBe(200);
    expect(repeat.body.data).toEqual({ totalViews: 2, uniqueVisitors: 1 });

    // Second distinct visitor increments both
    const second = await request(app)
      .post('/api/v1/analytics/views')
      .send({ visitorId: 'visitor_beta_002' });
    expect(second.status).toBe(200);
    expect(second.body.data).toEqual({ totalViews: 3, uniqueVisitors: 2 });
  });

  it('should reject invalid payloads and unknown properties via Zod schema validation', async () => {
    const invalidFormat = await request(app)
      .post('/api/v1/analytics/views')
      .send({ visitorId: '<script>alert(1)</script>' });
    expect(invalidFormat.status).toBe(400);

    const extraField = await request(app)
      .post('/api/v1/analytics/views')
      .send({ visitorId: 'valid_id_1', totalViews: 999999 });
    expect(extraField.status).toBe(400);
  });

  it('should enforce anti-abuse rate limiting on view recording endpoint', async () => {
    for (let i = 0; i < 30; i++) {
      const res = await request(app).post('/api/v1/analytics/views').send({});
      expect(res.status).toBe(200);
    }

    const blocked = await request(app).post('/api/v1/analytics/views').send({});
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});

