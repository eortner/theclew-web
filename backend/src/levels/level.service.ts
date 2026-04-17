import { prisma } from '../lib/prisma';

export const LEVEL_NAMES = ['EMBER', 'SPARK', 'FLAME', 'BLAZE', 'NOVA'] as const;
export const MAX_LEVEL = 4;

export async function advanceLevel(projectId: string): Promise<{ level: number }> {
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });

  if (project.currentLevel >= MAX_LEVEL) {
    throw new Error('Project is already at maximum level');
  }

  const newLevel = project.currentLevel + 1;

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      currentLevel: newLevel,
      levelHistory: { create: { level: newLevel } },
    },
    select: { currentLevel: true },
  });

  return { level: updated.currentLevel };
}

export async function getLevelHistory(projectId: string) {
  return prisma.levelHistory.findMany({
    where:   { projectId },
    orderBy: { achievedAt: 'asc' },
  });
}
