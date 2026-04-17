# Emoclew Backend

Express + TypeScript REST API with PostgreSQL, Prisma ORM, and pgvector for semantic tag search.

---

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **ORM**: Prisma v5
- **Database**: PostgreSQL + pgvector extension
- **Auth**: JWT, Passport (Local, Google OAuth2, Facebook)
- **Validation**: Zod
- **Security**: Helmet, CORS, express-rate-limit

---

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ with pgvector extension installed
- `.env` file configured (see below)

---

## Environment Variables

Create a `.env` file in the backend root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/emoclew_db"
JWT_SECRET="your_jwt_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
FACEBOOK_APP_ID="your_facebook_app_id"
FACEBOOK_APP_SECRET="your_facebook_app_secret"
```

---

## Installation

```bash
npm install
```

---

## Database Setup

The database uses PostgreSQL with the `pgvector` extension for semantic tag embeddings (768 dimensions).

### First-time / Full Reset

This command wipes the database, applies all migrations, seeds the tags, and inserts the tag embeddings:

```bash
npm run db:init
```

> ⚠️ This will **destroy all data**. Only use on local dev.

### What `db:init` does

1. `prisma migrate reset --force` — drops and recreates the schema, applies `migrations/20260417154652_init/migration.sql` which:
   - Enables the `pgvector` extension
   - Creates all tables and indexes
   - Creates the HNSW index on `Tag.embedding` for fast cosine similarity search
2. `ts-node prisma/seed.ts` — inserts 81 tags across 5 categories (domain, tech, model, stage, geo)
3. `ts-node scripts/insert-embeddings.ts` — reads `scripts/tag-embeddings.json` and populates the 768-dim embeddings for each tag

### Individual Commands

| Command | Description |
|---|---|
| `npm run db:migrate` | Run pending migrations |
| `npm run db:reset` | Reset DB (prompts for confirmation) |
| `npm run db:seed` | Seed tags only |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:studio` | Open Prisma Studio |

---

## Important: Migrations

> ⚠️ **Never delete the `prisma/migrations` folder.** It is the source of truth for the database schema.

The migrations folder must be committed to version control. If lost, the HNSW index definition is gone and must be manually re-added to the migration SQL.

### Adding a new migration

1. Update `prisma/schema.prisma`
2. Run `npm run db:migrate` and give it a descriptive name
3. If the migration involves `Unsupported` types (e.g. vector indexes), manually edit the generated SQL file before applying

---

## Running the Server

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build
npm start
```

---

## Tag Embeddings

Tags use 768-dimensional vector embeddings stored in PostgreSQL via pgvector. The HNSW index enables fast approximate nearest-neighbor search using cosine similarity.

- Embeddings file: `scripts/tag-embeddings.json`
- Insert script: `scripts/insert-embeddings.ts`
- To regenerate embeddings, replace `tag-embeddings.json` and re-run `ts-node scripts/insert-embeddings.ts`

