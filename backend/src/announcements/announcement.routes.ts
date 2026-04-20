import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getActiveAnnouncements, dismissAnnouncement } from './announcement.controller';

export const announcementRouter = Router();
announcementRouter.use(requireAuth);

announcementRouter.get('/',           getActiveAnnouncements);
announcementRouter.post('/:key/dismiss', dismissAnnouncement);