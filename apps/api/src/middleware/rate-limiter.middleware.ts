import { Request, Response, NextFunction } from 'express';

interface RateLimitStoreItem {
  count: number;
  resetAt: number;
}

interface LockoutStoreItem {
  failedAttempts: number;
  lockedUntil: number;
}

class SecurityRateLimiter {
  private ipLimits: Map<string, RateLimitStoreItem> = new Map();
  private authFailures: Map<string, LockoutStoreItem> = new Map();

  constructor() {
    // Periodically clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, item] of this.ipLimits.entries()) {
      if (now > item.resetAt) this.ipLimits.delete(key);
    }
    for (const [key, item] of this.authFailures.entries()) {
      if (now > item.lockedUntil && item.failedAttempts === 0) {
        this.authFailures.delete(key);
      }
    }
  }

  /**
   * Generic sliding-window rate limiter
   */
  public limit(options: { windowMs: number; max: number; message?: string; keyGenerator?: (req: Request) => string }) {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = options.keyGenerator ? options.keyGenerator(req) : (req.ip || req.socket.remoteAddress || 'unknown');
      const now = Date.now();

      let record = this.ipLimits.get(key);
      if (!record || now > record.resetAt) {
        record = {
          count: 1,
          resetAt: now + options.windowMs,
        };
        this.ipLimits.set(key, record);
      } else {
        record.count++;
      }

      const remaining = Math.max(0, options.max - record.count);
      res.setHeader('X-RateLimit-Limit', options.max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000));

      if (record.count > options.max) {
        res.setHeader('Retry-After', Math.ceil((record.resetAt - now) / 1000));
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: options.message || 'Too many requests, please try again later.',
          },
        });
      }

      next();
    };
  }

  /**
   * Check if account/IP is locked out due to repeated failed logins
   */
  public checkLockout(identifier: string): { isLocked: boolean; remainingSec: number } {
    const record = this.authFailures.get(identifier);
    if (!record) return { isLocked: false, remainingSec: 0 };

    const now = Date.now();
    if (now < record.lockedUntil) {
      return {
        isLocked: true,
        remainingSec: Math.ceil((record.lockedUntil - now) / 1000),
      };
    }

    // Lockout expired, reset counter if past lockout window
    if (record.failedAttempts >= 5 && now >= record.lockedUntil) {
      this.authFailures.delete(identifier);
    }

    return { isLocked: false, remainingSec: 0 };
  }

  /**
   * Record a failed authentication attempt (locks after 5 failures for 15 minutes)
   */
  public recordAuthFailure(identifier: string): { locked: boolean; attemptsLeft: number } {
    const now = Date.now();
    let record = this.authFailures.get(identifier);

    if (!record || (now > record.lockedUntil && record.lockedUntil > 0)) {
      record = {
        failedAttempts: 1,
        lockedUntil: 0,
      };
      this.authFailures.set(identifier, record);
    } else {
      record.failedAttempts++;
    }

    const MAX_FAILURES = 5;
    const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

    if (record.failedAttempts >= MAX_FAILURES) {
      record.lockedUntil = now + LOCKOUT_DURATION_MS;
      return { locked: true, attemptsLeft: 0 };
    }

    return { locked: false, attemptsLeft: MAX_FAILURES - record.failedAttempts };
  }

  /**
   * Clear failed attempts upon successful login
   */
  public recordAuthSuccess(identifier: string): void {
    this.authFailures.delete(identifier);
  }

  public resetAll(): void {
    this.ipLimits.clear();
    this.authFailures.clear();
  }
}

export const securityRateLimiter = new SecurityRateLimiter();

// Middleware shortcuts
export const loginRateLimiter = securityRateLimiter.limit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
});

export const publicLeadIntakeRateLimiter = securityRateLimiter.limit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Rate limit reached for public inquiries. Please try again later or contact info@setsuzoku.in.',
});

export const publicViewRateLimiter = securityRateLimiter.limit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => `views:${req.ip || req.socket.remoteAddress || 'unknown'}`,
  message: 'Too many view tracking requests. Please slow down.',
});
