# TASK BRIEF — Agent 2: Data Scraper
> Read AGENT_CONTEXT.md first for full project context before writing a single line.
> Context file: /home/kelib/Desktop/moreprojects/gaphto/plans/AGENT_CONTEXT.md

---

## YOUR ROLE
You are the **Scraper Agent** for the GAPHTO migration project.
You write and RUN all scraper scripts to extract content from https://www.gaphto.org/
and save the structured output as JSON files + download all images.

---

## DELIVERABLES

### A. Scraper Project Setup
Create a standalone Node.js TypeScript project at:
`/home/kelib/Desktop/moreprojects/gaphto/scraper/`

**`package.json`** — dependencies:
- `axios` — HTTP requests
- `cheerio` — HTML parsing
- `slugify` — generate slugs from titles  
- `fs-extra` — file system helpers
- `p-limit` — concurrency limiter (max 3 parallel requests to be polite)
- devDependencies: `typescript`, `ts-node`, `@types/node`, `@types/cheerio`

**`tsconfig.json`** — standard Node16 config

**`src/utils.ts`** — shared helpers:
- `fetchPage(url: string)` — axios GET with retry (3 attempts, 2s delay), returns HTML string. Add `User-Agent: Mozilla/5.0` header. Add 500ms delay between requests.
- `saveJson(filename: string, data: unknown)` — writes to `output/filename.json`
- `downloadImage(url: string, localPath: string)` — streams image to disk, returns local path. Skip if file already exists.
- `toSlug(text: string)` — slugify wrapper

### B. Scraper Scripts (all in `src/`)

---

#### `scrape-leadership.ts`
**Target:** https://www.gaphto.org/leadership/

Parse the leadership page. For each executive, extract:
- Full name
- Role/title
- Profile image URL (if present)
- Facebook URL (if present)
- Bio text (if present)
- Assign sortOrder based on DOM order

Download each profile image to `scraped-assets/leadership/`
Save output to `output/leadership.json` (array matching schema in AGENT_CONTEXT.md)

---

#### `scrape-news.ts`
**Targets:**
- https://www.gaphto.org/gaphto-news/ (category: `gaphto-news`)
- https://www.gaphto.org/health-news/ (category: `health-news`)
- https://www.gaphto.org/blog/ (category: `blog`)

For each category:
1. Fetch the listing page, extract article links + titles + dates + excerpts
2. Check for next page link (`/page/2/`, `/page/3/`, etc.) — follow until no next page
3. For each article URL, fetch the full article and extract:
   - title, slug (from URL), content (article body HTML), excerpt, date, author, featured image URL, tags
4. Download featured images to `scraped-assets/posts/`

Save output:
- `output/news.json` — gaphto-news articles
- `output/health-news.json` — health-news articles
- `output/blog.json` — blog articles

---

#### `scrape-about.ts`
**Targets:**
- https://www.gaphto.org/about-us/background/
- https://www.gaphto.org/about-us/aims-objectives/

Extract:
- Full page content HTML (main article/entry-content area only, not nav/footer)
- From aims page: parse vision statement, mission statement, and list of objectives as separate fields

Save output: `output/about.json` (schema in AGENT_CONTEXT.md)

---

#### `scrape-practice-areas.ts`
**Targets:**
- https://www.gaphto.org/disease-control-prevention/
- https://www.gaphto.org/health-information-management/
- https://www.gaphto.org/nutrition/

For each page extract title, main content HTML, and any listed professional roles (look for list items that describe job titles).

Save output: `output/practice-areas.json` (array, schema in AGENT_CONTEXT.md)

---

#### `scrape-gallery.ts`
**Target:** https://www.gaphto.org/gallery/

1. Parse the gallery page to find album sections
2. For each album: extract title, event date (if present), and all image URLs + captions
3. Navigate to any paginated gallery pages
4. Download all images to `scraped-assets/gallery/<album-slug>/`

Save output: `output/gallery.json` (schema in AGENT_CONTEXT.md)

---

#### `scrape-events.ts`
**Targets:**
- https://www.gaphto.org/cpd-registration/
- Any other event URLs found while scraping news

Extract event details: title, description, location, isOnline, dates, price, status.
A past event with an expired date → status = `past`.

Save output: `output/events.json`

---

#### `scrape-contact.ts`
**Target:** https://www.gaphto.org/contact-us/

Extract all contact details as structured data. Also check the footer on the homepage for any additional info.

Save output: `output/contact.json` (schema in AGENT_CONTEXT.md)

---

#### `scrape-fund.ts`
**Target:** https://www.gaphto.org/gaphto-fund/

Extract fund description content and any PDF download link.
If PDF link found, download to `scraped-assets/documents/gaphto-fund.pdf`

Save output: `output/fund.json` — `{ description: "HTML", pdfUrl: "string | null", localPdf: "string | null" }`

---

#### `index.ts` — Master runner
Runs all scrapers in sequence. Catches errors per scraper so one failure doesn't stop others.
Print a final report: which scrapers succeeded/failed and how many items each collected.

---

### C. ACTUALLY RUN THE SCRAPERS
After writing all the files:
1. `cd /home/kelib/Desktop/moreprojects/gaphto/scraper && npm install`
2. `npx ts-node src/index.ts`
3. Verify JSON files exist in `output/` with non-empty content
4. Report how many items were scraped per category

---

## CONSTRAINTS
- Respect the site: max 3 concurrent requests, 500ms delay between requests
- Do NOT scrape any page that returned 404 in AGENT_CONTEXT.md > Known 404 pages
- Do NOT attempt to log in or access gated content
- If a page fails to load after 3 retries, log a warning and skip — don't crash
- Image downloads: skip if already exists (idempotent)
- All JSON output MUST conform to the schemas in AGENT_CONTEXT.md > JSON OUTPUT SCHEMAS

---

## WHEN DONE
1. Update the STATUS LOG table in AGENT_CONTEXT.md:
   - Change Agent 2 row status from `PENDING` to `DONE`
   - In Notes: list item counts per JSON file (e.g. "news: 43, leadership: 12, gallery: 2 albums / 122 images")
2. Create `/home/kelib/Desktop/moreprojects/gaphto/plans/SCRAPE_REPORT.md` with:
   - Run date/time
   - Items collected per content type
   - Any pages that failed or were skipped
   - List of all output JSON files and their sizes
   - List of all downloaded images (count by folder)

---

## SUCCESS CRITERIA
- All 8 scraper scripts exist and are syntactically valid TypeScript
- `npm install` completes without errors
- `npx ts-node src/index.ts` runs to completion
- At minimum: `leadership.json` has 12 items, `news.json` has 40+ items, `gallery.json` has 2 albums
- All images referenced in JSON files are present in `scraped-assets/`
- SCRAPE_REPORT.md is written
