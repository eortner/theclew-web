import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';
import { z } from 'zod';

const paginationSchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(50).default(20),
  unread: z.enum(['true', 'false']).optional(),
});

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { page, limit, unread } = parsed.data;
  const skip = (page - 1) * limit;

  const where = {
    userId: user.id,
    ...(unread === 'true' ? { read: false } : {}),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where, orderBy: { createdAt: 'desc' }, skip, take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  res.json({
    data: notifications,
    meta: { total, page, limit, pages: Math.ceil(total / limit), unreadCount },
  });
}

export async function markRead(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const notification = await prisma.notification.findUnique({
    where: { id: req.params.id },
  });

  if (!notification || notification.userId !== user.id) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }

  await prisma.notification.update({
    where: { id: req.params.id },
    data:  { read: true },
  });
  res.status(204).send();
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data:  { read: true },
  });
  res.status(204).send();
}
