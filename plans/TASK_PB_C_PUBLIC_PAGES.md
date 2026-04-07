# Page Builder — Phase C: Public Page Integration

## Your Role
You are the sole agent for Phase C. Your job is to update the public-facing homepage and about page to **render their content from the `pageBlocks` database table** instead of hardcoded JSON. Blocks must render in `sortOrder` order, and invisible blocks must be skipped.

---

## MANDATORY FIRST STEP
Read `plans/AGENT_CONTEXT.md` — critical rules.

---

## Reference Files to Read First

1. `src/app/(public)/page.tsx` — current homepage (uses JSON data)
2. `src/app/(public)/about/page.tsx` — current about page (uses JSON data)
3. `src/app/actions/blocks.ts` — `getPageBlocks(page: string)` action
4. `src/lib/blocks.ts` — all content types + `parseBlockContent<T>()` helper
5. `src/data/about.json` — fallback data
6. `src/lib/data.ts` — existing data loaders (getAbout, getAllPosts, getEvents, etc.)

The homepage components are in `src/components/home/` — read the ones you'll need to pass new props to.

---

## Core Concept

The public pages currently hardcode their section content. After Phase C they will:
1. Fetch all blocks for the page from DB
2. Render each visible block (isVisible = true) in sortOrder order
3. Map each block `type` to the appropriate existing React component
4. Fall back to JSON defaults if the DB has no blocks (e.g. fresh local install with no seed)

The existing section components (HeroCarousel, StatsBar, etc.) already accept optional props from Phase 5. The goal is to pass them block content from the DB.

---

## Task 1: Update `src/lib/data.ts`

Add a new exported async function at the bottom:

```typescript
export async function getBlocksForPage(page: string) {
  const { getPageBlocks } = await import('@/app/actions/blocks')
  const blocks = await getPageBlocks(page)
  return blocks.filter(b => b.isVisible).sort((a, b) => a.sortOrder - b.sortOrder)
}
```

**Why dynamic import?** Same reason `getContentMap` was — avoids making the whole data.ts file a server boundary. (If this causes issues, inline the DB call directly using `db.select()` pattern from `src/lib/db.ts` instead.)

---

## Task 2: Update `src/app/(public)/page.tsx` (Homepage)

Read the current file first.

The homepage renders these section components in order:
1. `HeroCarousel`
2. `StatsBar`
3. `NewsPreview`
4. `EventsPreview`
5. `PracticeAreas`
6. `LeadershipPreview`
7. `GalleryTeaser`
8. `AboutSection`
9. `FundCta`

**New approach:** Fetch blocks from DB, then for each visible block, render the matching component with block content as props. Blocks that don't exist or are invisible are skipped.

```typescript
// At the top of the function:
const homepageBlocks = await getBlocksForPage('homepage')

// Helper to find block content by type:
function getBlock(type: string) {
  return homepageBlocks.find(b => b.type === type)
}
```

**For each component:**

- `HeroCarousel`: Find block `type='hero'`. Parse as `HeroContent`. Pass `heroTitle` and `heroSubtitle` props. If no hero block, use existing hardcoded defaults (component already has them).
  ```typescript
  const heroBlock = getBlock('hero')
  const heroContent = heroBlock ? parseBlockContent<HeroContent>(heroBlock.content, { title: '', subtitle: '' }) : null
  // Pass: heroTitle={heroContent?.title} heroSubtitle={heroContent?.subtitle}
  // HeroCarousel already has these optional props from Phase 5 agents
  ```

- `StatsBar`: Find block `type='stats_bar'`. Parse as `StatsBarContent`. Pass individual stat props OR update StatsBar to accept a `stats` array prop.
  - Read `src/components/home/stats-bar.tsx` first — it has 8 individual props from Phase 5 work
  - Preferred: map `StatsBarContent.items` to the 8 individual props (items[0] → membersCount/membersLabel, etc.)
  - If the individual props are messy, add a `stats?: {count: string; suffix: string; label: string}[]` prop instead

- `NewsPreview`: Find block `type='news_preview'`. Parse as `NewsPreviewContent`. Pass `heading` prop.

- `EventsPreview`: Find block `type='events_preview'`. Same.

- `PracticeAreas`: Find block `type='practice_areas_grid'`. Parse as `PracticeAreasContent`. Pass `heading` prop AND `items` if the component accepts them (check the component first — if it doesn't accept items yet, just pass the heading).

- `LeadershipPreview`: Find block `type='leadership_preview'`. Pass `heading` prop.

- `GalleryTeaser`: Find block `type='gallery_teaser'`. Pass `heading` prop.

- `AboutSection`: Find block `type='rich_text'` (there may be multiple — find the one for the about section, or use a dedicated `about_section` type). For now, just pass `heading` prop.

- `FundCta`: Find block `type='fund_cta'`. Parse as `FundCtaContent`. Pass `heading` and `subtitle` props.

**Block visibility — skip invisible blocks:**
If a block is not found (not in DB) or `isVisible = false`, render `null` for that section (the component is skipped entirely). This lets admins hide sections.

**Fallback:** If `homepageBlocks` is empty (no blocks in DB), render all sections with their hardcoded defaults — same as current behavior.

```typescript
const hasBlocks = homepageBlocks.length > 0
```

---

## Task 3: Update `src/app/(public)/about/page.tsx` (About Page)

Similar approach. About blocks in DB:
- `sortOrder 0`: `rich_text` — Background
- `sortOrder 1`: `rich_text` — Vision & Mission (heading = 'Vision & Mission', body has both)
- `sortOrder 2`: `objectives_list` — Aims & Objectives
- `sortOrder 3`: `practice_areas_grid` — Areas of Practice
- `sortOrder 4`: `timeline` — Our History

Read the current file. It uses `getAbout()` for vision/mission/background/objectives, and hardcoded arrays for TIMELINE and PRACTICE_AREAS.

**New approach:**
```typescript
const aboutBlocks = await getBlocksForPage('about')

function getBlock(type: string, heading?: string) {
  if (heading) return aboutBlocks.find(b => b.type === type && JSON.parse(b.content)?.heading === heading)
  return aboutBlocks.find(b => b.type === type)
}
```

**For each section:**

- **Background**: Find `rich_text` block with heading `'Background'`. Parse as `RichTextContent`. Use `block.content.body` as the background HTML (run through `sanitizeHtml` if it's already used in the page). If no block, fall back to `getAbout().background`.

- **Vision & Mission**: Find `rich_text` block with heading `'Vision & Mission'`. Parse body as HTML. If no block, fall back to `getAbout().vision` and `getAbout().mission`.

- **Objectives**: Find `objectives_list` block. Parse as `ObjectivesContent`. Use `block.content.items` array. If no block, fall back to `getAbout().objectives`.

- **Practice Areas**: Find `practice_areas_grid` block. Parse as `PracticeAreasContent`. Use `block.content.items`. If no block, use current `PRACTICE_AREAS` hardcoded constants.

- **Timeline**: Find `timeline` block. Parse as `TimelineContent`. Use `block.content.items`. If no block, use current `TIMELINE_DEFAULTS` constants.

Keep `TIMELINE_DEFAULTS` and `PRACTICE_AREAS_DEFAULTS` constants in the file as fallbacks — do not remove them.

---

## Task 4: Verify Block Rendering Completeness

After updating the pages, run the dev server and check:
1. Homepage loads without error — all 9 sections visible
2. About page loads without error — all sections visible
3. Check console for any JSON parse errors

---

## Important Constraints

- Do NOT remove any existing hardcoded fallback constants (TIMELINE, PRACTICE_AREAS) — they're the safety net
- Do NOT break `getAllPosts()`, `getEvents()`, `getLeadership()` etc. — these still load from JSON/DB as before
- The existing component props added by Phase 5 agents (heroTitle, heroSubtitle, heading, etc.) should still work — you're just populating them from blocks now
- Always use `parseBlockContent<T>(block.content, defaultValue)` from `src/lib/blocks.ts` — never raw `JSON.parse`
- Read every component before passing new props to it — don't assume prop names

---

## Completion Report

Report:
1. Files modified
2. How block visibility is handled (what happens when a block is invisible vs missing)
3. How fallbacks work (empty DB scenario)
4. Any components that needed new props added
5. Build passes (0 errors)
6. Dev server runs without console errors
