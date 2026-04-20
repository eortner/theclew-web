import { Router } from 'express';
import passport from 'passport';
import { register, login, loginWithTotp, logout, oauthCallback } from './auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

export const authRouter = Router();

authRouter.post('/register',    register);
authRouter.post('/login',       login);
authRouter.post('/login/totp',  loginWithTotp);
authRouter.post('/logout',      requireAuth, logout);

authRouter.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
authRouter.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  oauthCallback);

authRouter.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'], session: false }));
authRouter.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
  oauthCallback);