# Task: Agent A — Scraper Auth (WordPress Application Password)

**Read first:** `plans/AGENT_CONTEXT.md` → "ACTIVE SPRINT" section
**Working directory:** `/home/kelib/Desktop/moreprojects/gaphto`
**Package manager:** `bun` always

---

## Background

`scraper/src/scrape-via-rest-api.ts` has a `fetchAllMedia()` function that calls the WordPress.com REST API `/media` endpoint with no authentication. This endpoint returns 401 without credentials. WordPress Application Passwords (available in WordPress.com → Security → Application Passwords) allow REST API access via HTTP Basic auth.

The fix is narrow: inject one `Authorization: Basic <base64>` header into the right places. Nothing else changes.

**`scrape-news.ts` is NOT affected** — it uses `_embed=true` on the posts endpoint which bundles media without needing auth. Do not touch `scrape-news.ts`.

---

## Files to modify

| File | Change |
|------|--------|
| `scraper/src/scrape-via-rest-api.ts` | Add auth header to `apiGet()` function; read from env |
| `.env.example` | Add `WP_USERNAME` and `WP_APP_PASSWORD` placeholder vars |
| `readme/SCRAPER.md` | Add a note under a new "Authentication" section explaining the app password setup |

**Do NOT touch:** `scrape-news.ts`, `parse-wxr.ts`, `utils.ts`, any src/ files, any drizzle/ files.

---

## Implementation

### Step 1 — Read the file first
Read `scraper/src/scrape-via-rest-api.ts` in full before editing. Find the `apiGet()` function (or wherever axios is called with headers).

### Step 2 — Add auth to apiGet()
The `Authorization` header should only be added when `WP_USERNAME` and `WP_APP_PASSWORD` are both set in the environment. If either is missing, the scraper continues without auth (graceful degradation — public endpoints still work).

Pattern:
```typescript
const authHeader = process.env.WP_USERNAME && process.env.WP_APP_PASSWORD
  ? {
      Authorization: `Basic ${Buffer.from(
        `${process.env.WP_USERNAME}:${process.env.WP_APP_PASSWORD}`
      ).toString('base64')}`,
    }
  : {}

// Then spread into headers:
headers: {
  'User-Agent': '...',
  ...authHeader,
}
```

### Step 3 — Update .env.example
Read `.env.example` first, then append at the bottom:
```
# ── WordPress Scraper Authentication ──────────────────────────────
# Required to fetch private media via the WordPress.com REST API.
# Generate in: WordPress.com → My Profile → Security → Application Passwords
WP_USERNAME=
WP_APP_PASSWORD=
```

### Step 4 — Update readme/SCRAPER.md
Read `readme/SCRAPER.md` first. Add a new section "## Authentication" between "## Two scraper modes" and "## Image downloads":

Explain: the `/media` endpoint requires auth; generate an Application Password at WordPress.com → Security → Application Passwords; add `WP_USERNAME` and `WP_APP_PASSWORD` to `.env`; the scraper will include the header automatically.

---

## Verification

1. Check that the env vars are optional — the scraper should NOT crash if they're missing, it should just skip auth (log a warning is fine).
2. Confirm `fetchAllMedia()` is the only function that calls the `/media` endpoint — check for any other axios calls in that file that hit protected endpoints.
3. Do NOT run the scraper — the user doesn't have app password credentials yet. Just confirm the code is correct.

---

## When done

Append to `plans/AGENT_CONTEXT.md` → "Agent Work Log":
```
### Agent A — Auth fix (scrape-via-rest-api.ts) — 2026-04-11 — DONE
- Added auth header to apiGet() in scraper/src/scrape-via-rest-api.ts
- Updated .env.example with WP_USERNAME + WP_APP_PASSWORD
- Updated readme/SCRAPER.md with Authentication section
- Auth is optional: scraper works without credentials, adds header only when both vars set
```
