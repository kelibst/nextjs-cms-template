# GAPHTO Project — Shared Agent Context
> This file is the single source of truth for all agents working on this project.
> Agents MUST update the STATUS section when they complete work.

---

## PROJECT SUMMARY
Migrating **gaphto.org** (WordPress + WooCommerce + CiviCRM) to a modern stack:
- **Frontend/API:** Next.js 16, TypeScript, Shadcn/ui, Tailwind CSS
- **Database:** PostgreSQL (via Docker), Drizzle ORM
- **Auth:** NextAuth.js v5
- **Current Phase:** Phase 0 — Infrastructure + Data Scraping

---

## WORKING DIRECTORY
```
/home/kelib/Desktop/moreprojects/gaphto/
├── plans/
│   ├── migration-plan.md      ← Full project plan (READ THIS)
│   ├── AGENT_CONTEXT.md       ← THIS FILE
│   ├── TASK_AGENT_1.md        ← Infrastructure agent task brief
│   └── TASK_AGENT_2.md        ← Scraper agent task brief
├── scraper/                   ← Agent 2 creates this
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── scrape-news.ts
│   │   ├── scrape-leadership.ts
│   │   ├── scrape-gallery.ts
│   │   ├── scrape-about.ts
│   │   ├── scrape-events.ts
│   │   ├── scrape-contact.ts
│   │   ├── scrape-fund.ts
│   │   └── download-images.ts
│   └── output/                ← JSON output files land here
│       ├── news.json
│       ├── health-news.json
│       ├── blog.json
│       ├── leadership.json
│       ├── gallery.json
│       ├── about.json
│       ├── events.json
│       └── contact.json
├── scraped-assets/            ← Downloaded images land here
│   ├── gallery/
│   ├── leadership/
│   └── posts/
├── infrastructure/            ← Agent 1 creates this
│   ├── docker-compose.yml
│   └── .env.example
└── drizzle/                   ← Agent 1 creates this
    ├── schema.ts
    ├── migrate.ts
    ├── seed.ts
    └── drizzle.config.ts
```

---

## TARGET WEBSITE
- **URL:** https://www.gaphto.org/
- **Platform:** WordPress (confirmed via /wp-login.php)
- **Sitemap:** https://www.gaphto.org/sitemap.xml

### Pages to Scrape
| Content          | URL Pattern                          | Notes                              |
|------------------|--------------------------------------|------------------------------------|
| Leadership       | /leadership/                         | 12 executives, structured HTML     |
| GAPHTO News      | /gaphto-news/ + /gaphto-news/page/N/ | 43+ articles, paginated            |
| Health News      | /health-news/ + /health-news/page/N/ | ~15 articles                       |
| Blog             | /blog/ + /blog/page/N/               | ~20+ posts                         |
| About Background | /about-us/background/                | Static page                        |
| About Aims       | /about-us/aims-objectives/           | Static page, has 6 objectives      |
| Disease Control  | /disease-control-prevention/         | Practice area page                 |
| Health Info Mgmt | /health-information-management/      | Practice area page                 |
| Nutrition        | /nutrition/                          | Practice area page                 |
| Contact          | /contact-us/                         | Extract structured contact info    |
| GAPHTO Fund      | /gaphto-fund/                        | Fund overview + PDF link           |
| Gallery          | /gallery/ + individual album pages   | Images, captions, album names      |
| Events           | /cpd-registration/                   | Event details (even if expired)    |

### Known 404 pages (skip these)
/about-us/, /the-media/, /member-centre/, /nominations-open/, /gaphto-journal/,
/member-forum/, /career-guidance/, /events/, /accounts/, /privacy-policy/

---

## DATABASE SCHEMA (Summary)
Full SQL in migration-plan.md Section 4. Tables:
- `users` (id, email, password_hash, name, role)
- `posts` (id, slug, title, content, excerpt, category, status, featured_image, author_id, published_at)
- `tags` + `post_tags`
- `events` (id, title, slug, description, location, is_online, start_date, price_ghs, status)
- `event_registrations`
- `leadership` (id, name, role, image_url, bio, facebook_url, sort_order, is_active)
- `gallery_albums` + `gallery_images`
- `publications`
- `members` (id, user_id, member_number, specialty, region, facility, membership_status)
- `announcements`
- `contact_submissions`

---

## JSON OUTPUT SCHEMAS (Agent 2 must conform to these)

### posts (news, health-news, blog)
```json
{
  "slug": "string",
  "title": "string",
  "content": "string (HTML)",
  "excerpt": "string",
  "date": "YYYY-MM-DD",
  "category": "gaphto-news | health-news | blog",
  "author": "string",
  "featuredImage": "string (original URL)",
  "localImage": "string (path under scraped-assets/)",
  "tags": ["string"],
  "sourceUrl": "string"
}
```

### leadership
```json
{
  "name": "string",
  "role": "string",
  "imageUrl": "string (original URL)",
  "localImage": "string (path under scraped-assets/leadership/)",
  "bio": "string | null",
  "facebookUrl": "string | null",
  "sortOrder": "number"
}
```

### gallery
```json
{
  "albumTitle": "string",
  "albumSlug": "string",
  "eventDate": "YYYY-MM-DD | null",
  "images": [
    {
      "url": "string (original URL)",
      "localPath": "string (scraped-assets/gallery/album-slug/filename)",
      "caption": "string | null",
      "sortOrder": "number"
    }
  ]
}
```

### about
```json
{
  "background": "string (HTML content)",
  "aimsObjectives": "string (HTML content)",
  "vision": "string",
  "mission": "string",
  "objectives": ["string"]
}
```

### contact
```json
{
  "phone": "string",
  "email": "string",
  "address": "string",
  "facebook": "string",
  "twitter": "string",
  "youtube": "string"
}
```

### events
```json
{
  "title": "string",
  "slug": "string",
  "description": "string (HTML)",
  "location": "string | null",
  "isOnline": "boolean",
  "startDate": "ISO 8601 | null",
  "endDate": "ISO 8601 | null",
  "priceGhs": "number",
  "status": "upcoming | past | cancelled",
  "featuredImage": "string | null",
  "sourceUrl": "string"
}
```

### practiceAreas
```json
[
  {
    "slug": "disease-control-prevention",
    "title": "string",
    "content": "string (HTML)",
    "roles": ["string"]
  }
]
```

---

## ROLES & PERMISSIONS (for Drizzle seed + future auth)
```
super_admin → admin → editor → member → public
```
The seed script should create one user per role for testing:
- superadmin@gaphto.org / password: Test1234!
- admin@gaphto.org / password: Test1234!
- editor@gaphto.org / password: Test1234!
- member@gaphto.org / password: Test1234!

---

## DOCKER / ENV
```
DATABASE_URL="postgresql://gaphto:gaphto_secret@localhost:5432/gaphto"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

---

## AGENT STATUS LOG
> Agents update this section when tasks are complete.

| Agent | Task | Status | Notes |
|-------|------|--------|-------|
| Agent 1 | Infrastructure (docker, drizzle schema, seed) | DONE | infrastructure/docker-compose.yml, infrastructure/.env.example, drizzle/schema.ts, drizzle/drizzle.config.ts, drizzle/migrate.ts, drizzle/seed.ts, package.json |
| Agent 2 | Scraper scripts + run scrape | DONE | REST API: 12 gaphto-news, 10 health-news, 20 blog posts. HTML pages (leadership, gallery, contact, about, events, fund, practice-areas) return 403 — site blocks direct HTML scraping. Images also 403. All 8 scrapers resilient and completed. |
| Agent 2 | REST API deep scrape (Phase 2) | DONE | Via wp-json/wp/v2: leadership.json (12 members, all with images), gallery.json (2 albums: 2017 AGC 12 images + 2016 AGC 16 images), about.json (background + vision + mission + 6 objectives), contact.json (email + facebook), fund.json (PDF link), practice-areas.json (3 areas), media-all.json (153 items), events.json (4 events). 28 gallery images + 12 leadership photos downloaded to scraped-assets/. Scraper: src/scrape-via-rest-api.ts |
