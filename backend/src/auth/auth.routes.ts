import { Router } from 'express';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import { randomBytes } from 'crypto';
import { register, login, logout, oauthCallback } from './auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { isGoogleEnabled, isFacebookEnabled } from '../lib/env';

export const authRouter = Router();

// Strict rate limit for auth endpoints — 10 attempts / 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again in 15 minutes' },
  skipSuccessfulRequests: true, // only count failed attempts
});

// ── Local auth ──
authRouter.post('/register', authLimiter, register);
authRouter.post('/login',    authLimiter, login);
authRouter.post('/logout',   requireAuth, logout);

// ── Google OAuth ──
if (isGoogleEnabled) {
  authRouter.get('/google', (req, res, next) => {
    const state = randomBytes(16).toString('hex');
    // Store state in a short-lived cookie for CSRF validation
    res.cookie('oauth_state', state, {
      httpOnly: true, sameSite: 'lax',
      maxAge: 5 * 60 * 1000, // 5 minutes
      secure: process.env.NODE_ENV === 'production',
    });
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
      state,
    })(req, res, next);
  });

  authRouter.get('/google/callback',
    (req, res, next) => {
      const { state } = req.query;
      const cookieState = req.cookies?.oauth_state;
      if (!state || state !== cookieState) {
        res.status(403).json({ error: 'Invalid OAuth state — possible CSRF attack' });
        return;
      }
      res.clearCookie('oauth_state');
      next();
    },
    passport.authenticate('google', { session: false, failureRedirect: '/auth/failed' }),
    oauthCallback
  );
} else {
  authRouter.get('/google', (_req, res) => res.status(503).json({ error: 'Google OAuth not configured' }));
}

// ── Facebook OAuth ──
if (isFacebookEnabled) {
  authRouter.get('/facebook', (req, res, next) => {
    const state = randomBytes(16).toString('hex');
    res.cookie('oauth_state', state, {
      httpOnly: true, sameSite: 'lax',
      maxAge: 5 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    });
    passport.authenticate('facebook', {
      scope: ['email'],
      session: false,
      state,
    })(req, res, next);
  });

  authRouter.get('/facebook/callback',
    (req, res, next) => {
      const { state } = req.query;
      const cookieState = req.cookies?.oauth_state;
      if (!state || state !== cookieState) {
        res.status(403).json({ error: 'Invalid OAuth state — possible CSRF attack' });
        return;
      }
      res.clearCookie('oauth_state');
      next();
    },
    passport.authenticate('facebook', { session: false, failureRedirect: '/auth/failed' }),
    oauthCallback
  );
} else {
  authRouter.get('/facebook', (_req, res) => res.status(503).json({ error: 'Facebook OAuth not configured' }));
}

authRouter.get('/failed', (_req, res) => {
  res.status(401).json({ error: 'Authentication failed' });
});
