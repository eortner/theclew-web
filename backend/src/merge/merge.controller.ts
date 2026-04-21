import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';
import { equitySchema, confirmSchema } from './merge.validation';
import { createNotification } from '../notifications/notification.service';

async function getThreadAsParticipant(threadId: string, userId: string) {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      mergeParties: true,
      initiatorProject: { include: { owners: true } },
      recipientProject: { include: { owners: true } },
      votes: true,
    },
  });
  if (!thread) return null;
  if (thread.initiatorId !== userId && thread.recipientId !== userId) return null;
  return thread;
}

function platformEquityForLevel(level: number): number {
  if (level >= 4) return 12;
  if (level >= 3) return 13;
  if (level >= 2) return 14;
  return 15;
}

export async function proposeEquity(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const parsed = equitySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const thread = await getThreadAsParticipant(req.params.threadId, user.id);
  if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }
  if (!['MERGE', 'ACQUISITION'].includes(thread.type)) { res.status(400).json({ error: 'Not a merge thread' }); return; }
  if (['FINALISED', 'DECLINED', 'EXPIRED'].includes(thread.status)) { res.status(400).json({ error: 'Thread is closed' }); return; }

  const myParty = thread.mergeParties.find(p => p.userId === user.id);
  if (!myParty) { res.status(400).json({ error: 'You are not a party in this merge' }); return; }

  const otherParty = thread.mergeParties.find(p => p.userId !== user.id);
  const otherEquity = otherParty?.proposedEquity ?? 0;

  // Determine platform equity based on higher level project
  const higherLevel = Math.max(
    thread.initiatorProject?.currentLevel ?? 0,
    thread.recipientProject?.currentLevel ?? 0,
  );
  const platformPct = platformEquityForLevel(higherLevel);
  const maxFounderTotal = 100 - platformPct;

  if (parsed.data.proposedEquity + otherEquity > maxFounderTotal) {
    res.status(400).json({ error: `Total founder equity cannot exceed ${maxFounderTotal}% (Emoclew retains ${platformPct}%)` });
    return;
  }

  await prisma.mergeParty.update({
    where: { id: myParty.id },
    data: { proposedEquity: parsed.data.proposedEquity, status: 'PENDING' },
  });

  // Notify other party
  await createNotification({
    userId: otherParty!.userId,
    type: 'MERGE_REQUEST',
    title: 'Equity proposal received',
    body: `${user.name} has proposed ${parsed.data.proposedEquity}% equity in the merge.`,
    metadata: { threadId: thread.id },
  });

  res.json({ message: 'Equity proposal submitted', proposedEquity: parsed.data.proposedEquity });
}

export async function reAuthenticate(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const thread = await getThreadAsParticipant(req.params.threadId, user.id);
  if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }
  if (['FINALISED', 'DECLINED', 'EXPIRED'].includes(thread.status)) { res.status(400).json({ error: 'Thread is closed' }); return; }

  const myParty = thread.mergeParties.find(p => p.userId === user.id);
  if (!myParty) { res.status(400).json({ error: 'Not a party' }); return; }

  await prisma.mergeParty.update({ where: { id: myParty.id }, data: { status: 'REAUTHED', reauthAt: new Date() } });

  const allParties = await prisma.mergeParty.findMany({ where: { threadId: thread.id } });
  const bothReauthed = allParties.every(p => p.status === 'REAUTHED' || p.status === 'CONFIRMED');
  if (bothReauthed) {
    await prisma.thread.update({ where: { id: thread.id }, data: { status: 'PENDING_CONFIRMATION' } });
  }

  res.json({ message: 'Identity verified' });
}

export async function confirmMerge(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const parsed = confirmSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const thread = await getThreadAsParticipant(req.params.threadId, user.id);
  if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }
  if (thread.status !== 'PENDING_CONFIRMATION') { res.status(400).json({ error: 'Both parties must reauth first' }); return; }

  const myParty = thread.mergeParties.find(p => p.userId === user.id);
  if (!myParty || myParty.status === 'DECLINED') { res.status(400).json({ error: 'You must reauth first' }); return; }

  const totalProposed = thread.mergeParties.reduce((sum, p) => sum + (p.proposedEquity ?? 0), 0);
  if (totalProposed === 0) { res.status(400).json({ error: 'Equity split must be agreed first' }); return; }

  await prisma.mergeParty.update({ where: { id: myParty.id }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });

  const updatedParties = await prisma.mergeParty.findMany({ where: { threadId: thread.id } });
  const allConfirmed = updatedParties.every(p => p.status === 'CONFIRMED');

  if (allConfirmed) {
    // Trigger community ratification vote
    await prisma.thread.update({ where: { id: thread.id }, data: { status: 'OPEN' } }); // reopen for voting

    // Check eligible voters — founders with equity in either project
    const eligibleVoters = await getEligibleVoters(thread);

    if (eligibleVoters.length < 3) {
      // Auto-ratify — quorum not met
      await finaliseMerge(thread, updatedParties);
    } else {
      // Notify eligible voters
      for (const voterId of eligibleVoters) {
        await createNotification({
          userId: voterId,
          type: 'SYSTEM',
          title: 'Community vote required',
          body: 'A merge proposal requires your ratification vote.',
          metadata: { threadId: thread.id, action: 'VOTE' },
        });
      }
      await prisma.thread.update({ where: { id: thread.id }, data: { status: 'PENDING_CONFIRMATION' } });
    }
  }

  res.json({ message: allConfirmed ? 'Both confirmed — ratification in progress' : 'Confirmation recorded — awaiting other party' });
}

async function getEligibleVoters(thread: any): Promise<string[]> {
  const initiatorOwners = thread.initiatorProject?.owners?.map((o: any) => o.userId) ?? [];
  const recipientOwners = thread.recipientProject?.owners?.map((o: any) => o.userId) ?? [];
  const allOwners = [...new Set([...initiatorOwners, ...recipientOwners])];
  // Exclude the two merging parties themselves
  return allOwners.filter((id: string) => id !== thread.initiatorId && id !== thread.recipientId);
}

async function finaliseMerge(thread: any, parties: any[]) {
  const higherLevel = Math.max(
    thread.initiatorProject?.currentLevel ?? 0,
    thread.recipientProject?.currentLevel ?? 0,
  );
  const platformPct = platformEquityForLevel(higherLevel);

  await prisma.$transaction(async (tx) => {
    // Surviving project = recipient project, update its level
    if (thread.recipientProject) {
      await tx.project.update({
        where: { id: thread.recipientProject.id },
        data: { currentLevel: higherLevel },
      });

      // Archive initiator project with MERGED status
      if (thread.initiatorProject) {
        await tx.project.update({
          where: { id: thread.initiatorProject.id },
          data: { status: 'MERGED' },
        });
      }

      // Delete old ownership records for surviving project
      await tx.projectOwnership.deleteMany({ where: { projectId: thread.recipientProject.id } });

      // Create new ownership records based on agreed equity
      for (const party of parties) {
        await tx.projectOwnership.create({
          data: {
            projectId: thread.recipientProject.id,
            userId: party.userId,
            equityPercent: party.proposedEquity ?? ((100 - platformPct) / 2),
            role: party.userId === thread.recipientId ? 'FOUNDER' : 'MERGED_FOUNDER',
          },
        });
      }
    }

    await tx.thread.update({ where: { id: thread.id }, data: { status: 'FINALISED' } });
  });

  for (const party of parties) {
    await createNotification({
      userId: party.userId,
      type: 'MERGE_FINALISED',
      title: '🎉 Merge finalised',
      body: 'Your merge has been ratified and finalised. The merged entity is now active.',
      metadata: { threadId: thread.id },
    });
  }
}

export async function castVote(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const { approve } = req.body;
  if (typeof approve !== 'boolean') { res.status(400).json({ error: 'approve must be boolean' }); return; }

  const thread = await prisma.thread.findUnique({
    where: { id: req.params.threadId },
    include: {
      mergeParties: true,
      votes: true,
      initiatorProject: { include: { owners: true } },
      recipientProject: { include: { owners: true } },
    },
  });
  if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }

  // Check eligible voter
  const eligibleVoters = await getEligibleVoters(thread);
  if (!eligibleVoters.includes(user.id)) { res.status(403).json({ error: 'You are not eligible to vote on this merge' }); return; }

  // Check already voted
  if (thread.votes.some(v => v.userId === user.id)) { res.status(400).json({ error: 'You have already voted' }); return; }

  await prisma.vote.create({ data: { threadId: thread.id, userId: user.id, approve } });

  // Check if majority reached
  const allVotes = await prisma.vote.findMany({ where: { threadId: thread.id } });
  const approveCount = allVotes.filter(v => v.approve).length;
  const denyCount = allVotes.filter(v => !v.approve).length;
  const majority = Math.floor(eligibleVoters.length / 2) + 1;

  if (approveCount >= majority) {
    const parties = await prisma.mergeParty.findMany({ where: { threadId: thread.id } });
    await finaliseMerge(thread, parties);
  } else if (denyCount >= majority) {
    await prisma.thread.update({ where: { id: thread.id }, data: { status: 'DECLINED' } });
    for (const party of thread.mergeParties) {
      await createNotification({
        userId: party.userId,
        type: 'MERGE_DECLINED',
        title: 'Merge vote failed',
        body: 'The community vote did not pass. A 14-day cooling period begins now.',
        metadata: { threadId: thread.id },
      });
    }
  }

  res.json({ message: 'Vote recorded' });
}

export async function getMergeSafe(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const thread = await prisma.thread.findUnique({
    where: { id: req.params.threadId },
    include: {
      mergeParties: { include: { user: { select: { id: true, name: true, email: true, totpVerifiedAt: true } } } },
      initiatorProject: true,
      recipientProject: true,
      votes: { include: { user: { select: { id: true, name: true } } } },
    },
  });
  if (!thread) { res.status(404).json({ error: 'Not found' }); return; }
  if (thread.status !== 'FINALISED') { res.status(400).json({ error: 'Merge not yet finalised' }); return; }
  if (thread.initiatorId !== user.id && thread.recipientId !== user.id) { res.status(403).json({ error: 'Forbidden' }); return; }

  const higherLevel = Math.max(
    thread.initiatorProject?.currentLevel ?? 0,
    thread.recipientProject?.currentLevel ?? 0,
  );
  const platformPct = platformEquityForLevel(higherLevel);

  res.json({
    contractType: 'MERGE_AGREEMENT',
    generatedAt: new Date().toISOString(),
    status: 'FINALISED',
    platformEquity: platformPct,
    survivingProject: thread.recipientProject,
    mergedProject: thread.initiatorProject,
    parties: thread.mergeParties.map(p => ({
      name: p.user.name,
      email: p.user.email,
      equityPercent: p.proposedEquity,
      verifiedAt: p.user.totpVerifiedAt,
      confirmedAt: p.confirmedAt,
    })),
    votes: thread.votes,
  });
}

export async function declineMerge(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const thread = await getThreadAsParticipant(req.params.threadId, user.id);
  if (!thread) { res.status(404).json({ error: 'Thread not found' }); return; }
  if (['FINALISED', 'DECLINED', 'EXPIRED'].includes(thread.status)) { res.status(400).json({ error: 'Thread is already closed' }); return; }

  await prisma.thread.update({ where: { id: thread.id }, data: { status: 'DECLINED' } });

  const otherId = thread.initiatorId === user.id ? thread.recipientId : thread.initiatorId;
  await createNotification({
    userId: otherId,
    type: 'MERGE_DECLINED',
    title: 'Merge proposal declined',
    body: `${user.name} has declined the merge proposal.`,
    metadata: { threadId: thread.id },
  });

  res.json({ message: 'Merge declined' });
}