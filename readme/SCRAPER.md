# Data Scraper

The `scraper/` directory migrates all content from the association's previous WordPress.com site at `www.gaphto.org`.

---

## Why not scrape HTML?

WordPress.com returns **403** for all bot HTML requests to `www.gaphto.org`. Two access paths remain open:

| Access path | What it reaches |
|-------------|----------------|
| WordPress.com REST API (`public-api.wordpress.com/wp/v2/sites/www.gaphto.org`) | Published posts only — plugin data (leadership, publications, gallery) is inaccessible |
| WordPress XML export (WXR file) | **Everything** — all post types, all 14 years of history, PHP-serialized plugin data |

**The XML export is the authoritative source. Always use `bun run scrape:xml`.**

---

## Two scraper modes

### `bun run scrape:xml` — Recommended

Parses `scraper/gaphto.WordPress.2026-04-10.xml` (37 MB, 14 years of content).

Entry point: `scraper/src/parse-wxr.ts`

Extracts:

| Data | Output file | Count |
|------|-------------|-------|
| Posts (all categories) | `news.json`, `health-news.json`, `blog.json` | 43 + 7 drafts |
| Pages | `pages.json` | 68 |
| Leadership (TMM plugin) | `leadership.json` | 12 members (⚠ currently empty — see Known Issues) |
| Publications (wpdmpro) | `publications.json` | 18 documents |
| Gallery albums + images | `gallery.json` | ~38 albums, ~364 images |
| Events (MEP plugin) | `events.json` | ~5 |
| All media | `media-all.json` | 154 attachments |

Also downloads all referenced images from `www.gaphto.org/wp-content/uploads/` to `scraped-assets/` via the Photon CDN (see Image Downloads below).

### `bun run scrape` — REST API only (limited)

Entry point: `scraper/src/index.ts` → orchestrates individual scrapers in `scraper/src/scrape-*.ts`.

Only reaches published posts and public page content via the WordPress.com REST API. Does **not** retrieve leadership, publications, or gallery data. Use this only if the XML export is unavailable.

---

## Authentication

The WordPress.com REST API `/media` endpoint returns **401 Unauthorized** without credentials. To fetch all media items, generate a WordPress Application Password and add it to `.env`.

### Setup

1. Log in to WordPress.com → My Profile → Security → Application Passwords
2. Create a new application password (name it e.g. `GAPHTO Scraper`)
3. Copy the generated password (it is shown only once)
4. Add to `.env`:

```
WP_USERNAME=your.wordpress.username
WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
```

The scraper adds the `Authorization: Basic <base64>` header automatically whenever both vars are set. If either var is missing, the scraper continues without auth — public endpoints (posts, pages) still work.

---

## Image downloads

WordPress.com blocks direct image downloads from `www.gaphto.org`. The scraper works around this by rewriting all upload URLs to the Photon CDN:

```
https://www.gaphto.org/wp-content/uploads/2022/01/photo.jpg
→
https://i0.wp.com/www.gaphto.org/wp-content/uploads/2022/01/photo.jpg
```

This rewrite is handled automatically in `scraper/src/utils.ts` → `toWpCdnUrl()` and `downloadImage()`.

Downloaded images are saved to `scraped-assets/` preserving the year/month directory structure:

```
scraped-assets/
├── uploads/
│   ├── 2016/01/
│   ├── 2017/06/
│   └── ...
├── gallery/
│   ├── 2019-annual-general-conference/
│   └── ...
└── posts/
```

After scraping, run `bun run db:sync-data` to copy images into `public/images/`.

---

## Output files

All JSON files go to `scraper/output/`:

| File | Shape | Used by |
|------|-------|---------|
| `news.json` | `Post[]` | seed → `posts` table (category: gaphto-news) |
| `health-news.json` | `Post[]` | seed → `posts` table (category: health-news) |
| `blog.json` | `Post[]` | seed → `posts` table (category: blog) |
| `pages.json` | `Page[]` (tree) | seed → `siteSettings` key `pages` |
| `about.json` | `{ background, vision, mission, objectives }` | seed → `siteSettings` key `about` |
| `contact.json` | `{ address, phone, email, ... }` | seed → `siteSettings` key `contact` |
| `practice-areas.json` | `PracticeArea[]` | seed → `siteSettings` key `practice-areas` |
| `fund.json` | `{ title, description, ... }` | seed → `siteSettings` key `fund` |
| `leadership.json` | `LeadershipMember[]` | seed → `leadership` table |
| `publications.json` | `Publication[]` | seed → `publications` table |
| `gallery.json` | `GalleryAlbum[]` (with nested images) | seed → `galleryAlbums` + `galleryImages` tables |
| `events.json` | `Event[]` | seed → `events` table |
| `media-all.json` | `MediaItem[]` | reference only — not seeded |

---

## Known Issues

### `leadership.json` is empty (`[]`)

The WXR parser's `extractLeadership()` reads the TMM plugin's `_tmm_head` postmeta field which stores leadership data as PHP-serialized arrays. The `php-unserialize` package is installed but the parsing step currently produces no output.

**To investigate:** check `scraper/src/parse-wxr.ts` → `extractLeadership()` and verify:
1. The `tmm` post type item is found in the XML
2. The `_tmm_head` meta key exists and has a value
3. `php-unserialize` correctly decodes the value

**Workaround:** manually create `scraper/output/leadership.json` from the XML export data and re-run `bun run db:seed`.

---

## Re-running the scraper

The scraper is idempotent — re-running overwrites the output JSON files but does not duplicate database records (seed uses `onConflictDoNothing()`).

```bash
bun run scrape:xml          # re-parse XML and re-download images
bun run db:sync-data        # copy output to src/data/ and public/images/
bun run db:seed             # re-seed (safe, skips conflicts)
```
