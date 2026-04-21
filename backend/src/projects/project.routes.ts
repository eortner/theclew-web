import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { createProject, getMyProjects, getProject, updateProject, archiveProject, getPublicProjects, getSimilarProjects } from './project.controller';

export const projectRouter = Router();

projectRouter.get('/public', getPublicProjects);
projectRouter.use(requireAuth);
projectRouter.post('/',                createProject);
projectRouter.get('/',                 getMyProjects);
projectRouter.get('/:id',              getProject);
projectRouter.get('/:id/similar',      getSimilarProjects);
projectRouter.patch('/:id',            updateProject);
projectRouter.delete('/:id',           archiveProject);