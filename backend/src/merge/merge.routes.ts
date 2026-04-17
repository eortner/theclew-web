import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { proposeEquity, reAuthenticate, confirmMerge, declineMerge } from './merge.controller';

export const mergeRouter = Router();
mergeRouter.use(requireAuth);

// Propose or update equity split — either party can do this
mergeRouter.patch('/:threadId/equity',  proposeEquity);

// Re-authenticate before final confirmation
mergeRouter.post('/:threadId/reauth',   reAuthenticate);

// Final confirmation — only allowed after both parties have re-authed
mergeRouter.post('/:threadId/confirm',  confirmMerge);

// Decline the merge at any point
mergeRouter.post('/:threadId/decline',  declineMerge);
