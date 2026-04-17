import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { setupTotp, verifyAndEnableTotp, disableTotp, reauthTotp } from './totp.controller';

export const totpRouter = Router();

totpRouter.post('/setup',    requireAuth, setupTotp);
totpRouter.post('/verify',   requireAuth, verifyAndEnableTotp);
totpRouter.post('/disable',  requireAuth, disableTotp);
totpRouter.post('/reauth',   requireAuth, reauthTotp);