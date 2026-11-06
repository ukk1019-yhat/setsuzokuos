import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { db, UserRecord } from '../storage/db';

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
  tenant?: {
    organizationId: string;
    role: string;
    membershipId: string;
  };
}

export function authGuard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is missing or malformed',
      },
    });
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
    db.findUserById(payload.userId).then((user) => {
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User belonging to this token no longer exists',
          },
        });
      }

      req.user = user;
      next();
    }).catch(next);
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired access token',
      },
    });
  }
}

