import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';
import { createProjectSchema, updateProjectSchema } from './project.validation';
import { createNotification } from '../notifications/notification.service';

const projectSelect = {
  id: true, name: true, description: true, tagline: true, website: true,
  monthlyRevenue: true, teamSize: true, pitchDeck: true,
  visibility: true, status: true, tags: true, currentLevel: true,
  createdAt: true, updatedAt: true,
  owners: { select: { userId: true, equityPercent: true, role: true, user: { select: { id: true, name: true, avatarUrl: true } } } },
  levelHistory: { orderBy: { achievedAt: 'desc' as const }, take: 5 },
  projectTags: { select: { tag: { select: { id: true, name: true, category: true } } } },
};

function platformEquityForLevel(level: number): number {
  if (level >= 4) return 7;
  if (level >= 3) return 8;
  if (level >= 2) return 9;
  return 10;
}

export async function createProject(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { name, description, tagline, website, monthlyRevenue, teamSize, visibility, tags: tagNames } = parsed.data;

  if (visibility && ['PUBLIC', 'SELECTIVE'].includes(visibility)) {
    const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!freshUser?.totpEnabled) {
      res.status(403).json({ error: 'Two-factor authentication must be enabled to make a project discoverable', totpRequired: true });
      return;
    }
  }

  try {
    const foundTags = await prisma.tag.findMany({ where: { name: { in: tagNames } } });
    if (foundTags.length !== tagNames.length) {
      const invalid = tagNames.filter(t => !foundTags.map(f => f.name).includes(t));
      res.status(400).json({ error: `Invalid tags: ${invalid.join(', ')}` });
      return;
    }

    const founderEquity = 100 - platformEquityForLevel(0);

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          name, description, tagline, website, monthlyRevenue, teamSize,
          visibility, tags: tagNames,
          levelHistory: { create: { level: 0 } },
          projectTags: { create: foundTags.map(t => ({ tagId: t.id })) },
          owners: { create: { userId: user.id, equityPercent: founderEquity, role: 'FOUNDER' } },
        },
        select: projectSelect,
      });
      return created;
    });

    await createNotification({
      userId: user.id,
      type: 'SYSTEM',
      title: 'Project created',
      body: `Your project "${name}" has been created at Level 0 — Ember.`,
      metadata: { projectId: project.id },
    });

    res.status(201).json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Something went wrong' });
  }
}

export async function getMyProjects(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const projects = await prisma.project.findMany({
    where: { owners: { some: { userId: user.id } }, status: { not: 'ARCHIVED' } },
    select: projectSelect,
    orderBy: { createdAt: 'desc' },
  });
  res.json(projects);
}

export async function getProject(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const project = await prisma.project.findUnique({ where: { id: req.params.id }, select: projectSelect });
  if (!project) { res.status(404).json({ error: 'Project not found' }); return; }
  const isCoOwner = project.owners.some(o => o.userId === user.id);
  if (project.visibility === 'PRIVATE' && !isCoOwner) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  res.json(project);
}

export async function updateProject(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) { res.status(404).json({ error: 'Not found' }); return; }
  const ownership = await prisma.projectOwnership.findFirst({
    where: { projectId: req.params.id, userId: user.id, role: 'FOUNDER' },
  });
  if (!ownership) { res.status(403).json({ error: 'Forbidden' }); return; }

  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { tags: tagNames, ...rest } = parsed.data;

  if (parsed.data.visibility && ['PUBLIC', 'SELECTIVE'].includes(parsed.data.visibility)) {
    const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!freshUser?.totpEnabled) {
      res.status(403).json({ error: 'Two-factor authentication must be enabled to make a project discoverable', totpRequired: true });
      return;
    }
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (tagNames) {
        const foundTags = await tx.tag.findMany({ where: { name: { in: tagNames } } });
        if (foundTags.length !== tagNames.length) {
          const invalid = tagNames.filter(t => !foundTags.map(f => f.name).includes(t));
          throw new Error(`Invalid tags: ${invalid.join(', ')}`);
        }
        await tx.projectTag.deleteMany({ where: { projectId: req.params.id } });
        await tx.projectTag.createMany({ data: foundTags.map(t => ({ projectId: req.params.id, tagId: t.id })) });
      }
      return tx.project.update({
        where: { id: req.params.id },
        data: { ...rest, ...(tagNames && { tags: tagNames }) },
        select: projectSelect,
      });
    });
    res.json(updated);
  } catch (err: any) {
    res.status(err.message.startsWith('Invalid') ? 400 : 500).json({ error: err.message });
  }
}

export async function archiveProject(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) { res.status(404).json({ error: 'Not found' }); return; }
  const ownership = await prisma.projectOwnership.findFirst({
    where: { projectId: req.params.id, userId: user.id, role: 'FOUNDER' },
  });
  if (!ownership) { res.status(403).json({ error: 'Forbidden' }); return; }
  await prisma.project.update({ where: { id: req.params.id }, data: { status: 'ARCHIVED' } });
  res.json({ success: true });
}

export async function getPublicProjects(_req: Request, res: Response): Promise<void> {
  const projects = await prisma.project.findMany({
    where: { visibility: 'PUBLIC', status: 'ACTIVE' },
    select: projectSelect,
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });
  res.json(projects);
}

export async function getSimilarProjects(req: Request, res: Response): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    select: { tags: true },
  });
  if (!project) { res.status(404).json({ error: 'Not found' }); return; }

  const similar = await prisma.project.findMany({
    where: {
      id: { not: req.params.id },
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      tags: { hasSome: project.tags },
    },
    select: projectSelect,
    take: 6,
  });
  res.json(similar);
}