import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';

export async function getActiveAnnouncements(req: Request, res: Response): Promise<void> {
  const user = req.user as User;

  // Get all active announcements not yet dismissed by this user
  const announcements = await prisma.announcement.findMany({
    where: {
      active:     true,
      dismissals: { none: { userId: user.id } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(announcements);
}

export async function dismissAnnouncement(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const { key } = req.params;

  const announcement = await prisma.announcement.findUnique({ where: { key } });
  if (!announcement) { res.status(404).json({ error: 'Announcement not found' }); return; }

  // Upsert — idempotent, safe to call multiple times
  await prisma.userDismissal.upsert({
    where:  { userId_announcementKey: { userId: user.id, announcementKey: key } },
    create: { userId: user.id, announcementKey: key },
    update: {},
  });

  res.status(204).send();
}