"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliverablesRouter = void 0;
const express_1 = require("express");
const shared_1 = require("@setsuzoku/shared");
const deliverables_service_1 = require("./deliverables.service");
const auth_guard_1 = require("../../middleware/auth.guard");
const tenant_guard_1 = require("../../middleware/tenant.guard");
const rbac_guard_1 = require("../../middleware/rbac.guard");
exports.deliverablesRouter = (0, express_1.Router)();
exports.deliverablesRouter.use(auth_guard_1.authGuard);
exports.deliverablesRouter.use(tenant_guard_1.tenantGuard);
// Create deliverable container
exports.deliverablesRouter.post('/', (0, rbac_guard_1.requirePermission)('deliverables:submit'), async (req, res, next) => {
    try {
        const validated = shared_1.CreateDeliverableSchema.parse(req.body);
        const result = await deliverables_service_1.deliverablesService.createDeliverable(req.tenant.organizationId, validated, req.user.id);
        return res.status(201).json({
            success: true,
            data: result,
            message: 'Deliverable registered successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
// Submit new version
exports.deliverablesRouter.post('/versions', (0, rbac_guard_1.requirePermission)('deliverables:submit'), async (req, res, next) => {
    try {
        const validated = shared_1.SubmitDeliverableVersionSchema.parse(req.body);
        const result = await deliverables_service_1.deliverablesService.submitVersion(req.tenant.organizationId, validated, req.user.id);
        return res.status(201).json({
            success: true,
            data: result,
            message: 'Deliverable version submitted for client review',
        });
    }
    catch (err) {
        next(err);
    }
});
// Get approvals queue
exports.deliverablesRouter.get('/approvals/queue', async (req, res, next) => {
    try {
        const result = await deliverables_service_1.deliverablesService.getApprovalsQueue(req.tenant.organizationId);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
// Formal client approval or revision request
exports.deliverablesRouter.post('/approvals/:versionId/decide', async (req, res, next) => {
    try {
        const validated = shared_1.DecideApprovalSchema.parse(req.body);
        const result = await deliverables_service_1.deliverablesService.decideApproval(req.tenant.organizationId, req.params.versionId, validated, {
            id: req.user.id,
            fullName: req.user.fullName,
            role: req.tenant.role,
        }, req.ip, req.headers['user-agent']);
        return res.status(200).json({
            success: true,
            data: result,
            message: `Deliverable marked as ${validated.decision}`,
        });
    }
    catch (err) {
        next(err);
    }
});
