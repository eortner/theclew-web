import { z } from 'zod';

export const equitySchema = z.object({
  proposedEquity: z.number().min(5).max(80),
});

export const confirmSchema = z.object({
  understood: z.literal(true, {
    errorMap: () => ({ message: 'You must explicitly confirm you understand the merge is irreversible' }),
  }),
});