import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError || err.name === 'ZodError' || Array.isArray(err.issues)) {
    const issues = err.errors || err.issues || [];
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: issues.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : e.path,
          message: e.message,
        })),
      },
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  
  // Log full stack trace internally to server logs
  console.error(`[API Error] ${req.method} ${req.url} - ${statusCode}:`, err);

  // Requirement: Generic errors shown to users; details go to server logs only
  const clientMessage =
    statusCode >= 500
      ? 'An unexpected error occurred. Please contact technical support if this persists.'
      : err.message || 'Request failed';

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST'),
      message: clientMessage,
    },
  });
}
