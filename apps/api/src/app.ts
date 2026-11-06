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

  // Health check endpoints
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'UP',
      service: 'SETSUZOKU OS API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'UP',
      service: 'SETSUZOKU OS API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API v1 Routes
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/organizations', organizationRouter);
  app.use('/api/v1/members', membersRouter);
  app.use('/api/v1/leads', leadsRouter);
  app.use('/api/v1/clients', clientsRouter);
  app.use('/api/v1/quotations', quotationsRouter);
  app.use('/api/v1/projects', projectsRouter);
  app.use('/api/v1/tasks', tasksRouter);
  app.use('/api/v1/deliverables', deliverablesRouter);
  app.use('/api/v1/portal', portalRouter);
  app.use('/api/v1/invoices', invoicesRouter);
  app.use('/api/v1/payments', paymentsRouter);
  app.use('/api/v1/reports', reportsRouter);

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

