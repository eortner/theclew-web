import { Router } from 'express';
import { getTags } from './tag.controller';

export const tagRouter = Router();

tagRouter.get('/', getTags);