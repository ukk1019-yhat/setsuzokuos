"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const zod_1 = require("zod");
function errorMiddleware(err, req, res, next) {
    if (err instanceof zod_1.ZodError || err.name === 'ZodError' || Array.isArray(err.issues)) {
        const issues = err.errors || err.issues || [];
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request data',
                details: issues.map((e) => ({
                    field: Array.isArray(e.path) ? e.path.join('.') : e.path,
                    message: e.message,
                })),
            },
        });
    }
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    console.error(`[API Error] ${req.method} ${req.url} - ${statusCode}:`, err);
    return res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message,
        },
    });
}
