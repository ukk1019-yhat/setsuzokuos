"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const shared_1 = require("@setsuzoku/shared");
const auth_service_1 = require("./auth.service");
const auth_guard_1 = require("../../middleware/auth.guard");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/register', async (req, res, next) => {
    try {
        const validated = shared_1.RegisterSchema.parse(req.body);
        const result = await auth_service_1.authService.register(validated);
        return res.status(201).json({
            success: true,
            data: result,
            message: 'Account registered successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
exports.authRouter.post('/login', async (req, res, next) => {
    try {
        const validated = shared_1.LoginSchema.parse(req.body);
        const result = await auth_service_1.authService.login(validated);
        return res.status(200).json({
            success: true,
            data: result,
            message: 'Logged in successfully',
        });
    }
    catch (err) {
        next(err);
    }
});
exports.authRouter.get('/me', auth_guard_1.authGuard, async (req, res, next) => {
    try {
        const result = await auth_service_1.authService.getCurrentUser(req.user.id);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.authRouter.post('/logout', auth_guard_1.authGuard, (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
});
