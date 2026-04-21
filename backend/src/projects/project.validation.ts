import { z } from 'zod';

export const createProjectSchema = z.object({
  name:          z.string().min(2).max(80),
  description:   z.string().min(20).max(2000),
  tagline:       z.string().max(120).optional(),
  website:       z.string().url().optional().or(z.literal('')),
  monthlyRevenue: z.number().min(0).optional(),
  teamSize:      z.number().int().min(1).optional(),
  visibility:    z.enum(['PRIVATE', 'SELECTIVE', 'PUBLIC']).default('PRIVATE'),
  tags:          z.array(z.string()).min(3).max(10),
});

export const updateProjectSchema = createProjectSchema.partial();