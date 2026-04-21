import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TAGS: { name: string; category: string }[] = [
  { name: 'fintech', category: 'domain' }, { name: 'healthtech', category: 'domain' },
  { name: 'edtech', category: 'domain' }, { name: 'legaltech', category: 'domain' },
  { name: 'proptech', category: 'domain' }, { name: 'cleantech', category: 'domain' },
  { name: 'agritech', category: 'domain' }, { name: 'insurtech', category: 'domain' },
  { name: 'govtech', category: 'domain' }, { name: 'hrtech', category: 'domain' },
  { name: 'logistics', category: 'domain' }, { name: 'ecommerce', category: 'domain' },
  { name: 'gaming', category: 'domain' }, { name: 'media', category: 'domain' },
  { name: 'security', category: 'domain' }, { name: 'devtools', category: 'domain' },
  { name: 'infrastructure', category: 'domain' }, { name: 'data', category: 'domain' },
  { name: 'analytics', category: 'domain' }, { name: 'social', category: 'domain' },
  { name: 'marketplace', category: 'domain' }, { name: 'creator-economy', category: 'domain' },
  { name: 'web3', category: 'domain' }, { name: 'defi', category: 'domain' },
  { name: 'nft', category: 'domain' }, { name: 'crypto', category: 'domain' },
  { name: 'robotics', category: 'domain' }, { name: 'hardware', category: 'domain' },
  { name: 'biotech', category: 'domain' }, { name: 'space', category: 'domain' },
  { name: 'llm', category: 'tech' }, { name: 'rag', category: 'tech' },
  { name: 'agents', category: 'tech' }, { name: 'computer-vision', category: 'tech' },
  { name: 'nlp', category: 'tech' }, { name: 'ml', category: 'tech' },
  { name: 'api', category: 'tech' }, { name: 'sdk', category: 'tech' },
  { name: 'blockchain', category: 'tech' }, { name: 'mobile', category: 'tech' },
  { name: 'ios', category: 'tech' }, { name: 'android', category: 'tech' },
  { name: 'web', category: 'tech' }, { name: 'cli', category: 'tech' },
  { name: 'cloud', category: 'tech' }, { name: 'edge', category: 'tech' },
  { name: 'iot', category: 'tech' }, { name: 'ar-vr', category: 'tech' },
  { name: 'payments', category: 'tech' }, { name: 'auth', category: 'tech' },
  { name: 'database', category: 'tech' }, { name: 'streaming', category: 'tech' },
  { name: 'voice', category: 'tech' }, { name: 'search', category: 'tech' },
  { name: 'b2b', category: 'model' }, { name: 'b2c', category: 'model' },
  { name: 'b2b2c', category: 'model' }, { name: 'saas', category: 'model' },
  { name: 'open-source', category: 'model' }, { name: 'platform', category: 'model' },
  { name: 'subscription', category: 'model' }, { name: 'transactional', category: 'model' },
  { name: 'freemium', category: 'model' }, { name: 'enterprise', category: 'model' },
  { name: 'consumer', category: 'model' }, { name: 'community', category: 'model' },
  { name: 'non-profit', category: 'model' },
  { name: 'idea', category: 'stage' }, { name: 'mvp', category: 'stage' },
  { name: 'pre-seed', category: 'stage' }, { name: 'seed', category: 'stage' },
  { name: 'growth', category: 'stage' }, { name: 'revenue', category: 'stage' },
  { name: 'latam', category: 'geo' }, { name: 'africa', category: 'geo' },
  { name: 'southeast-asia', category: 'geo' }, { name: 'south-asia', category: 'geo' },
  { name: 'mena', category: 'geo' }, { name: 'europe', category: 'geo' },
  { name: 'north-america', category: 'geo' }, { name: 'global', category: 'geo' },
];

async function seedTags() {
  console.log('Seeding tags...');
  for (const tag of TAGS) {
    await prisma.tag.upsert({ where: { name: tag.name }, update: {}, create: tag });
  }
  await prisma.announcement.upsert({
    where: { key: 'launch-2026' },
    create: {
      key: 'launch-2026',
      title: 'Welcome to Emoclew — Early Access',
      body: 'You are part of our founding group. In 30 days we will move to a $11.99/year subscription. This funds our own secured local AI models, shared with founders who reach Level 1. As our community grows, we will bring more builders to higher tiers and expand tooling across all levels.',
      active: true,
    },
    update: {},
  });
  console.log(`✅ ${TAGS.length} tags seeded.`);
}

async function seedDemoUsers() {
  if (process.env.NODE_ENV === 'production') {
    console.log('ℹ️  Skipping dev user in production');
  } else {
    const passwordHash = await bcrypt.hash('dev1234', 12);
    await prisma.user.upsert({
      where: { email: 'dev@emoclew.com' },
      update: {},
      create: { email: 'dev@emoclew.com', name: 'Dev User', role: 'FOUNDER', provider: 'LOCAL', passwordHash },
    });
    console.log('✅ Dev user: dev@emoclew.com / dev1234');
  }

  // Demo users — always seed for demo purposes
  const hash = await bcrypt.hash('demo1234', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@emoclew.com' },
    update: {},
    create: { email: 'alice@emoclew.com', name: 'Alice Chen', role: 'FOUNDER', provider: 'LOCAL', passwordHash: hash },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@emoclew.com' },
    update: {},
    create: { email: 'bob@emoclew.com', name: 'Bob Martins', role: 'FOUNDER', provider: 'LOCAL', passwordHash: hash },
  });

  const sara = await prisma.user.upsert({
    where: { email: 'sara@emoclew.com' },
    update: {},
    create: { email: 'sara@emoclew.com', name: 'Sara Okafor', role: 'FOUNDER', provider: 'LOCAL', passwordHash: hash },
  });

  console.log('✅ Demo users: alice, bob, sara @ emoclew.com / demo1234');
  return { alice, bob, sara };
}

async function seedDemoProjects(users: { alice: any; bob: any; sara: any }) {
  const tagList = await prisma.tag.findMany({ where: { name: { in: ['fintech', 'payments', 'b2b', 'saas', 'latam', 'llm', 'agents', 'b2c', 'healthtech', 'mobile', 'global', 'mvp', 'seed', 'revenue', 'devtools'] } } });
  const tagMap = Object.fromEntries(tagList.map(t => [t.name, t]));

  // Project A — Level 0 Ember — Alice — raw idea
  const existingA = await prisma.project.findFirst({ where: { owners: { some: { userId: users.alice.id } } } });
  if (!existingA) {
    const projectA = await prisma.project.create({
      data: {
        name: 'PayFlow',
        description: 'A cross-border payment infrastructure for SMEs in Latin America. We solve the problem of expensive and slow international transfers by providing a unified API that connects local payment rails across 12 LATAM countries.',
        tagline: 'Cross-border payments, finally simple.',
        visibility: 'PUBLIC',
        currentLevel: 0,
        tags: ['fintech', 'payments', 'b2b', 'latam'],
        status: 'ACTIVE',
        monthlyRevenue: 0,
        teamSize: 1,
        levelHistory: { create: { level: 0 } },
        projectTags: { create: ['fintech', 'payments', 'b2b', 'latam'].map(n => ({ tagId: tagMap[n].id })) },
        owners: { create: { userId: users.alice.id, equityPercent: 85, role: 'FOUNDER' } },
      },
    });
    await createSystemNotification(users.alice.id, 'Joined Emoclew', 'Welcome to Emoclew. Your journey starts here at Level 0 — Ember.', { projectId: projectA.id });
    console.log('✅ Project A: PayFlow (Level 0)');
  }

  // Project B — Level 1 Spark — Bob — has URL and identity
  const existingB = await prisma.project.findFirst({ where: { owners: { some: { userId: users.bob.id } } } });
  if (!existingB) {
    const projectB = await prisma.project.create({
      data: {
        name: 'MindBridge',
        description: 'AI-powered mental health platform connecting underserved communities with licensed therapists. Our mobile-first approach uses LLMs to provide 24/7 support between sessions, reducing dropout rates by 60%.',
        tagline: 'Mental health support that goes where you are.',
        website: 'https://mindbridge.health',
        visibility: 'PUBLIC',
        currentLevel: 1,
        tags: ['healthtech', 'llm', 'mobile', 'b2c', 'global'],
        status: 'ACTIVE',
        monthlyRevenue: 4200,
        teamSize: 3,
        levelHistory: { create: [{ level: 0, achievedAt: new Date('2026-01-15') }, { level: 1, achievedAt: new Date('2026-03-01') }] },
        projectTags: { create: ['healthtech', 'llm', 'mobile', 'b2c', 'global'].map(n => ({ tagId: tagMap[n].id })) },
        owners: { create: { userId: users.bob.id, equityPercent: 85, role: 'FOUNDER' } },
      },
    });
    await createSystemNotification(users.bob.id, 'Joined Emoclew', 'Welcome to Emoclew. Your journey starts here at Level 0 — Ember.', { projectId: projectB.id });
    await createSystemNotification(users.bob.id, '🔥 Level up — Spark', 'MindBridge has reached Level 1 — Spark. Investor access and dev tools are now unlocked.', { projectId: projectB.id });
    console.log('✅ Project B: MindBridge (Level 1)');
  }

  // Project C — Level 2 Flame — Sara — revenue, team, traction
  const existingC = await prisma.project.findFirst({ where: { owners: { some: { userId: users.sara.id } } } });
  if (!existingC) {
    const projectC = await prisma.project.create({
      data: {
        name: 'AgentStack',
        description: 'Developer platform for building, deploying and monitoring production AI agents. We provide the infrastructure layer that companies need to run autonomous agents reliably at scale — with observability, rollback, and human-in-the-loop controls built in.',
        tagline: 'The ops layer for autonomous AI agents.',
        website: 'https://agentstack.dev',
        visibility: 'PUBLIC',
        currentLevel: 2,
        tags: ['agents', 'llm', 'devtools', 'saas', 'b2b', 'global'],
        status: 'ACTIVE',
        monthlyRevenue: 18500,
        teamSize: 6,
        levelHistory: { create: [{ level: 0, achievedAt: new Date('2025-11-01') }, { level: 1, achievedAt: new Date('2026-01-10') }, { level: 2, achievedAt: new Date('2026-03-15') }] },
        projectTags: { create: ['agents', 'llm', 'devtools', 'saas', 'b2b', 'global'].map(n => ({ tagId: tagMap[n].id })) },
        owners: { create: { userId: users.sara.id, equityPercent: 85, role: 'FOUNDER' } },
      },
    });
    await createSystemNotification(users.sara.id, 'Joined Emoclew', 'Welcome to Emoclew. Your journey starts here at Level 0 — Ember.', { projectId: projectC.id });
    await createSystemNotification(users.sara.id, '🔥 Level up — Spark', 'AgentStack has reached Level 1 — Spark.', { projectId: projectC.id });
    await createSystemNotification(users.sara.id, '🔥 Level up — Flame', 'AgentStack has reached Level 2 — Flame. Domain support and company-building tools are now unlocked.', { projectId: projectC.id });
    console.log('✅ Project C: AgentStack (Level 2)');
  }
}

async function createSystemNotification(userId: string, title: string, body: string, metadata?: Record<string, string>) {
  await prisma.notification.create({
    data: { userId, type: 'SYSTEM', title, body, metadata: metadata ?? {} },
  });
}

async function main() {
  await seedTags();
  const users = await seedDemoUsers();
  await seedDemoProjects(users);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());