import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function main() {
  const raw = readFileSync(join(__dirname, 'tag-embeddings.json'), 'utf-8');
  const tags: { name: string; embedding: number[] }[] = JSON.parse(raw);

  console.log(`Inserting embeddings for ${tags.length} tags...`);

  for (const tag of tags) {
    const vector = JSON.stringify(tag.embedding);
    const updated = await prisma.$executeRaw`
      UPDATE "Tag"
      SET embedding = ${vector}::vector
      WHERE name = ${tag.name}
    `;
    if (updated === 0) {
      console.warn(`⚠️  Tag not found in DB: ${tag.name}`);
    } else {
      console.log(`✅ ${tag.name}`);
    }
  }

  console.log('Done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());