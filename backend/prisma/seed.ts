import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TAGS: { name: string; category: string }[] = [
  // Domain
  { name: 'fintech',         category: 'domain' },
  { name: 'healthtech',      category: 'domain' },
  { name: 'edtech',          category: 'domain' },
  { name: 'legaltech',       category: 'domain' },
  { name: 'proptech',        category: 'domain' },
  { name: 'cleantech',       category: 'domain' },
  { name: 'agritech',        category: 'domain' },
  { name: 'insurtech',       category: 'domain' },
  { name: 'govtech',         category: 'domain' },
  { name: 'hrtech',          category: 'domain' },
  { name: 'logistics',       category: 'domain' },
  { name: 'ecommerce',       category: 'domain' },
  { name: 'gaming',          category: 'domain' },
  { name: 'media',           category: 'domain' },
  { name: 'security',        category: 'domain' },
  { name: 'devtools',        category: 'domain' },
  { name: 'infrastructure',  category: 'domain' },
  { name: 'data',            category: 'domain' },
  { name: 'analytics',       category: 'domain' },
  { name: 'social',          category: 'domain' },
  { name: 'marketplace',     category: 'domain' },
  { name: 'creator-economy', category: 'domain' },
  { name: 'web3',            category: 'domain' },
  { name: 'defi',            category: 'domain' },
  { name: 'nft',             category: 'domain' },
  { name: 'crypto',          category: 'domain' },
  { name: 'robotics',        category: 'domain' },
  { name: 'hardware',        category: 'domain' },
  { name: 'biotech',         category: 'domain' },
  { name: 'space',           category: 'domain' },

  // Tech
  { name: 'llm',             category: 'tech' },
  { name: 'rag',             category: 'tech' },
  { name: 'agents',          category: 'tech' },
  { name: 'computer-vision', category: 'tech' },
  { name: 'nlp',             category: 'tech' },
  { name: 'ml',              category: 'tech' },
  { name: 'api',             category: 'tech' },
  { name: 'sdk',             category: 'tech' },
  { name: 'blockchain',      category: 'tech' },
  { name: 'mobile',          category: 'tech' },
  { name: 'ios',             category: 'tech' },
  { name: 'android',         category: 'tech' },
  { name: 'web',             category: 'tech' },
  { name: 'cli',             category: 'tech' },
  { name: 'cloud',           category: 'tech' },
  { name: 'edge',            category: 'tech' },
  { name: 'iot',             category: 'tech' },
  { name: 'ar-vr',           category: 'tech' },
  { name: 'payments',        category: 'tech' },
  { name: 'auth',            category: 'tech' },
  { name: 'database',        category: 'tech' },
  { name: 'streaming',       category: 'tech' },
  { name: 'voice',           category: 'tech' },
  { name: 'search',          category: 'tech' },

  // Business model
  { name: 'b2b',             category: 'model' },
  { name: 'b2c',             category: 'model' },
  { name: 'b2b2c',           category: 'model' },
  { name: 'saas',            category: 'model' },
  { name: 'open-source',     category: 'model' },
  { name: 'platform',        category: 'model' },
  { name: 'subscription',    category: 'model' },
  { name: 'transactional',   category: 'model' },
  { name: 'freemium',        category: 'model' },
  { name: 'enterprise',      category: 'model' },
  { name: 'consumer',        category: 'model' },
  { name: 'community',       category: 'model' },
  { name: 'non-profit',      category: 'model' },

  // Stage
  { name: 'idea',            category: 'stage' },
  { name: 'mvp',             category: 'stage' },
  { name: 'pre-seed',        category: 'stage' },
  { name: 'seed',            category: 'stage' },
  { name: 'growth',          category: 'stage' },
  { name: 'revenue',         category: 'stage' },

  // Geo
  { name: 'latam',           category: 'geo' },
  { name: 'africa',          category: 'geo' },
  { name: 'southeast-asia',  category: 'geo' },
  { name: 'south-asia',      category: 'geo' },
  { name: 'mena',            category: 'geo' },
  { name: 'europe',          category: 'geo' },
  { name: 'north-america',   category: 'geo' },
  { name: 'global',          category: 'geo' },
];

async function seedTags() {
  console.log('Seeding tags...');
  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where:  { name: tag.name },
      update: {},
      create: tag,
    });
  }

  // Seed launch announcement
  await prisma.announcement.upsert({
    where:  { key: 'launch-2026' },
    create: {
      key:   'launch-2026',
      title: 'Welcome to Emoclew — Early Access',
      body:  'You are part of our founding group. In 30 days we will move to a $11.99/year subscription. This funds our own secured local AI models, shared with founders who reach Level 1. As our community grows, we will bring more builders to higher tiers and expand tooling across all levels.',
      active: true,
    },
    update: {},
  });

  console.log(`✅ ${TAGS.length} tags seeded.`);
  console.log('✅ Launch announcement seeded.');
}

async function seedDevUser() {
  if (process.env.NODE_ENV === 'production') return;

  const email = 'dev@emoclew.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('ℹ️  Dev user already exists — skipping.');
    return;
  }

  const passwordHash = await bcrypt.hash('dev1234', 12);
  await prisma.user.create({
    data: {
      email,
      name:         'Dev User',
      role:         'FOUNDER',
      provider:     'LOCAL',
      passwordHash,
    },
  });
  console.log('✅ Dev user created — dev@emoclew.com / dev1234');
}

async function main() {
  await seedTags();
  await seedDevUser();
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

