import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';

const TOTP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function requireTotp(req: Request, res: Response, next: NextFunction): void {
  const user = req.user as User;

  if (!user.totpEnabled) {
    res.status(403).json({ error: 'TOTP must be enabled to perform this action' });
    return;
  }

  if (!user.totpVerifiedAt) {
    res.status(403).json({ error: 'TOTP verification required' });
    return;
  }

  const age = Date.now() - new Date(user.totpVerifiedAt).getTime();
  if (age > TOTP_WINDOW_MS) {
    res.status(403).json({ error: 'TOTP verification expired — please re-verify' });
    return;
  }

  next();
}