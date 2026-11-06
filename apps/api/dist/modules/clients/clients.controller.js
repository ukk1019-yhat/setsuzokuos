"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientsRouter = void 0;
const express_1 = require("express");
const shared_1 = require("@setsuzoku/shared");
const clients_service_1 = require("./clients.service");
const auth_guard_1 = require("../../middleware/auth.guard");
const tenant_guard_1 = require("../../middleware/tenant.guard");
const rbac_guard_1 = require("../../middleware/rbac.guard");
exports.clientsRouter = (0, express_1.Router)();
exports.clientsRouter.use(auth_guard_1.authGuard);
exports.clientsRouter.use(tenant_guard_1.tenantGuard);
// List clients
exports.clientsRouter.get('/', (0, rbac_guard_1.requirePermission)('clients:manage'), async (req, res, next) => {
    try {
        const search = req.query.search;
        const result = await clients_service_1.clientsService.getClients(req.tenant.organizationId, search);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Create client
exports.clientsRouter.post('/', (0, rbac_guard_1.requirePermission)('clients:manage'), async (req, res, next) => {
    try {
        const validated = shared_1.CreateClientSchema.parse(req.body);
        const result = await clients_service_1.clientsService.createClient(req.tenant.organizationId, validated, req.user.id);
        return res.status(201).json({
            success: true,
            data: result,
            message: 'Client profile created successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// Get client detail & 360 dossier
exports.clientsRouter.get('/:id', (0, rbac_guard_1.requirePermission)('clients:manage'), async (req, res, next) => {
    try {
        const result = await clients_service_1.clientsService.getClientById(req.tenant.organizationId, req.params.id);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Update client
exports.clientsRouter.patch('/:id', (0, rbac_guard_1.requirePermission)('clients:manage'), async (req, res, next) => {
    try {
        const validated = shared_1.UpdateClientSchema.parse(req.body);
        const result = await clients_service_1.clientsService.updateClient(req.tenant.organizationId, req.params.id, validated, req.user.id);
        return res.status(200).json({
            success: true,
            data: result,
            message: 'Client profile updated successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
