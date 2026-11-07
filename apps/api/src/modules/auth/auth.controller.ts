import { Router, Response } from 'express';
import { RegisterSchema, LoginSchema } from '@setsuzoku/shared';
import { authService } from './auth.service';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard';
import { loginRateLimiter } from '../../middleware/rate-limiter.middleware';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const validated = RegisterSchema.parse(req.body);
    const result = await authService.register(validated);

    // Set secure, httpOnly cookie for session token
    res.cookie('setsuzoku_access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    return res.status(201).json({
      success: true,
      data: result,
      message: 'Account registered successfully',
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', loginRateLimiter, async (req, res, next) => {
  try {
    const validated = LoginSchema.parse(req.body);
    const result = await authService.login(validated);

    // Set secure, httpOnly session cookie
    res.cookie('setsuzoku_access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Logged in successfully',
    });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', authGuard, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await authService.getCurrentUser(req.user!.id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', authGuard, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

