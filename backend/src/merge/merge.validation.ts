import { z } from 'zod';

export const equitySchema = z.object({
  proposedEquity: z.number().min(5).max(80), // min 5% per founder protection rule
});

export const reAuthSchema = z.object({
  // For LOCAL users
  password:      z.string().min(1).optional(),
  // For OAuth users
  email:         z.string().email().optional(),
  confirmPhrase: z.string().optional(),
});

export const confirmSchema = z.object({
  understood: z.literal(true, {
    errorMap: () => ({ message: 'You must explicitly confirm you understand the merge is irreversible' }),
  }),
});
