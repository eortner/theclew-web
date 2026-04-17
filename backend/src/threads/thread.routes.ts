import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { createThread, listMyThreads, getThread, sendMessage } from './thread.controller';

export const threadRouter = Router();
threadRouter.use(requireAuth);

threadRouter.post('/',                   createThread);
threadRouter.get('/',                    listMyThreads);
threadRouter.get('/:id',                 getThread);
threadRouter.post('/:id/messages',       sendMessage);
