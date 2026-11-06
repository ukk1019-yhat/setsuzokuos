"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const auth_guard_1 = require("../../middleware/auth.guard");
const tenant_guard_1 = require("../../middleware/tenant.guard");
const rbac_guard_1 = require("../../middleware/rbac.guard");
const reports_service_1 = require("./reports.service");
exports.reportsRouter = (0, express_1.Router)();
exports.reportsRouter.use(auth_guard_1.authGuard);
exports.reportsRouter.use(tenant_guard_1.tenantGuard);
// 1. Get Live Business Overview Intelligence Report
exports.reportsRouter.get('/overview', (0, rbac_guard_1.requirePermission)('reports:view'), async (req, res, next) => {
    try {
        const organizationId = req.tenant?.organizationId || req.organizationId;
        const overview = await reports_service_1.reportsService.getBusinessOverview(organizationId);
        res.status(200).json({
            success: true,
            data: overview,
        });
    }
    catch (err) {
        next(err);
    }
});
