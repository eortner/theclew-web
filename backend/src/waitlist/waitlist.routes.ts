import { Router } from 'express';
import { joinWaitlist } from './waitlist.controller';

export const waitlistRouter = Router();

waitlistRouter.post('/', joinWaitlist);