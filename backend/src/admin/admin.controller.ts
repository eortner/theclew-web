import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await prisma.user.findMany({
    select: {
      id: true, email: true, name: true, role: true,
      provider: true, createdAt: true,
      _count: { select: { ownerships: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
}

export async function listProjects(_req: Request, res: Response): Promise<void> {
  const projects = await prisma.project.findMany({
    select: {
      id: true, name: true, visibility: true, status: true,
      currentLevel: true, createdAt: true,
      owners: { where: { role: 'FOUNDER' }, select: { user: { select: { id: true, email: true, name: true } } }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(projects);
}

export async function getStats(_req: Request, res: Response): Promise<void> {
  const [totalUsers, totalProjects, byLevel, waitlistCount] = await Promise.all([
    prisma.user.count(),
    prisma.project.count({ where: { status: { not: 'ARCHIVED' } } }),
    prisma.project.groupBy({
      by: ['currentLevel'],
      _count: { _all: true },
      where: { status: { not: 'ARCHIVED' } },
    }),
    prisma.waitlistEntry.count(),
  ]);
  res.json({ totalUsers, totalProjects, byLevel, waitlistCount });
}