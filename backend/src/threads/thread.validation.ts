import { z } from 'zod';

export const createThreadSchema = z.object({
  recipientId:        z.string().cuid(),
  type:               z.enum(['MERGE', 'ACQUISITION', 'VISIBILITY_SHARE', 'GENERAL']),
  subject:            z.string().min(5).max(200).trim(),
  initiatorProjectId: z.string().cuid().optional(),
  recipientProjectId: z.string().cuid().optional(),
});

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(5000).trim(),
});
