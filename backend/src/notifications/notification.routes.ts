import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { listNotifications, markRead, markAllRead } from './notification.controller';

export const notificationRouter = Router();
notificationRouter.use(requireAuth);

notificationRouter.get('/',            listNotifications);
notificationRouter.patch('/:id/read',  markRead);
notificationRouter.patch('/read-all',  markAllRead);
