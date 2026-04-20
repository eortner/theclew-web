import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { prisma } from '../lib/prisma';
import { signToken, verifyToken } from '../lib/jwt';
import { blacklistToken } from '../lib/token-blacklist';
import { registerSchema, loginSchema, loginTotpSchema } from './auth.validation';
import { verifyToken as verifyTotpToken } from './totp.service';
import { User } from '@prisma/client';

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_NAME = isProd ? '__Host-emoclew_token' : 'emoclew_token';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   isProd,
  sameSite: 'strict' as const,
  maxAge:   7 * 24 * 60 * 60 * 1000,
  path:     '/',
};

const safeUserSelect = {
  id: true, email: true, name: true, avatarUrl: true,
  role: true, provider: true, createdAt: true,
  totpEnabled: true, totpVerifiedAt: true,
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
    data:   { email, name, passwordHash },
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

  passport.authenticate('local', { session: false }, async (err: Error, user: User | false) => {
    if (err) return next(err);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // If TOTP is enabled, do not issue JWT yet — require TOTP step
    if (user.totpEnabled) {
      res.status(202).json({ requiresTotp: true });
      return;
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({
      user: {
        id: user.id, email: user.email, name: user.name,
        avatarUrl: user.avatarUrl, role: user.role,
        totpEnabled: user.totpEnabled,
      },
    });
  })(req, res, next);
}

export async function loginWithTotp(req: Request, res: Response): Promise<void> {
  const parsed = loginTotpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password, totpToken } = parsed.data;

  // Re-verify credentials — never trust client state
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  if (!user.totpEnabled || !user.totpSecret) {
    res.status(400).json({ error: 'TOTP is not enabled on this account' });
    return;
  }

  const validTotp = await verifyTotpToken(totpToken, user.totpSecret);
  if (!validTotp) {
    res.status(401).json({ error: 'Invalid authenticator code' });
    return;
  }

  // Update totpVerifiedAt so contract-signing window is fresh
  await prisma.user.update({
    where: { id: user.id },
    data:  { totpVerifiedAt: new Date() },
  });

  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({
    user: {
      id: user.id, email: user.email, name: user.name,
      avatarUrl: user.avatarUrl, role: user.role,
      totpEnabled: user.totpEnabled,
    },
  });
}

export function logout(req: Request, res: Response): void {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      const payload = verifyToken(token);
      blacklistToken(payload.jti);
    } catch {
      // Already invalid — still clear and proceed
    }
  }
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ message: 'Logged out' });
}

export function oauthCallback(req: Request, res: Response): void {
  const user = req.user as User;
  const token = signToken(user);
  setAuthCookie(res, token);
  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
}