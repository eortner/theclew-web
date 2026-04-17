import { prisma } from '../../src/lib/prisma';

afterEach(async () => {
  // Delete in dependency order to respect FK constraints
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});