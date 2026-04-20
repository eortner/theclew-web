import { z } from 'zod';

export const registerSchema = z.object({
  email:    z.string().email(),
  name:     z.string().min(2).max(80),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const loginTotpSchema = z.object({
  email:     z.string().email(),
  password:  z.string().min(1),
  totpToken: z.string().length(6).regex(/^\d{6}$/),
});