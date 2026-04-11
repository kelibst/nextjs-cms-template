# Task: Agent B — Image Recovery for 12 Posts + Slug Bug Fix

**Read first:** `plans/AGENT_CONTEXT.md` → "ACTIVE SPRINT" section
**Working directory:** `/home/kelib/Desktop/moreprojects/gaphto`
**Package manager:** `bun` always

---

## Background

28% of posts (12 of 43) have `featuredImage: null` and `localImage: null`. Their exact slugs are in AGENT_CONTEXT.md → "Confirmed missing posts".

**Root cause:** The WordPress REST API `_embed` response returned no featured media for these posts, and the fallback content-scan regex found no images in their HTML body either.

**Recovery lever:** `scraper/output/media-all.json` contains 153 media items. Each item has a `post` field — the WordPress parent post ID. If a post's WP ID matches a media item's `post` field, that image can be used as the featured image.

**Second issue:** One blog post has slug `<![CDATA[]]>` — this is a CDATA parsing bug in `scraper/src/parse-wxr.ts` where the slug field wasn't properly stripped of CDATA wrappers.

---

## Sub-task B1 — Investigate the 12 missing posts in the JSON files

Before writing any code, do a data investigation:

1. **Read `scraper/output/news.json`** — for each of the 4 missing gaphto-news slugs, find the entry and record its WordPress post `id` field (if present). Note whether the `content` field has any `<img` tags.

2. **Read `scraper/output/health-news.json`** — same for the 7 missing health-news posts.

3. **Read `scraper/output/blog.json`** — find the entry with the `<![CDATA[]]>` slug issue.

4. **Read `scraper/output/media-all.json`** — for each WordPress post ID found in step 1/2, search for media items where `post` matches. Record which posts have media in the index.

Report your findings in a comment at the top of your work before making any edits. This tells us whether the images can be recovered or were genuinely never uploaded.

---

## Sub-task B2 — Fix the CDATA slug bug in parse-wxr.ts

**File:** `scraper/src/parse-wxr.ts`

Read the file and find the function that extracts the slug from each WXR `<item>`. The `<wp:post_name>` field contains the slug. If the parsing extracts it including CDATA wrappers (`<![CDATA[` and `]]>`), the result is literally the string `<![CDATA[]]>` for empty/missing slugs.

**Fix:** Ensure that wherever `<wp:post_name>` is extracted, CDATA wrappers are stripped. Check the `cdata()` helper function — is it being called for the slug field? If not, apply the same stripping logic.

Also: if the slug is empty after stripping, fall back to generating a slug from the post title (use `title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')`).

---

## Sub-task B3 — Implement image recovery in the output JSON files

**ONLY do this if Sub-task B1 confirms that matching media items exist in media-all.json for the missing posts.**

There are two approaches — use whichever the codebase better supports:

**Option A (preferred if posts have a WP post ID in their JSON):**
Write a small standalone script `scraper/src/recover-images.ts` that:
1. Reads `scraper/output/news.json`, `health-news.json`, `blog.json`
2. Reads `scraper/output/media-all.json`
3. For each post where `featuredImage` is null, looks up media items by matching `media.post === post.wpId` (or whatever the ID field is called)
4. If a match is found, sets `featuredImage` to `media.source_url` and downloads it via `downloadImage()` from `scraper/src/utils.ts`
5. Sets `localImage` to the download path
6. Writes the updated JSON back to `scraper/output/`

Add a script to root `package.json`: `"scrape:recover": "cd scraper && bun src/recover-images.ts"`

**Option B (fallback if post IDs are not in the JSON):**
Add a recovery pass directly inside `scraper/src/scrape-news.ts` `scrapeNews()` — after all posts are processed, iterate posts with null `featuredImage`, try to find a matching media item by WP post ID from the API response (which does include the post ID).

**Check which option applies** by reading the JSON post objects to see if a `wpId` or `id` field exists.

---

## Files to potentially modify

| File | Change |
|------|--------|
| `scraper/src/parse-wxr.ts` | Fix CDATA slug extraction (Sub-task B2) |
| `scraper/src/recover-images.ts` | New script for image recovery (Sub-task B3, Option A) |
| `package.json` (root) | Add `scrape:recover` script if Option A |
| `readme/SCRAPER.md` | Add note about the recover script under "Known Issues" |

**Do NOT touch:** `scrape-via-rest-api.ts`, `src/` app files, `drizzle/` files.

---

## Verification

1. After the CDATA fix — grep `scraper/output/blog.json` for `CDATA` — should return nothing.
2. After image recovery — re-read `scraper/output/news.json` and `health-news.json` — confirm the 12 posts now have non-null `featuredImage` values (where media was found in the index).
3. Check `scraped-assets/` for the newly downloaded image files.
4. Do NOT run `db:seed` — that's the user's job after review.

---

## When done

Append to `plans/AGENT_CONTEXT.md` → "Agent Work Log":
```
### Agent B — Image recovery + slug fix — 2026-04-11 — DONE/BLOCKED
- B1 investigation result: [X of 12 posts had matching media in media-all.json]
- B2: Fixed CDATA slug bug in parse-wxr.ts line [N]
- B3: [Created recover-images.ts / Not implemented because: reason]
- Updated readme/SCRAPER.md
- Posts still without images after recovery: [list slugs]
```
