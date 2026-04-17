import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';
import { createThreadSchema, sendMessageSchema } from './thread.validation';
import { createNotification } from '../notifications/notification.service';

const threadSelect = {
  id: true, type: true, status: true, subject: true,
  expiresAt: true, createdAt: true, updatedAt: true,
  initiator: { select: { id: true, name: true, avatarUrl: true } },
  recipient: { select: { id: true, name: true, avatarUrl: true } },
  initiatorProject: { select: { id: true, name: true, currentLevel: true } },
  recipientProject: { select: { id: true, name: true, currentLevel: true } },
  mergeParties: {
    select: {
      id: true, status: true, proposedEquity: true,
      reauthAt: true, confirmedAt: true,
      user: { select: { id: true, name: true } },
    },
  },
  _count: { select: { messages: true } },
};

export async function createThread(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const parsed = createThreadSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { recipientId, type, subject, initiatorProjectId, recipientProjectId } = parsed.data;

  if (recipientId === user.id) {
    res.status(400).json({ error: 'Cannot create a thread with yourself' });
    return;
  }

  const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
  if (!recipient) { res.status(404).json({ error: 'Recipient not found' }); return; }

  // For MERGE/ACQUISITION — verify initiator owns the project they claim
  if (initiatorProjectId) {
    const proj = await prisma.project.findUnique({ where: { id: initiatorProjectId } });
    if (!proj || proj.ownerId !== user.id) {
      res.status(403).json({ error: 'You do not own that project' });
      return;
    }
  }

  // Set expiry — merge/acquisition threads expire in 30 days if no action
  const expiresAt = ['MERGE', 'ACQUISITION'].includes(type)
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : undefined;

  const thread = await prisma.thread.create({
    data: {
      type, subject, expiresAt,
      initiatorId: user.id,
      recipientId,
      initiatorProjectId,
      recipientProjectId,
      mergeParties: ['MERGE', 'ACQUISITION'].includes(type)
        ? {
            create: [
              { userId: user.id },
              { userId: recipientId },
            ],
          }
        : undefined,
    },
    select: threadSelect,
  });

  await createNotification({
    userId:   recipientId,
    type:     type === 'MERGE' ? 'MERGE_REQUEST' : 'MESSAGE_RECEIVED',
    title:    type === 'MERGE' ? 'New merge proposal' : `New message from ${user.name}`,
    body:     subject,
    metadata: { threadId: thread.id },
  });

  res.status(201).json(thread);
}

export async function listMyThreads(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const threads = await prisma.thread.findMany({
    where: {
      OR: [{ initiatorId: user.id }, { recipientId: user.id }],
      status: { notIn: ['DECLINED', 'EXPIRED'] },
    },
    select: threadSelect,
    orderBy: { updatedAt: 'desc' },
  });
  res.json(threads);
}

export async function getThread(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const thread = await prisma.thread.findUnique({
    where:  { id: req.params.id },
    select: {
      ...threadSelect,
      messages: {
        select: {
          id: true, body: true, createdAt: true,
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }

  // Only participants can read a thread
  const isParticipant = thread.initiator.id === user.id || thread.recipient.id === user.id;
  if (!isParticipant) { res.status(404).json({ error: 'Thread not found' }); return; }

  res.json(thread);
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const thread = await prisma.thread.findUnique({
    where:  { id: req.params.id },
    select: { initiatorId: true, recipientId: true, status: true },
  });

  if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }

  const isParticipant = thread.initiatorId === user.id || thread.recipientId === user.id;
  if (!isParticipant) { res.status(404).json({ error: 'Thread not found' }); return; }

  if (['FINALISED', 'DECLINED', 'EXPIRED'].includes(thread.status)) {
    res.status(400).json({ error: 'This thread is closed' });
    return;
  }

  const message = await prisma.message.create({
    data: { body: parsed.data.body, threadId: req.params.id, authorId: user.id },
    select: {
      id: true, body: true, createdAt: true,
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  // Update thread timestamp so it bubbles to top
  await prisma.thread.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });

  const recipientId = thread.initiatorId === user.id ? thread.recipientId : thread.initiatorId;
  await createNotification({
    userId:   recipientId,
    type:     'MESSAGE_RECEIVED',
    title:    `New message from ${user.name}`,
    body:     parsed.data.body.slice(0, 100),
    metadata: { threadId: req.params.id },
  });

  res.status(201).json(message);
}
