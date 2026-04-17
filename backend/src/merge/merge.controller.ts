import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { User, AuthProvider } from '@prisma/client';
import { equitySchema, reAuthSchema, confirmSchema } from './merge.validation';
import { createNotification } from '../notifications/notification.service';
import { advanceLevel } from '../levels/level.service';

async function getThreadAsParticipant(threadId: string, userId: string) {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      mergeParties: true,
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
  const user = req.user as User;
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

  // Validate total proposed equity never exceeds 85% (Emoclew always keeps 15%)
  const myParty = thread.mergeParties.find((p) => p.userId === user.id);
  if (!myParty) { res.status(400).json({ error: 'You are not a party in this merge' }); return; }

  const otherParty = thread.mergeParties.find((p) => p.userId !== user.id);
  const otherEquity = otherParty?.proposedEquity ?? 0;
  const total = parsed.data.proposedEquity + otherEquity;

  if (total > 85) {
    res.status(400).json({
      error: `Total founder equity cannot exceed 85% (Emoclew retains 15%). Other party has proposed ${otherEquity}%`,
    });
    return;
  }

  await prisma.mergeParty.update({
    where:  { id: myParty.id },
    data:   { proposedEquity: parsed.data.proposedEquity, status: 'PENDING' },
  });

  res.json({ message: 'Equity proposal submitted', proposedEquity: parsed.data.proposedEquity });
}

export async function reAuthenticate(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const parsed = reAuthSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const thread = await getThreadAsParticipant(req.params.threadId, user.id);
  if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }

  if (['FINALISED', 'DECLINED', 'EXPIRED'].includes(thread.status)) {
    res.status(400).json({ error: 'This thread is closed' });
    return;
  }

  const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!fullUser) { res.status(401).json({ error: 'Account not found' }); return; }

  if (fullUser.provider === AuthProvider.LOCAL) {
    // Local users must verify their password
    if (!parsed.data.password) {
      res.status(400).json({ error: 'Password required for re-authentication' });
      return;
    }
    const valid = await bcrypt.compare(parsed.data.password, fullUser.passwordHash ?? '');
    if (!valid) {
      res.status(401).json({ error: 'Incorrect password' });
      return;
    }
  } else {
    // OAuth users must type their email and a confirmation phrase
    if (parsed.data.email !== fullUser.email) {
      res.status(401).json({ error: 'Email does not match your account' });
      return;
    }
    if (parsed.data.confirmPhrase?.toLowerCase() !== 'i confirm this merge') {
      res.status(400).json({ error: 'Please type "I confirm this merge" to proceed' });
      return;
    }
  }

  const myParty = thread.mergeParties.find((p) => p.userId === user.id);
  if (!myParty) { res.status(400).json({ error: 'You are not a party in this merge' }); return; }

  await prisma.mergeParty.update({
    where: { id: myParty.id },
    data:  { status: 'REAUTHED', reauthAt: new Date() },
  });

  // If both parties have re-authed, move thread to PENDING_CONFIRMATION
  const bothReauthed = thread.mergeParties.every(
    (p) => p.userId === user.id || p.status === 'REAUTHED'
  );

  if (bothReauthed) {
    await prisma.thread.update({
      where: { id: thread.id },
      data:  { status: 'PENDING_CONFIRMATION' },
    });
  }

  res.json({ message: 'Re-authentication successful' });
}

export async function confirmMerge(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const parsed = confirmSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const thread = await getThreadAsParticipant(req.params.threadId, user.id);
  if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }

  if (thread.status !== 'PENDING_CONFIRMATION') {
    res.status(400).json({ error: 'Both parties must complete re-authentication before confirming' });
    return;
  }

  const myParty = thread.mergeParties.find((p) => p.userId === user.id);
  if (!myParty || myParty.status !== 'REAUTHED') {
    res.status(400).json({ error: 'You must complete re-authentication first' });
    return;
  }

  // Ensure equity is agreed — both parties must have proposed equity that sums to ≤85%
  const totalProposed = thread.mergeParties.reduce((sum, p) => sum + (p.proposedEquity ?? 0), 0);
  if (totalProposed === 0 || totalProposed > 85) {
    res.status(400).json({ error: 'Equity split must be agreed by both parties before confirming' });
    return;
  }

  await prisma.mergeParty.update({
    where: { id: myParty.id },
    data:  { status: 'CONFIRMED', confirmedAt: new Date() },
  });

  // Check if both confirmed
  const updatedParties = await prisma.mergeParty.findMany({ where: { threadId: thread.id } });
  const allConfirmed = updatedParties.every((p) => p.status === 'CONFIRMED');

  if (allConfirmed) {
    // Finalise the merge
    await prisma.thread.update({ where: { id: thread.id }, data: { status: 'FINALISED' } });

    // Inherit the higher level between the two projects
    if (thread.initiatorProject && thread.recipientProject) {
      const higherLevel = Math.max(
        thread.initiatorProject.currentLevel,
        thread.recipientProject.currentLevel
      );
      // Set both projects to merged status and assign higher level
      await prisma.project.update({
        where: { id: thread.initiatorProject.id },
        data:  { currentLevel: higherLevel },
      });
    }

    // Notify both parties
    for (const party of updatedParties) {
      const otherId = updatedParties.find((p) => p.userId !== party.userId)?.userId;
      await createNotification({
        userId: party.userId,
        type:   'MERGE_FINALISED',
        title:  'Merge finalised',
        body:   'Your merge has been confirmed by both parties.',
        metadata: { threadId: thread.id },
      });
    }
  }

  res.json({ message: allConfirmed ? 'Merge finalised' : 'Confirmation recorded — awaiting other party' });
}

export async function declineMerge(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const thread = await getThreadAsParticipant(req.params.threadId, user.id);
  if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }

  if (['FINALISED', 'DECLINED', 'EXPIRED'].includes(thread.status)) {
    res.status(400).json({ error: 'This thread is already closed' });
    return;
  }

  await prisma.thread.update({ where: { id: thread.id }, data: { status: 'DECLINED' } });

  const otherId = thread.initiatorId === user.id ? thread.recipientId : thread.initiatorId;
  await createNotification({
    userId: otherId,
    type:   'MERGE_DECLINED',
    title:  'Merge proposal declined',
    body:   `${user.name} has declined the merge proposal.`,
    metadata: { threadId: thread.id },
  });

  res.json({ message: 'Merge declined' });
}
