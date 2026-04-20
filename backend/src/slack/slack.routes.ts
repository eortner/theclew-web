import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getSlackInviteUrl } from './slack.controller';

const router = Router();
router.get('/invite-url', requireAuth, getSlackInviteUrl);
export { router as slackRouter };