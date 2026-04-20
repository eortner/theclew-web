import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';
import { createProjectSchema, updateProjectSchema } from './project.validation';

const projectSelect = {
  id: true, name: true, description: true, visibility: true,
  status: true, tags: true, currentLevel: true,
  createdAt: true, updatedAt: true,
  owner: { select: { id: true, name: true, avatarUrl: true } },
  levelHistory: { orderBy: { achievedAt: 'desc' as const }, take: 5 },
  projectTags: {
    select: { tag: { select: { id: true, name: true, category: true } } }
  },
};

export async function createProject(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { name, description, visibility, tags: tagNames } = parsed.data;

  // Add this block inside updateProject, after the ownership check and before the schema parse:
  if (parsed.data.visibility && ['PUBLIC', 'SELECTIVE'].includes(parsed.data.visibility)) {
    const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!freshUser?.totpEnabled) {
      res.status(403).json({
        error:        'Two-factor authentication must be enabled to make a project discoverable',
        totpRequired: true,
      });
      return;
    }
  }

  try {
    // Validate all tags exist in the curated Tag table
    const foundTags = await prisma.tag.findMany({
      where: { name: { in: tagNames } },
    });

    if (foundTags.length !== tagNames.length) {
      const foundNames = foundTags.map(t => t.name);
      const invalid = tagNames.filter(t => !foundNames.includes(t));
      res.status(400).json({ error: `Invalid tags: ${invalid.join(', ')}` });
      return;
    }

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          name,
          description,
          visibility,
          tags: tagNames,           // denormalized cache
          ownerId: user.id,
          levelHistory: { create: { level: 0 } },
          projectTags: {
            create: foundTags.map(t => ({ tagId: t.id })),
          },
        },
        select: projectSelect,
      });
      return created;
    });

    res.status(201).json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Something went wrong' });
  }
}

export async function getMyProjects(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const projects = await prisma.project.findMany({
    where:   { ownerId: user.id, status: { not: 'ARCHIVED' } },
    select:  projectSelect,
    orderBy: { createdAt: 'desc' },
  });
  res.json(projects);
}

export async function getProject(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const project = await prisma.project.findUnique({
    where:  { id: req.params.id },
    select: projectSelect,
  });

  if (!project) { res.status(404).json({ error: 'Project not found' }); return; }

  if (project.visibility === 'PRIVATE' && project.owner.id !== user.id) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }

  res.json(project);
}

export async function updateProject(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) { res.status(404).json({ error: 'Not found' }); return; }
  if (project.ownerId !== user.id) { res.status(403).json({ error: 'Forbidden' }); return; }

  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { tags: tagNames, ...rest } = parsed.data;

  // Add this block inside updateProject, after the ownership check and before the schema parse:
  if (parsed.data.visibility && ['PUBLIC', 'SELECTIVE'].includes(parsed.data.visibility)) {
    const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!freshUser?.totpEnabled) {
      res.status(403).json({
        error:        'Two-factor authentication must be enabled to make a project discoverable',
        totpRequired: true,
      });
      return;
    }
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // If tags are being updated, validate and re-link them
      if (tagNames) {
        const foundTags = await tx.tag.findMany({
          where: { name: { in: tagNames } },
        });

        if (foundTags.length !== tagNames.length) {
          const foundNames = foundTags.map(t => t.name);
          const invalid = tagNames.filter(t => !foundNames.includes(t));
          throw new Error(`Invalid tags: ${invalid.join(', ')}`);
        }

        // Delete existing ProjectTag links and recreate
        await tx.projectTag.deleteMany({ where: { projectId: req.params.id } });
        await tx.projectTag.createMany({
          data: foundTags.map(t => ({ projectId: req.params.id, tagId: t.id })),
        });
      }

      return tx.project.update({
        where:  { id: req.params.id },
        data:   {
          ...rest,
          ...(tagNames && { tags: tagNames }),
        },
        select: projectSelect,
      });
    });

    res.json(updated);
  } catch (err: any) {
    const status = err.message.startsWith('Invalid tags') ? 400 : 500;
    res.status(status).json({ error: err.message ?? 'Something went wrong' });
  }
}

export async function archiveProject(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) { res.status(404).json({ error: 'Not found' }); return; }
  if (project.ownerId !== user.id) { res.status(403).json({ error: 'Forbidden' }); return; }

  await prisma.project.update({
    where: { id: req.params.id },
    data:  { status: 'ARCHIVED' },
  });
  res.status(204).send();
}

export async function getPublicProjects(_req: Request, res: Response): Promise<void> {
  const projects = await prisma.project.findMany({
    where:   { visibility: 'PUBLIC', status: 'ACTIVE' },
    select:  projectSelect,
    orderBy: { updatedAt: 'desc' },
    take:    50,
  });
  res.json(projects);
}