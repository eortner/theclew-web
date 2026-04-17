import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  createProject,
  getMyProjects,
  getProject,
  updateProject,
  archiveProject,
  getPublicProjects,
} from './project.controller';

export const projectRouter = Router();

// Public — only PUBLIC visibility projects
projectRouter.get('/public', getPublicProjects);

// Protected
projectRouter.use(requireAuth);
projectRouter.post('/',          createProject);
projectRouter.get('/',           getMyProjects);
projectRouter.get('/:id',        getProject);
projectRouter.patch('/:id',      updateProject);
projectRouter.delete('/:id',     archiveProject);
