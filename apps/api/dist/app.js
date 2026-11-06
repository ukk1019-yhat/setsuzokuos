"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_controller_1 = require("./modules/auth/auth.controller");
const org_controller_1 = require("./modules/organizations/org.controller");
const members_controller_1 = require("./modules/members/members.controller");
const leads_controller_1 = require("./modules/leads/leads.controller");
const clients_controller_1 = require("./modules/clients/clients.controller");
const quotations_controller_1 = require("./modules/quotations/quotations.controller");
const projects_controller_1 = require("./modules/projects/projects.controller");
const tasks_controller_1 = require("./modules/tasks/tasks.controller");
const deliverables_controller_1 = require("./modules/deliverables/deliverables.controller");
const portal_controller_1 = require("./modules/portal/portal.controller");
const invoices_controller_1 = require("./modules/invoices/invoices.controller");
const payments_controller_1 = require("./modules/payments/payments.controller");
const reports_controller_1 = require("./modules/reports/reports.controller");
const error_middleware_1 = require("./middleware/error.middleware");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: true,
        credentials: true,
    }));
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
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
    const mountRoutes = (prefix) => {
        app.use(`${prefix}/auth`, auth_controller_1.authRouter);
        app.use(`${prefix}/organizations`, org_controller_1.organizationRouter);
        app.use(`${prefix}/members`, members_controller_1.membersRouter);
        app.use(`${prefix}/leads`, leads_controller_1.leadsRouter);
        app.use(`${prefix}/clients`, clients_controller_1.clientsRouter);
        app.use(`${prefix}/quotations`, quotations_controller_1.quotationsRouter);
        app.use(`${prefix}/projects`, projects_controller_1.projectsRouter);
        app.use(`${prefix}/tasks`, tasks_controller_1.tasksRouter);
        app.use(`${prefix}/deliverables`, deliverables_controller_1.deliverablesRouter);
        app.use(`${prefix}/portal`, portal_controller_1.portalRouter);
        app.use(`${prefix}/invoices`, invoices_controller_1.invoicesRouter);
        app.use(`${prefix}/payments`, payments_controller_1.paymentsRouter);
        app.use(`${prefix}/reports`, reports_controller_1.reportsRouter);
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
    app.use(error_middleware_1.errorMiddleware);
    return app;
}
