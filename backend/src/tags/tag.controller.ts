import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getTags(_req: Request, res: Response): Promise<void> {
  const tags = await prisma.tag.findMany({
    select:  { id: true, name: true, category: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
  res.json(tags);
}