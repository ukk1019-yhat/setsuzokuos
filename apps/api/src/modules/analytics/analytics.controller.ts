/**
 * Copyright (c) 2026 Setsuzoku Media Labs. All rights reserved.
 */
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { analyticsService } from './analytics.service';
import { publicViewRateLimiter } from '../../middleware/rate-limiter.middleware';

export const analyticsRouter = Router();

const RecordWebsiteViewSchema = z
  .object({
    visitorId: z
      .string()
      .trim()
      .min(1)
      .max(64)
      .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid visitor token format')
      .optional(),
  })
  .strict();

/**
 * Retrieve aggregate website views count.
 */
analyticsRouter.get('/views', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await analyticsService.getWebsiteViews();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Increment aggregate website views count with anti-abuse rate limiting.
 */
analyticsRouter.post(
  '/views',
  publicViewRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = RecordWebsiteViewSchema.parse(req.body ?? {});
      const stats = await analyticsService.recordWebsiteView(validated.visitorId);
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }
);

