import 'dotenv/config';
import { validateEnv } from './lib/env';
validateEnv();

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import { configurePassport } from './auth/passport';
import { authRouter } from './auth/auth.routes';
import { userRouter } from './users/user.routes';
import { projectRouter } from './projects/project.routes';
import { notificationRouter } from './notifications/notification.routes';
import { threadRouter } from './threads/thread.routes';
import { mergeRouter } from './merge/merge.routes';
import { adminRouter } from './admin/admin.routes';
import { totpRouter } from './auth/totp.routes';
import { tagRouter } from './tags/tag.routes';
import { announcementRouter } from './announcements/announcement.routes';
import { slackRouter } from './slack/slack.routes';

const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.use(helmet({
  contentSecurityPolicy: isProd ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origin && allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb' }));
app.use(cookieParser());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
}));

if (isProd) app.set('trust proxy', 1);

configurePassport(passport);
app.use(passport.initialize());

app.use('/auth',          authRouter);
app.use('/auth/totp',     totpRouter);
app.use('/users',         userRouter);
app.use('/projects',      projectRouter);
app.use('/notifications', notificationRouter);
app.use('/threads',       threadRouter);
app.use('/merge',         mergeRouter);
app.use('/admin',         adminRouter);
app.use('/tags',          tagRouter);
app.use('/announcements', announcementRouter);
app.use('/slack',         slackRouter);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message, isProd ? '' : err.stack);
  if (err.message.startsWith('CORS:')) { res.status(403).json({ error: 'Forbidden' }); return; }
  res.status(500).json({ error: isProd ? 'Internal server error' : err.message });
});

export default app;