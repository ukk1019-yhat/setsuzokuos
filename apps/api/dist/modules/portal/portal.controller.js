"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portalRouter = void 0;
const express_1 = require("express");
const portal_service_1 = require("./portal.service");
const auth_guard_1 = require("../../middleware/auth.guard");
const tenant_guard_1 = require("../../middleware/tenant.guard");
exports.portalRouter = (0, express_1.Router)();
exports.portalRouter.use(auth_guard_1.authGuard);
exports.portalRouter.use(tenant_guard_1.tenantGuard);
exports.portalRouter.get('/dashboard', async (req, res, next) => {
    try {
        const result = await portal_service_1.clientPortalService.getClientDashboard(req.tenant.organizationId, req.user.email);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
