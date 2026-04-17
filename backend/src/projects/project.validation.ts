import { z } from 'zod';

export const createProjectSchema = z.object({
  name:        z.string().min(2).max(120),
  description: z.string().min(20).max(2000),
  visibility:  z.enum(['PRIVATE', 'SELECTIVE', 'PUBLIC']).default('PRIVATE'),
  tags:        z.array(z.string().min(1).max(40))
                 .min(3, 'Minimum 3 tags required')
                 .max(10, 'Maximum 10 tags allowed'),
});

export const updateProjectSchema = z.object({
  name:        z.string().min(2).max(120).optional(),
  description: z.string().min(20).max(2000).optional(),
  visibility:  z.enum(['PRIVATE', 'SELECTIVE', 'PUBLIC']).optional(),
  tags:        z.array(z.string().min(1).max(40))
                 .min(3, 'Minimum 3 tags required')
                 .max(10, 'Maximum 10 tags allowed')
                 .optional(),
}).strict();