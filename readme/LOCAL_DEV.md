# Local Development Setup

Complete walkthrough to get GAPHTO running on your machine.

---

## Prerequisites

- [Bun](https://bun.sh) — `curl -fsSL https://bun.sh/install | bash`
- [Docker](https://docs.docker.com/get-docker/) — for PostgreSQL and MinIO

---

## 1. Install dependencies

```bash
bun install
```

---

## 2. Configure environment variables

```bash
cp .env.example .env
```

The defaults in `.env.example` work as-is for local development (database on port 5434, dev secrets). You do not need to change anything to get started.

---

## 3. Start the database and storage

```bash
docker compose -f infrastructure/docker-compose.yml up -d
```

This starts three services:

| Service | Port | URL | Credentials |
|---------|------|-----|-------------|
| PostgreSQL | 5434 | — | `gaphto` / `gaphto_secret` |
| pgAdmin | 5050 | http://localhost:5050 | `admin@gaphto.org` / `admin` |
| MinIO (S3 storage) | 9000 | — | API endpoint |
| MinIO console | 9001 | http://localhost:9001 | `minioadmin` / `minioadmin` |

Wait a few seconds for the health checks to pass before continuing.

> If you only want Postgres (no MinIO), you can still run `bun run db:up` — but images will not load until MinIO is started.

---

## 4. Run migrations

Creates all 17 database tables:

```bash
bun run db:migrate
```

Safe to re-run — Drizzle only applies new migrations.

---

## 5. Sync scraped data

Copies scraped JSON files into `src/data/` and images into `public/images/`:

```bash
bun run db:sync-data
```

This is required before seeding because `drizzle/seed.ts` reads from `scraper/output/`.

---

## 6. Seed the database

```bash
bun run db:seed
```

Expected output:

```
========== SEED SUMMARY ==========
  users                        4
  leadership                   0   ← known issue, see DATABASE.md
  posts:gaphto-news            ~30
  posts:health-news            ~5
  posts:blog                   ~7
  gallery_albums               ~38
  gallery_images               ~364
  events                       ~5
  site_settings:contact        1
  site_settings:pages          68
  site_settings:about          1
  site_settings:practice-areas 1
  site_settings:fund           1
  publications                 18
===================================
```

Safe to re-run — all inserts use `onConflictDoNothing()`.

---

## 7. Upload images to MinIO

After seeding, upload all scraped images into MinIO so they resolve correctly in the browser:

```bash
bunx tsx scripts/migrate-to-minio.ts
```

This uploads the 367 image and document files from `public/images/` into the `gaphto-media` MinIO bucket. Safe to re-run — already-uploaded files are skipped.

You can verify the upload at **http://localhost:9001** (login: `minioadmin` / `minioadmin`) — browse the `gaphto-media` bucket to see all files.

---

## 8. Start the dev server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Test credentials** (all use password `Test1234!`):

| Email | Role |
|-------|------|
| `superadmin@gaphto.org` | Super Admin |
| `admin@gaphto.org` | Admin |
| `editor@gaphto.org` | Editor |
| `member@gaphto.org` | Member |

---

## Troubleshooting

### `bun run db:migrate` fails with "connection refused"
The database container isn't ready yet. Run `bun run db:up` and wait 5–10 seconds.

### `bun run db:seed` fails with "relation does not exist"
Migrations haven't been applied. Run `bun run db:migrate` first.

### Port 5434 already in use
Another process is using the port. Either stop it or change `ports` in `infrastructure/docker-compose.yml` and update `DATABASE_URL` in `.env`.

### Images not showing in the browser

Images are now served from MinIO. Check in this order:

1. **Is MinIO running?**
   ```bash
   docker compose -f infrastructure/docker-compose.yml ps
   ```
   If not: `docker compose -f infrastructure/docker-compose.yml up minio -d`

2. **Have images been migrated to MinIO?**
   ```bash
   bunx tsx scripts/migrate-to-minio.ts
   ```

3. **Is `NEXT_PUBLIC_MEDIA_BASE_URL` correct in `.env`?**
   Should be: `NEXT_PUBLIC_MEDIA_BASE_URL=http://localhost:9000/gaphto-media`
   Restart `bun run dev` after changing `.env`.

See [STORAGE.md](./STORAGE.md) for full storage documentation.

### Scraper output is missing
If `scraper/output/` is empty or stale, re-run the WordPress XML parser:
```bash
bun run scrape:xml
```
See [SCRAPER.md](./SCRAPER.md) for details.

---

## Stop everything

```bash
# Stop Postgres + MinIO + pgAdmin
docker compose -f infrastructure/docker-compose.yml down

# Or just Postgres (legacy alias)
bun run db:down
```
