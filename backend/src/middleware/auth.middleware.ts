import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '@prisma/client';
import { verifyToken } from '../lib/jwt';
import { isBlacklisted } from '../lib/token-blacklist';
import { prisma } from '../lib/prisma';

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_NAME = isProd ? '__Host-emoclew_token' : 'emoclew_token';

function extractToken(req: Request): string | null {
  // 1. Prefer httpOnly cookie (browser clients via BFF)
  const cookie = req.cookies?.[COOKIE_NAME];
  if (cookie) return cookie;

  // 2. Fall back to Authorization: Bearer (API / mobile clients)
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);

  return null;
}

export async function requireAuth(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const payload = verifyToken(token);

    if (isBlacklisted(payload.jti)) {
      res.status(401).json({ error: 'Session has been revoked' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      res.status(401).json({ error: 'Account not found' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as User;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}