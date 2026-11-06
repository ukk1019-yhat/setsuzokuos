import { Router, Response } from 'express';
import { RegisterSchema, LoginSchema } from '@setsuzoku/shared';
import { authService } from './auth.service';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const validated = RegisterSchema.parse(req.body);
    const result = await authService.register(validated);
    return res.status(201).json({
      success: true,
      data: result,
      message: 'Account registered successfully',
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const validated = LoginSchema.parse(req.body);
    const result = await authService.login(validated);
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

