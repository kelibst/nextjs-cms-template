# GAPHTO — Ghana Association of Public Health Technical Officers

Next.js web platform for GAPHTO, migrated from the association's previous WordPress.com site at [www.gaphto.org](https://www.gaphto.org).

---

## Documentation

| Guide | What it covers |
|-------|---------------|
| [readme/LOCAL_DEV.md](readme/LOCAL_DEV.md) | Local setup walkthrough — DB, seeding, dev server, test credentials |
| [readme/SCRAPER.md](readme/SCRAPER.md) | WordPress data scraper — XML vs REST API, image downloads, output files, known issues |
| [readme/DATABASE.md](readme/DATABASE.md) | Schema overview, seeding sequence, expected counts, migration guide |
| [readme/DEPLOYMENT.md](readme/DEPLOYMENT.md) | Hetzner VPS deployment — Docker, Nginx, SSL, PM2, re-deploy |
| [readme/ARCHITECTURE.md](readme/ARCHITECTURE.md) | System design, data flow, tech stack, auth/RBAC, page builder |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Auth**: NextAuth v5
- **Database**: PostgreSQL via Drizzle ORM
- **Package manager**: Bun

---

## Quick Start (local)

```bash
bun install
cp .env.example .env          # defaults work for local dev, no changes needed
bun run db:up                 # start PostgreSQL on port 5434
bun run db:sync-data          # copy scraper output → src/data/ and public/images/
bun run db:migrate            # create tables
bun run db:seed               # populate DB from scraped JSON
bun run dev                   # http://localhost:3000
```

Test login: `superadmin@gaphto.org` / `Test1234!`

See [readme/LOCAL_DEV.md](readme/LOCAL_DEV.md) for full details and troubleshooting.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run scrape:xml` | Parse WordPress XML export (authoritative — recommended) |
| `bun run scrape` | Run the REST API scraper (public posts only) |
| `bun run db:sync-data` | Copy `scraper/output/*.json` → `src/data/` and `scraped-assets/` → `public/images/` |
| `bun run db:up` | Start the PostgreSQL container (local dev) |
| `bun run db:down` | Stop the PostgreSQL container |
| `bun run db:generate` | Generate a Drizzle migration file after schema changes |
| `bun run db:migrate` | Apply pending migrations |
| `bun run db:seed` | Seed the database from scraped JSON |

---

## Project Structure

```
gaphto/
├── src/
│   ├── app/
│   │   ├── (public)/       Public-facing pages (home, about, news, events…)
│   │   ├── (auth)/         Login & register
│   │   ├── (dashboard)/    Admin dashboard (protected)
│   │   ├── (member)/       Member centre (protected)
│   │   └── api/            API routes (auth, uploads, payments)
│   ├── components/
│   │   ├── layout/         Header & footer
│   │   ├── home/           Homepage section components
│   │   ├── shared/         Page headers, post cards, block renderer
│   │   ├── dashboard/      Admin UI components
│   │   └── ui/             shadcn/ui primitives
│   ├── data/               JSON fallback files (populated by db:sync-data)
│   └── lib/                Data fetching, DB client, utilities
├── scraper/                WordPress.com content scraper
├── drizzle/                Schema, migrations, seed
├── infrastructure/         Docker Compose, Nginx, PM2
├── readme/                 Per-component documentation
└── public/
    └── images/             Static images (logo, scraped assets)
```
