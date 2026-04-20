import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';
import { equitySchema, confirmSchema } from './merge.validation';
import { createNotification } from '../notifications/notification.service';

async function getThreadAsParticipant(threadId: string, userId: string) {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      mergeParties:     true,
      initiatorProject: true,
      recipientProject: true,
    },
  });

  if (!thread) return null;
  const isParticipant = thread.initiatorId === userId || thread.recipientId === userId;
  if (!isParticipant) return null;
  return thread;
}

export async function proposeEquity(req: Request, res: Response): Promise<void> {
  const user   = req.user as User;
  const parsed = equitySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const thread = await getThreadAsParticipant(req.params.threadId, user.id);
  if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }

  if (!['MERGE', 'ACQUISITION'].includes(thread.type)) {
    res.status(400).json({ error: 'Equity proposals only apply to merge or acquisition threads' });
    return;
  }

  if (['FINALISED', 'DECLINED', 'EXPIRED'].includes(thread.status)) {
    res.status(400).json({ error: 'This thread is closed' });
    return;
  }

  const myParty = thread.mergeParties.find((p) => p.userId === user.id);
  if (!myParty) { res.status(400).json({ error: 'You are not a party in this merge' }); return; }

  const otherParty  = thread.mergeParties.find((p) => p.userId !== user.id);
  const otherEquity = otherParty?.proposedEquity ?? 0;
  const total       = parsed.data.proposedEquity + otherEquity;

  if (total > 85) {
    res.status(400).json({
      error: `Total founder equity cannot exceed 85% (Emoclew retains 15%). Other party has proposed ${otherEquity}%`,
    });
    return;
  }

  await prisma.mergeParty.update({
    where: { id: myParty.id },
    data:  { proposedEquity: parsed.data.proposedEquity, status: 'PENDING' },
  });

  res.json({ message: 'Equity proposal submitted', proposedEquity: parsed.data.proposedEquity });
}

/**
 * reAuthenticate — TOTP verification is enforced by requireTotp middleware
 * on the route. This handler just records the reauth and advances state.
 */
export async function reAuthenticate(req: Request, res: Response): Promise<void> {
  const user   = req.user as User;
  const thread = await getThreadAsParticipant(req.params.threadId, user.id);
  if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }

  if (['FINALISED', 'DECLINED', 'EXPIRED'].includes(thread.status)) {
    res.status(400).json({ error: 'This thread is closed' });
    return;
  }

  const myParty = thread.mergeParties.find((p) => p.userId === user.id);
  if (!myParty) { res.status(400).json({ error: 'You are not a party in this merge' }); return; }

  await prisma.mergeParty.update({
    where: { id: myParty.id },
    data:  { status: 'REAUTHED', reauthAt: new Date() },
  });

  // If both parties have re-authed, advance thread status
  const allParties   = await prisma.mergeParty.findMany({ where: { threadId: thread.id } });
  const bothReauthed = allParties.every((p) => p.status === 'REAUTHED');

  if (bothReauthed) {
    await prisma.thread.update({
      where: { id: thread.id },
      data:  { status: 'PENDING_CONFIRMATION' },
    });
  }

  res.json({ message: 'Identity verified — re-authentication recorded' });
}

export async function confirmMerge(req: Request, res: Response): Promise<void> {
  const user   = req.user as User;
  const parsed = confirmSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const thread = await getThreadAsParticipant(req.params.threadId, user.id);
  if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }

  if (thread.status !== 'PENDING_CONFIRMATION') {
    res.status(400).json({ error: 'Both parties must complete TOTP re-authentication before confirming' });
    return;
  }

  const myParty = thread.mergeParties.find((p) => p.userId === user.id);
  if (!myParty || myParty.status !== 'REAUTHED') {
    res.status(400).json({ error: 'You must complete TOTP re-authentication first' });
    return;
  }

  const totalProposed = thread.mergeParties.reduce((sum, p) => sum + (p.proposedEquity ?? 0), 0);
  if (totalProposed === 0 || totalProposed > 85) {
    res.status(400).json({ error: 'Equity split must be agreed by both parties before confirming' });
    return;
  }

  await prisma.mergeParty.update({
    where: { id: myParty.id },
    data:  { status: 'CONFIRMED', confirmedAt: new Date() },
  });

  const updatedParties = await prisma.mergeParty.findMany({ where: { threadId: thread.id } });
  const allConfirmed   = updatedParties.every((p) => p.status === 'CONFIRMED');

  if (allConfirmed) {
    await prisma.thread.update({ where: { id: thread.id }, data: { status: 'FINALISED' } });

    if (thread.initiatorProject && thread.recipientProject) {
      const higherLevel = Math.max(
        thread.initiatorProject.currentLevel,
        thread.recipientProject.currentLevel,
      );
      await prisma.project.update({
        where: { id: thread.initiatorProject.id },
        data:  { currentLevel: higherLevel },
      });
    }

    for (const party of updatedParties) {
      await createNotification({
        userId:   party.userId,
        type:     'MERGE_FINALISED',
        title:    'Merge finalised',
        body:     'Your merge has been confirmed by both parties.',
        metadata: { threadId: thread.id },
      });
    }
  }

  res.json({ message: allConfirmed ? 'Merge finalised' : 'Confirmation recorded — awaiting other party' });
}

export async function declineMerge(req: Request, res: Response): Promise<void> {
  const user   = req.user as User;
  const thread = await getThreadAsParticipant(req.params.threadId, user.id);
  if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }

  if (['FINALISED', 'DECLINED', 'EXPIRED'].includes(thread.status)) {
    res.status(400).json({ error: 'This thread is already closed' });
    return;
  }

  await prisma.thread.update({ where: { id: thread.id }, data: { status: 'DECLINED' } });

  const otherId = thread.initiatorId === user.id ? thread.recipientId : thread.initiatorId;
  await createNotification({
    userId:   otherId,
    type:     'MERGE_DECLINED',
    title:    'Merge proposal declined',
    body:     `${user.name} has declined the merge proposal.`,
    metadata: { threadId: thread.id },
  });

  res.json({ message: 'Merge declined' });
}