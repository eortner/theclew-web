import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { prisma } from '../lib/prisma';
import { signToken, verifyToken } from '../lib/jwt';
import { blacklistToken } from '../lib/token-blacklist';
import { registerSchema, loginSchema } from './auth.validation';
import { User } from '@prisma/client';

const isProd = process.env.NODE_ENV === 'production';

// In production: __Host- prefix enforces Secure + no Domain + path=/ at browser level
// In development: plain name since __Host- requires HTTPS and silently fails on http://localhost
const COOKIE_NAME = isProd ? '__Host-emoclew_token' : 'emoclew_token';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const safeUserSelect = {
  id: true, email: true, name: true, avatarUrl: true,
  role: true, provider: true, createdAt: true,
} as const;

function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
}

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, name, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    res.status(409).json({ error: 'Unable to create account with these details' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
    select: safeUserSelect,
  });

  const token = signToken(user as User);
  setAuthCookie(res, token);
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  passport.authenticate('local', { session: false }, (err: Error, user: User | false) => {
    if (err) return next(err);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({
      user: {
        id: user.id, email: user.email, name: user.name,
        avatarUrl: user.avatarUrl, role: user.role,
      },
    });
  })(req, res, next);
}

export function logout(req: Request, res: Response): void {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      const payload = verifyToken(token);
      blacklistToken(payload.jti);
    } catch {
      // Already invalid — still clear and return 204
    }
  }
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.status(204).send();
}

export function oauthCallback(req: Request, res: Response): void {
  const user = req.user as User;
  const token = signToken(user);
  setAuthCookie(res, token);
  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
}