# Local Development Setup

Complete walkthrough to get GAPHTO running on your machine.

---

## Prerequisites

- [Bun](https://bun.sh) — `curl -fsSL https://bun.sh/install | bash`
- [Docker](https://docs.docker.com/get-docker/) — for PostgreSQL

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

## 3. Start the database

```bash
bun run db:up
```

This starts a PostgreSQL 16 container on port **5434** and a pgAdmin instance on port **5050** (http://localhost:5050, login: `admin@gaphto.org` / `admin`).

Wait a few seconds for the health check to pass before continuing.

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

## 7. Start the dev server

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
Run `bun run db:sync-data` to copy `scraped-assets/` into `public/images/`, then restart the dev server.

### Scraper output is missing
If `scraper/output/` is empty or stale, re-run the WordPress XML parser:
```bash
bun run scrape:xml
```
See [SCRAPER.md](./SCRAPER.md) for details.

---

## Stop the database

```bash
bun run db:down
```
