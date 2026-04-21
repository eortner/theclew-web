import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

export async function joinWaitlist(req: Request, res: Response): Promise<void> {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }
  const { email } = parsed.data;
  try {
    await prisma.waitlistEntry.upsert({
      where:  { email },
      update: {},
      create: { email },
    });
    res.status(201).json({ message: 'You are on the list.' });
  } catch {
    res.status(500).json({ error: 'Something went wrong' });
  }
}