/**
 * Copyright (c) 2026 Setsuzoku Media Labs. All rights reserved.
 */
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env';
import { authRouter } from './modules/auth/auth.controller';
import { organizationRouter } from './modules/organizations/org.controller';
import { membersRouter } from './modules/members/members.controller';
import { leadsRouter } from './modules/leads/leads.controller';
import { clientsRouter } from './modules/clients/clients.controller';
import { quotationsRouter } from './modules/quotations/quotations.controller';
import { projectsRouter } from './modules/projects/projects.controller';
import { tasksRouter } from './modules/tasks/tasks.controller';
import { deliverablesRouter } from './modules/deliverables/deliverables.controller';
import { portalRouter } from './modules/portal/portal.controller';
import { invoicesRouter } from './modules/invoices/invoices.controller';
import { paymentsRouter } from './modules/payments/payments.controller';
import { reportsRouter } from './modules/reports/reports.controller';
import { privacyRouter } from './modules/privacy/privacy.controller';
import { analyticsRouter } from './modules/analytics/analytics.controller';
import { errorMiddleware } from './middleware/error.middleware';
import { securityRateLimiter } from './middleware/rate-limiter.middleware';

export function createApp(): Application {
  const app = express();

  // 1. Mandatory Security Headers (CSP, anti-clickjacking frame-ancestors, nosniff, referrer policy)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"], // Disallow embedding inside iframes (Clickjacking defense)
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
        },
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xContentTypeOptions: true,
      xFrameOptions: { action: 'deny' },
    })
  );

  // 2. Restrict CORS to known origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://setsuzoku.info',
    'https://www.setsuzoku.info',
    'https://setsuzokuos.vercel.app',
    ENV.CORS_ORIGIN,
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, test runners, direct server-to-server)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith('.setsuzoku.info') ||
          origin.endsWith('.vercel.app')
        ) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Organization-Id',
        'x-razorpay-signature',
        'X-Requested-With',
      ],
    })
  );

  // 3. Body parsers with tight request size limits
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  // 4. Rate Limiting Protection on all API endpoints
  app.use(
    '/api',
    securityRateLimiter.limit({
      windowMs: 60 * 1000,
      max: 300,
      message: 'Too many API requests from this client. Please throttle requests.',
    })
  );

  // 5. Vercel Serverless Function Path Normalization
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/index.js')) {
      req.url = req.url.replace('/api/index.js', '') || '/';
    } else if (req.url.startsWith('/api/index')) {
      req.url = req.url.replace('/api/index', '') || '/';
    }
    next();
  });

  // Health check endpoints (supports all path variants)
  app.get(
    [
      '/health',
      '/api/health',
      '/api/v1/health',
      '/v1/health',
      '/api/index.js/health',
      '/api/index/health',
    ],
    (req, res) => {
      res.status(200).json({
        status: 'UP',
        service: 'SETSUZOKU OS API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    }
  );

  // REST API v1 Routes (supports /api/v1, /v1, /api, and root in case of rewrite stripping)
  const mountRoutes = (prefix: string) => {
    app.use(`${prefix}/auth`, authRouter);
    app.use(`${prefix}/organizations`, organizationRouter);
    app.use(`${prefix}/members`, membersRouter);
    app.use(`${prefix}/leads`, leadsRouter);
    app.use(`${prefix}/clients`, clientsRouter);
    app.use(`${prefix}/quotations`, quotationsRouter);
    app.use(`${prefix}/projects`, projectsRouter);
    app.use(`${prefix}/tasks`, tasksRouter);
    app.use(`${prefix}/deliverables`, deliverablesRouter);
    app.use(`${prefix}/portal`, portalRouter);
    app.use(`${prefix}/invoices`, invoicesRouter);
    app.use(`${prefix}/payments`, paymentsRouter);
    app.use(`${prefix}/reports`, reportsRouter);
    app.use(`${prefix}/privacy`, privacyRouter);
    app.use(`${prefix}/analytics`, analyticsRouter);
  };

  mountRoutes('/api/v1');
  mountRoutes('/v1');
  mountRoutes('/api');
  mountRoutes('');

  // 404 Handler - Default Deny
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.originalUrl} not found`,
      },
    });
  });

  // Central Error Middleware
  app.use(errorMiddleware);

  return app;
}

