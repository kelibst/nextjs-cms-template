# Database

PostgreSQL 16, managed with [Drizzle ORM](https://orm.drizzle.team). Schema defined in `drizzle/schema.ts`, migrations in `drizzle/migrations/`.

---

## Commands

```bash
bun run db:up        # start PostgreSQL container (local dev, port 5434)
bun run db:down      # stop container
bun run db:generate  # generate a new migration file after schema changes
bun run db:migrate   # apply pending migrations
bun run db:seed      # populate DB from scraper/output/*.json
```

---

## Tables

### Content

| Table | Description |
|-------|-------------|
| `posts` | News articles and blog posts. Category: `gaphto-news`, `health-news`, `blog`, `announcement`. Status: `draft`, `published`, `archived`. |
| `tags` + `post_tags` | Many-to-many tag system for posts. |
| `events` | Events with start/end dates, location, price in GHS, status (`upcoming`, `ongoing`, `past`, `cancelled`). |
| `leadership` | Executive committee members — name, role, photo, bio, social links, term dates. |
| `gallery_albums` | Photo album containers with title, slug, and optional event date. |
| `gallery_images` | Individual photos belonging to an album. URL, caption, sort order. |
| `publications` | Downloadable documents and PDFs with file type, year, and member-only flag. |
| `announcements` | Pinned site-wide alerts with optional expiry date. |

### System

| Table | Description |
|-------|-------------|
| `site_settings` | Key-value store for page content blobs. Keys: `contact`, `pages`, `about`, `practice-areas`, `fund`. |
| `contact_submissions` | Messages submitted through the contact form. |

### Users & Auth

| Table | Description |
|-------|-------------|
| `users` | Auth accounts. Roles: `super_admin`, `admin`, `editor`, `member`. Bcrypt-hashed passwords. |
| `members` | Extended member profile — specialty, region, GeoJSON location. Linked to `users`. |
| `email_preferences` | Per-user opt-in flags for newsletters and event notifications. |

### Events & Learning

| Table | Description |
|-------|-------------|
| `event_registrations` | Event sign-ups with payment status tracking. |
| `fund_applications` | Loan/grant applications with review workflow. |
| `courses` | CPD course catalogue with level, instructor, and published status. |
| `lessons` | Individual lessons within a course, ordered and with rich-text content. |
| `course_enrollments` | Which users are enrolled in which courses. |
| `lesson_completions` | Per-user, per-lesson completion tracking. |
| `newsletters` | Newsletter drafts and sent records with recipient count. |

### Page Builder

| Table | Description |
|-------|-------------|
| `page_blocks` | Dynamic page sections (hero, stats_bar, rich_text, practice_areas_grid, news_preview, leadership_preview, gallery_teaser, fund_cta, image_banner). Stored as typed JSON blobs with sort order. |

### Media Storage

| Table | Description |
|-------|-------------|
| `media_files` | Tracks every file uploaded to MinIO. Stores the object key, bucket, filename, original name, MIME type, file size, optional dimensions, uploader, and upload timestamp. Soft-deleted via `deleted_at`. |

---

## Seeding sequence

`drizzle/seed.ts` reads from `scraper/output/*.json` and inserts in this order:

1. **Users** — 4 test accounts (superadmin, admin, editor, member), all password `Test1234!`
2. **Leadership** — from `leadership.json` → `leadership` table
3. **Posts** — `news.json` → gaphto-news, `health-news.json` → health-news, `blog.json` → blog
4. **Gallery** — `gallery.json` → `gallery_albums` then nested `gallery_images`
5. **Events** — `events.json` → `events`
6. **Contact** — `contact.json` → `site_settings` key `contact`
7. **Pages** — `pages.json` → `site_settings` key `pages`
8. **About** — `about.json` → `site_settings` key `about`
9. **Practice Areas** — `practice-areas.json` → `site_settings` key `practice-areas`
10. **Fund** — `fund.json` → `site_settings` key `fund`
11. **Publications** — `publications.json` → `publications`

All inserts use `onConflictDoNothing()` — safe to re-run.

### Expected seed counts

```
users                        4
leadership                   0   ← see Known Issues below
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
```

---

## Migrations

11 migration files exist in `drizzle/migrations/` (`0000` → `0010`). They are applied in order by `bun run db:migrate` and are tracked in the `drizzle.__drizzle_migrations` table.

To add a column or table:
1. Edit `drizzle/schema.ts`
2. `bun run db:generate` — creates a new migration file
3. `bun run db:migrate` — applies it

Never edit migration files manually after they've been applied.

---

## Known Issues

### `leadership` table is empty after seeding

`scraper/output/leadership.json` contains an empty array. The WXR parser's TMM leadership extraction (`extractLeadership()` in `scraper/src/parse-wxr.ts`) produced no output. The seed silently skips the insert.

See [SCRAPER.md](./SCRAPER.md#known-issues) for investigation steps and workaround.
