import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { listUsers, listProjects, getStats } from './admin.controller';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('ADMIN'));

adminRouter.get('/users',    listUsers);
adminRouter.get('/projects', listProjects);
adminRouter.get('/stats',    getStats);
