import { Router, Response } from 'express';
import { privacyService } from './privacy.service';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard';

export const privacyRouter = Router();

// Public Privacy & DPDP Notice
privacyRouter.get('/policy', (req, res) => {
  return res.status(200).json({
    success: true,
    data: privacyService.getPrivacyPolicy(),
  });
});

// Authenticated Data Subject Access Request (Export)
privacyRouter.get('/export', authGuard, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const data = await privacyService.exportUserData(req.user!.id);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

// Authenticated Right to Erasure / Deletion Request
privacyRouter.post('/delete-request', authGuard, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const reason = req.body?.reason;
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    const result = await privacyService.requestDataDeletion(req.user!.id, reason, ip);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});
