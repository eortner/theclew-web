import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireTotpSetup, requireTotp } from '../middleware/totp.middleware';
import { proposeEquity, reAuthenticate, confirmMerge, declineMerge } from './merge.controller';

export const mergeRouter = Router();
mergeRouter.use(requireAuth);

// Equity proposal — auth only, no TOTP needed to negotiate
mergeRouter.patch('/:threadId/equity',  proposeEquity);

// Re-auth — TOTP must be set up AND freshly verified
mergeRouter.post('/:threadId/reauth',   requireTotpSetup, requireTotp, reAuthenticate);

// Final confirm — TOTP must be set up AND freshly verified
mergeRouter.post('/:threadId/confirm',  requireTotpSetup, requireTotp, confirmMerge);

// Decline — no TOTP needed, this is a rejection not a binding signature
mergeRouter.post('/:threadId/decline',  declineMerge);