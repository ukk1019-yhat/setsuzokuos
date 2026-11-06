import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
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
import { errorMiddleware } from './middleware/error.middleware';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  // Health check endpoints (supports all path variants)
  app.get(['/health', '/api/health', '/api/v1/health', '/v1/health'], (req, res) => {
    res.status(200).json({
      status: 'UP',
      service: 'SETSUZOKU OS API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API v1 Routes (supports both /api/v1 and /v1 in case of rewrite stripping)
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
  };

  mountRoutes('/api/v1');
  mountRoutes('/v1');

  // 404 Handler
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

