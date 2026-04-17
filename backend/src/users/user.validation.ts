import { z } from 'zod';

export const updateUserSchema = z.object({
  name:      z.string().min(2).max(80).optional(),
  avatarUrl: z.string().url().optional(),
}).strict();
