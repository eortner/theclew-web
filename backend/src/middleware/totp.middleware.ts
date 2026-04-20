import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';

const TOTP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/**
 * requireTotpSetup — blocks the action entirely if TOTP is not enabled.
 * Returns a specific flag so the frontend can redirect to settings.
 */
export function requireTotpSetup(req: Request, res: Response, next: NextFunction): void {
  const user = req.user as User;

  if (!user.totpEnabled) {
    res.status(403).json({
      error:        'Two-factor authentication must be enabled to perform this action',
      totpRequired: true,
    });
    return;
  }

  next();
}

/**
 * requireTotp — TOTP must be enabled AND recently verified (within 5 min window).
 * Used on contract-signing endpoints.
 */
export function requireTotp(req: Request, res: Response, next: NextFunction): void {
  const user = req.user as User;

  if (!user.totpEnabled) {
    res.status(403).json({
      error:        'Two-factor authentication must be enabled to perform this action',
      totpRequired: true,
    });
    return;
  }

  if (!user.totpVerifiedAt) {
    res.status(403).json({
      error:            'TOTP verification required before this action',
      totpVerifyNeeded: true,
    });
    return;
  }

  const age = Date.now() - new Date(user.totpVerifiedAt).getTime();
  if (age > TOTP_WINDOW_MS) {
    res.status(403).json({
      error:            'TOTP session expired — please re-verify',
      totpVerifyNeeded: true,
    });
    return;
  }

  next();
}