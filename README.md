# Emoclew — Monorepo

## Structure
```
emoclew/
├── backend/        Node.js + TypeScript + Express + Prisma
├── frontend/       Next.js (coming next)
└── docker-compose.yml
```

## Quick Start

### 1. Environment
```bash
cd backend
cp .env.example .env
# Fill in JWT_SECRET, Google and Facebook OAuth credentials
```

### 2. Start Postgres
```bash
docker-compose up -d
```

### 3. Install and migrate
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run dev server
```bash
npm run dev
# Backend running at http://localhost:4000
```

## API Routes

### Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /auth/register | No | Register with email + password |
| POST | /auth/login | No | Login, returns JWT |
| GET | /auth/google | No | Start Google OAuth |
| GET | /auth/facebook | No | Start Facebook OAuth |

### Users
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | /users/me | JWT | Get own profile + projects |
| PATCH | /users/me | JWT | Update name / avatar |
| DELETE | /users/me | JWT | Delete account |

### Projects
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /projects | JWT | Create project |
| GET | /projects/mine | JWT | List own projects |
| GET | /projects/:id | JWT | Get project (visibility enforced) |
| PATCH | /projects/:id | JWT | Update project (owner only) |
| DELETE | /projects/:id | JWT | Archive project (owner only) |
| GET | /projects/public | No | List all PUBLIC projects |

### Admin
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | /admin/users | JWT + ADMIN | List all users |
| GET | /admin/projects | JWT + ADMIN | List all projects |
| GET | /admin/stats | JWT + ADMIN | Platform stats |

### Health
| Method | Route | Description |
|---|---|---|
| GET | /health | Server status |

## Project Validation Rules
- `metatags`: minimum 3 required
- `tags`: exactly 10 required
- `description`: minimum 20 characters
- `visibility`: PRIVATE | SELECTIVE | PUBLIC (default: PRIVATE)

## Promoting a Project Level
Call `advanceLevel(projectId)` from `src/levels/level.service.ts`.
The full voting cycle engine will be wired here in Phase 2.
