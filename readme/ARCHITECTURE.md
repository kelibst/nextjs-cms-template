# Architecture

---

## Overview

GAPHTO is a Next.js 16 (App Router) application migrated from WordPress.com. It serves a public-facing website for the Ghana Association of Public Health Technical Officers, plus a password-protected dashboard for administrators and a member centre for registered members.

---

## Data flow

```
WordPress.com export (gaphto.WordPress.2026-04-10.xml)
        │
        ▼
scraper/src/parse-wxr.ts          ← authoritative data pipeline
        │
        ├── scraper/output/*.json  ← structured content (posts, events, leadership, ...)
        │
        └── scraped-assets/       ← downloaded images (via Photon CDN)
                │
         bun run db:sync-data
                │
        ┌───────┴────────┐
        ▼                ▼
   src/data/*.json   public/images/   ← app runtime files
        │
        ▼
   drizzle/seed.ts
        │
        ▼
   PostgreSQL (via Drizzle ORM)
        │
        ▼ (scripts/migrate-to-minio.ts)
   MinIO (gaphto-media bucket)   ← authoritative media store
```

At runtime, `src/lib/server-data.ts` tries the database first and falls back to `src/data/*.json` if the DB is unavailable. `src/lib/media-url.ts` (`getMediaUrl()`) resolves all image paths to MinIO URLs transparently.

### Media URL resolution

```
DB stores bare key: "gallery/2016-gallery/logo-u.png"
        │
        ▼  getMediaUrl()
http://localhost:9000/gaphto-media/gallery/2016-gallery/logo-u.png  (local)
https://gaphto.org/media/gaphto-media/gallery/2016-gallery/logo-u.png  (prod)
```

Legacy root-relative paths (`/images/…`) and external URLs are passed through unchanged.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | NextAuth v5 (credentials provider, bcrypt passwords) |
| Database | PostgreSQL 16 via Drizzle ORM |
| Package manager | Bun |
| Object storage | MinIO (S3-compatible, Docker) |
| Rich text editor | Tiptap v3 |
| Map | Leaflet + react-leaflet |
| Carousel | Embla Carousel |
| Drag-and-drop | dnd-kit |
| Email | Resend |
| Lightbox | yet-another-react-lightbox |

---

## Directory structure

```
gaphto/
├── src/
│   ├── app/
│   │   ├── (public)/         Public pages (home, about, news, events…)
│   │   ├── (auth)/           Login & register
│   │   ├── (dashboard)/      Admin dashboard (protected — admin/editor/super_admin)
│   │   ├── (member)/         Member centre (protected — member+)
│   │   └── api/              API routes (auth, uploads, payments)
│   ├── components/
│   │   ├── layout/           Header & footer
│   │   ├── home/             Homepage section components
│   │   ├── shared/           Page headers, post cards, block renderer
│   │   ├── dashboard/        Admin UI (sidebar, block editors)
│   │   └── ui/               shadcn/ui primitives
│   ├── data/                 JSON fallback files (populated by db:sync-data)
│   └── lib/
│       ├── data.ts           JSON-only data layer (used client-side/static)
│       ├── server-data.ts    DB-first + JSON fallback (server components)
│       └── db.ts             Drizzle client
├── scraper/                  WordPress content scraper
│   └── src/
│       ├── parse-wxr.ts      WXR XML parser (authoritative)
│       ├── index.ts          REST API scraper orchestrator
│       └── scrape-*.ts       Per-content-type REST scrapers
├── drizzle/
│   ├── schema.ts             Table + enum definitions
│   ├── migrate.ts            Migration runner
│   ├── seed.ts               DB seeder
│   └── migrations/           SQL migration files (0000–0007)
├── infrastructure/
│   ├── docker-compose.yml         Local dev (Postgres + pgAdmin + MinIO)
│   ├── docker-compose.prod.yml    Production (Postgres + MinIO)
│   ├── nginx.conf                 Nginx reverse proxy (incl. /media/ → MinIO)
│   └── ecosystem.config.js        PM2 process config
├── scripts/
│   └── migrate-to-minio.ts        Bulk upload public/images/ → MinIO
└── public/
    └── images/               Static fallback images (logo, legacy scraped assets)
```

---

## Auth & RBAC

Auth is handled by NextAuth v5 with a credentials provider (`src/auth.ts`). Session data includes the user's role.

Route protection is in `src/proxy.ts` (not `src/middleware.ts` — creating that file breaks the Next.js 16 build).

| Role | Access |
|------|--------|
| `super_admin` | Everything |
| `admin` | Dashboard — all content management |
| `editor` | Dashboard — posts, events, gallery |
| `member` | Member centre — profile, courses, fund applications |
| Unauthenticated | Public pages only |

---

## Page builder

The `page_blocks` table stores dynamic page sections as typed JSON blobs. Each block has a `type` field and a `data` JSON field:

| Block type | Renders |
|------------|---------|
| `hero` | Full-width banner with title, subtitle, and CTA |
| `stats_bar` | Key statistics strip |
| `rich_text` | Tiptap HTML content |
| `practice_areas_grid` | Practice area cards grid |
| `news_preview` | Latest posts |
| `leadership_preview` | Leadership member cards |
| `gallery_teaser` | Featured gallery albums |
| `fund_cta` | Fund application call-to-action |
| `image_banner` | Full-width image section |

The block renderer is in `src/components/shared/block-renderer.tsx`.

---

## Hybrid data layer

`src/lib/server-data.ts` tries the database first:

```typescript
// Attempt DB query → fall back to JSON file
async function getPosts(category: string) {
  try {
    return await db.select().from(posts).where(eq(posts.category, category))
  } catch {
    return jsonData[category] ?? []
  }
}
```

This means:
- **With DB:** full CRUD, real-time updates, member-only content
- **Without DB:** read-only static content from JSON files (graceful degradation)
