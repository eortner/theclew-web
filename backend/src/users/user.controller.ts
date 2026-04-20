import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';
import { updateUserSchema } from './user.validation';

const safeUser = {
  id: true, email: true, name: true, avatarUrl: true,
  role: true, provider: true, createdAt: true,
  totpEnabled: true, totpVerifiedAt: true,
};

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      ...safeUser,
      projects: {
        select: { id: true, name: true, currentLevel: true, visibility: true, status: true, tags: true },
        where:  { status: { not: 'ARCHIVED' } },
      },
    },
  });
  res.json(full);
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data:  parsed.data,
    select: safeUser,
  });
  res.json(updated);
}

export async function deleteMe(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  await prisma.user.delete({ where: { id: user.id } });
  res.status(204).send();
}
