"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsRouter = void 0;
const express_1 = require("express");
const shared_1 = require("@setsuzoku/shared");
const projects_service_1 = require("./projects.service");
const auth_guard_1 = require("../../middleware/auth.guard");
const tenant_guard_1 = require("../../middleware/tenant.guard");
const rbac_guard_1 = require("../../middleware/rbac.guard");
exports.projectsRouter = (0, express_1.Router)();
exports.projectsRouter.use(auth_guard_1.authGuard);
exports.projectsRouter.use(tenant_guard_1.tenantGuard);
// List projects
exports.projectsRouter.get('/', (0, rbac_guard_1.requirePermission)('projects:view'), async (req, res, next) => {
    try {
        const filters = {
            clientId: req.query.clientId,
            status: req.query.status,
            managerId: req.query.managerId,
        };
        const result = await projects_service_1.projectsService.getProjects(req.tenant.organizationId, filters);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Create project manually
exports.projectsRouter.post('/', (0, rbac_guard_1.requirePermission)('projects:create'), async (req, res, next) => {
    try {
        const validated = shared_1.CreateProjectSchema.parse(req.body);
        const result = await projects_service_1.projectsService.createProject(req.tenant.organizationId, validated, req.user.id);
        return res.status(201).json({
            success: true,
            data: result,
            message: 'Project initiated successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// Spawn project from accepted quotation
exports.projectsRouter.post('/convert-quote', (0, rbac_guard_1.requirePermission)('projects:create'), async (req, res, next) => {
    try {
        const validated = shared_1.ConvertQuotationToProjectSchema.parse(req.body);
        const result = await projects_service_1.projectsService.convertFromQuotation(req.tenant.organizationId, validated, req.user.id);
        return res.status(201).json({
            success: true,
            data: result,
            message: 'Project created from accepted quotation successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// Get project details
exports.projectsRouter.get('/:id', (0, rbac_guard_1.requirePermission)('projects:view'), async (req, res, next) => {
    try {
        const result = await projects_service_1.projectsService.getProjectById(req.tenant.organizationId, req.params.id);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Update project
exports.projectsRouter.patch('/:id', (0, rbac_guard_1.requirePermission)('projects:manage'), async (req, res, next) => {
    try {
        const validated = shared_1.UpdateProjectSchema.parse(req.body);
        const result = await projects_service_1.projectsService.updateProject(req.tenant.organizationId, req.params.id, validated, req.user.id);
        return res.status(200).json({
            success: true,
            data: result,
            message: 'Project updated successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
