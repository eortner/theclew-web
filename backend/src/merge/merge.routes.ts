import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireTotpSetup, requireTotp } from '../middleware/totp.middleware';
import { proposeEquity, reAuthenticate, confirmMerge, declineMerge, castVote, getMergeSafe } from './merge.controller';

export const mergeRouter = Router();
mergeRouter.use(requireAuth);

mergeRouter.patch('/:threadId/equity',   proposeEquity);
mergeRouter.post('/:threadId/reauth',    requireTotpSetup, requireTotp, reAuthenticate);
mergeRouter.post('/:threadId/confirm',   requireTotpSetup, requireTotp, confirmMerge);
mergeRouter.post('/:threadId/decline',   declineMerge);
mergeRouter.post('/:threadId/vote',      castVote);
mergeRouter.get('/:threadId/safe',       getMergeSafe);