# TASK BRIEF — Agent 1: Infrastructure
> Read AGENT_CONTEXT.md first for full project context before writing a single line.
> Context file: /home/kelib/Desktop/moreprojects/gaphto/plans/AGENT_CONTEXT.md

---

## YOUR ROLE
You are the **Infrastructure Agent** for the GAPHTO migration project.
You set up everything needed before the Next.js app and scraper can run:
Docker, PostgreSQL, **Drizzle ORM** schema, migrations, and seed script.

---

## ORM CHOICE: DRIZZLE (not Prisma)
Use **drizzle-orm** with **drizzle-kit** and the `pg` driver.
Do NOT use Prisma anywhere.

---

## DELIVERABLES

### 1. `/home/kelib/Desktop/moreprojects/gaphto/infrastructure/docker-compose.yml`
- PostgreSQL 16 Alpine container named `gaphto_db`
- Credentials: user=`gaphto`, password=`gaphto_secret`, db=`gaphto`
- Expose port `5432:5432`
- Named volume `gaphto_pgdata` for persistence
- PgAdmin4 container for convenience (port `5050:80`, email=`admin@gaphto.org`, password=`admin`)

### 2. `/home/kelib/Desktop/moreprojects/gaphto/infrastructure/.env.example`
All environment variables the project will need:
```
DATABASE_URL="postgresql://gaphto:gaphto_secret@localhost:5432/gaphto"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. `/home/kelib/Desktop/moreprojects/gaphto/drizzle/schema.ts`
Full Drizzle schema using `drizzle-orm/pg-core`. Define ALL tables from AGENT_CONTEXT.md > DATABASE SCHEMA.

**Enums (use `pgEnum`):**
- `roleEnum` → `['super_admin', 'admin', 'editor', 'member']`
- `postCategoryEnum` → `['gaphto-news', 'health-news', 'blog', 'announcement']`
- `postStatusEnum` → `['draft', 'published', 'archived']`
- `eventStatusEnum` → `['upcoming', 'ongoing', 'past', 'cancelled']`
- `memberSpecialtyEnum` → `['disease-control', 'health-information', 'nutrition']`
- `memberStatusEnum` → `['active', 'inactive', 'suspended']`

**Tables to define:**
- `users` — id (uuid, pk, default), email (unique), passwordHash, name, avatarUrl, role (roleEnum), createdAt, updatedAt
- `posts` — id, slug (unique), title, content, excerpt, category (postCategoryEnum), status (postStatusEnum, default 'draft'), featuredImage, authorId (→ users), publishedAt, createdAt, updatedAt
- `tags` — id, name (unique), slug (unique)
- `postTags` — postId (→ posts), tagId (→ tags), composite PK
- `events` — id, title, slug (unique), description, location, isOnline (boolean), startDate, endDate, registrationDeadline, priceGhs (numeric), maxAttendees, status (eventStatusEnum), featuredImage, createdAt
- `eventRegistrations` — id, eventId (→ events), userId (→ users), name, email, phone, paymentStatus (default 'pending'), registeredAt
- `leadership` — id, name, role, imageUrl, bio, facebookUrl, twitterUrl, email, sortOrder (int, default 0), termStart, termEnd, isActive (boolean, default true)
- `galleryAlbums` — id, title, slug (unique), description, coverImage, eventDate, createdAt
- `galleryImages` — id, albumId (→ galleryAlbums), url, caption, altText, sortOrder, uploadedAt
- `publications` — id, title, slug (unique), description, fileUrl, fileType, isMemberOnly (boolean, default false), publishedAt, createdAt
- `members` — id, userId (→ users), memberNumber (unique), specialty (memberSpecialtyEnum), region, facility, joinedDate, membershipStatus (memberStatusEnum, default 'active'), duesPaidUntil
- `announcements` — id, title, content, isPinned (boolean), visibleTo (default 'public'), expiresAt, createdAt
- `contactSubmissions` — id, name, email, subject, message, submittedAt, isRead (boolean, default false)
- `siteSettings` — id, key (unique), value (text), updatedAt  ← for storing contact info and org settings

Use camelCase for TypeScript names, snake_case for SQL column names via `.($name)` notation where needed.
Export all table definitions and type inference helpers (`typeof users.$inferSelect`, etc).

### 4. `/home/kelib/Desktop/moreprojects/gaphto/drizzle/drizzle.config.ts`
```ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

### 5. `/home/kelib/Desktop/moreprojects/gaphto/drizzle/migrate.ts`
Script that runs pending migrations using `drizzle-orm/node-postgres` and `drizzle-kit`'s migrate helper:
```ts
import { migrate } from 'drizzle-orm/node-postgres/migrator'
// connect, run migrate({ migrationsFolder: './drizzle/migrations' }), disconnect
```

### 6. `/home/kelib/Desktop/moreprojects/gaphto/drizzle/seed.ts`
Seed script using Drizzle's insert API:
1. Connects to DB via `pg` Pool using `DATABASE_URL` from env (use `dotenv/config` import)
2. Creates the 4 test users using `bcryptjs` rounds=12:
   - superadmin@gaphto.org / Test1234! / role: super_admin
   - admin@gaphto.org / Test1234! / role: admin
   - editor@gaphto.org / Test1234! / role: editor
   - member@gaphto.org / Test1234! / role: member
3. Reads JSON from `/home/kelib/Desktop/moreprojects/gaphto/scraper/output/` using `existsSync` guards — if a file doesn't exist, skip with a console.warn, never throw
4. If `leadership.json` exists → insert into `leadership` table
5. If `news.json` exists → insert into `posts` (category: 'gaphto-news')
6. If `health-news.json` exists → insert into `posts` (category: 'health-news')
7. If `blog.json` exists → insert into `posts` (category: 'blog')
8. If `gallery.json` exists → insert albums then images
9. If `events.json` exists → insert events
10. If `contact.json` exists → upsert into `siteSettings` (key: 'contact', value: JSON.stringify(data))
11. Print a summary table of what was seeded (record counts)

### 7. `/home/kelib/Desktop/moreprojects/gaphto/package.json`
Root-level package.json for the infrastructure layer:
```json
{
  "name": "gaphto-infrastructure",
  "scripts": {
    "db:up": "docker-compose -f infrastructure/docker-compose.yml up -d",
    "db:down": "docker-compose -f infrastructure/docker-compose.yml down",
    "db:migrate": "ts-node drizzle/migrate.ts",
    "db:seed": "ts-node drizzle/seed.ts",
    "db:generate": "drizzle-kit generate"
  }
}
```
Dependencies: `drizzle-orm`, `pg`, `bcryptjs`, `dotenv`
DevDependencies: `drizzle-kit`, `typescript`, `ts-node`, `@types/node`, `@types/pg`, `@types/bcryptjs`

---

## CONSTRAINTS
- Do NOT run docker, npm install, or any shell commands — just write the files
- Do NOT write any Next.js app code — that comes in Phase 1
- Do NOT write scraper code — Agent 2 handles that
- Do NOT use Prisma — Drizzle only
- seed.ts must be resilient: missing JSON → warn + skip, never throw
- All Drizzle schema relations must use `.references()` with explicit `onDelete` behaviour

---

## WHEN DONE
Update the STATUS LOG table in AGENT_CONTEXT.md:
- Change Agent 1 row status from `PENDING` to `DONE`
- Notes: list all files created

---

## SUCCESS CRITERIA
- `docker-compose.yml` brings up postgres + pgadmin with one command
- `schema.ts` covers every table with correct Drizzle syntax and all enums
- `seed.ts` runs without error even when no JSON output files exist yet
- `drizzle.config.ts` is correctly configured for `drizzle-kit generate` and `migrate`
- All files at correct paths
