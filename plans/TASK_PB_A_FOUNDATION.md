# Page Builder — Phase A: Foundation

## Your Role
You are the sole agent for Phase A. Your job is purely data-layer work: schema, migration, server actions, type helpers, seed script, and cleanup of the previous CMS attempt. **No UI work.** No dashboard pages. No public page changes beyond reverting cleanup.

---

## MANDATORY FIRST STEP
Read `plans/AGENT_CONTEXT.md` before writing any code — critical rules (middleware, bun, migration commands).

---

## Objective
Establish the `pageBlocks` database table as the foundation for the page builder. By the end of Phase A, `getPageBlocks('homepage')` must return 9 ordered blocks with real default content seeded from the existing JSON data.

---

## Task 1: Clean Up Phase 5 Leftovers

Delete these files completely:
- `src/app/actions/content.ts`
- `src/components/dashboard/homepage-content-form.tsx`
- `src/components/dashboard/about-content-form.tsx`
- `src/app/(dashboard)/dashboard/content/homepage/page.tsx`
- `src/app/(dashboard)/dashboard/content/about/page.tsx`

In `src/lib/data.ts`:
- Remove the `getContentMap()` function and any dynamic import of content actions
- Restore to its original state (JSON-only loaders)

In `src/app/(public)/page.tsx`:
- Remove `getContentMap` import and call
- Restore props to components back to hardcoded defaults (the components already have optional props with fallbacks, so just stop passing the DB values — the defaults kick in)
- The page can remain async if needed but must not break

In `src/app/(public)/about/page.tsx`:
- Remove `getContentMap` / `getPageContent` calls
- Restore `TIMELINE` and `PRACTICE_AREAS` as hardcoded constants from JSON defaults
- Use `getAbout()` (JSON loader) for vision/mission/background/objectives as before

---

## Task 2: Add Schema

Open `drizzle/schema.ts`. Read it fully first. Then add at the bottom:

```typescript
export const blockTypeEnum = pgEnum('block_type', [
  'hero',
  'stats_bar',
  'rich_text',
  'objectives_list',
  'timeline',
  'practice_areas_grid',
  'news_preview',
  'events_preview',
  'leadership_preview',
  'gallery_teaser',
  'fund_cta',
  'image_banner',
])

export const pageBlocks = pgTable('page_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  page: text('page').notNull(),
  type: blockTypeEnum('type').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  content: text('content').notNull().default('{}'),
  isVisible: boolean('is_visible').notNull().default(true),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

Make sure all needed imports are present (`pgEnum`, `boolean` — check what's already imported at the top of schema.ts).

---

## Task 3: Run Migration

```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx drizzle-kit generate --config=drizzle/drizzle.config.ts
bunx tsx drizzle/migrate.ts
```

Verify the migration SQL file was generated in `drizzle/migrations/`.

---

## Task 4: Create `src/lib/blocks.ts`

Type definitions and parse helper. This file has NO DB calls — it's pure types and utilities.

```typescript
// Block content type definitions
export type HeroContent = {
  title: string
  subtitle: string
  imageUrl?: string
}

export type StatsBarContent = {
  items: { count: string; suffix: string; label: string }[]
}

export type RichTextContent = {
  heading?: string
  body: string
}

export type ObjectivesContent = {
  heading: string
  items: string[]
}

export type TimelineContent = {
  heading: string
  items: { year: string; title: string; description: string }[]
}

export type PracticeAreasContent = {
  heading: string
  items: { title: string; description: string }[]
}

export type NewsPreviewContent = { heading: string; count: number }
export type EventsPreviewContent = { heading: string; count: number }
export type LeadershipPreviewContent = { heading: string; count: number }
export type GalleryTeaserContent = { heading: string }
export type FundCtaContent = { heading: string; subtitle: string; buttonText: string }
export type ImageBannerContent = { imageUrl: string; alt: string; caption?: string }

export type BlockContent =
  | HeroContent | StatsBarContent | RichTextContent | ObjectivesContent
  | TimelineContent | PracticeAreasContent | NewsPreviewContent | EventsPreviewContent
  | LeadershipPreviewContent | GalleryTeaserContent | FundCtaContent | ImageBannerContent

// Parse block content JSON safely
export function parseBlockContent<T>(contentJson: string, fallback: T): T {
  try {
    const parsed = JSON.parse(contentJson)
    return parsed as T
  } catch {
    return fallback
  }
}
```

---

## Task 5: Create `src/app/actions/blocks.ts`

Server actions for block CRUD. Follow exact same auth pattern as `src/app/actions/settings.ts`.

```typescript
'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { pageBlocks } from '../../../drizzle/schema'
import { eq, asc, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

function requireAdmin(role: string) {
  if (!['super_admin', 'admin'].includes(role)) throw new Error('Forbidden')
}

// Public — no auth needed
export async function getPageBlocks(page: string) {
  return db
    .select()
    .from(pageBlocks)
    .where(eq(pageBlocks.page, page))
    .orderBy(asc(pageBlocks.sortOrder))
}

// Auth required for all below
export async function upsertBlock(params: {
  id?: string | null
  page: string
  type: string
  content: object
  sortOrder: number
  isVisible?: boolean
}) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  requireAdmin(session.user.role)

  const contentJson = JSON.stringify(params.content)

  if (params.id) {
    await db
      .update(pageBlocks)
      .set({ content: contentJson, sortOrder: params.sortOrder, updatedAt: new Date() })
      .where(eq(pageBlocks.id, params.id))
  } else {
    await db.insert(pageBlocks).values({
      page: params.page,
      type: params.type as any,
      sortOrder: params.sortOrder,
      content: contentJson,
      isVisible: params.isVisible ?? true,
    })
  }

  revalidatePath('/', 'layout')
  revalidatePath('/about')
}

export async function deleteBlock(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  requireAdmin(session.user.role)

  await db.delete(pageBlocks).where(eq(pageBlocks.id, id))
  revalidatePath('/', 'layout')
  revalidatePath('/about')
}

export async function reorderBlocks(blocks: { id: string; sortOrder: number }[]) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  requireAdmin(session.user.role)

  await Promise.all(
    blocks.map(({ id, sortOrder }) =>
      db.update(pageBlocks).set({ sortOrder, updatedAt: new Date() }).where(eq(pageBlocks.id, id))
    )
  )

  revalidatePath('/', 'layout')
  revalidatePath('/about')
}

export async function toggleBlockVisibility(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  requireAdmin(session.user.role)

  const [block] = await db.select().from(pageBlocks).where(eq(pageBlocks.id, id))
  if (!block) throw new Error('Block not found')

  await db
    .update(pageBlocks)
    .set({ isVisible: !block.isVisible, updatedAt: new Date() })
    .where(eq(pageBlocks.id, id))

  revalidatePath('/', 'layout')
  revalidatePath('/about')
}
```

---

## Task 6: Create `src/lib/seed-blocks.ts`

A one-time seeder script. It reads from the existing JSON data files (same data that `src/lib/data.ts` uses) and inserts homepage and about blocks if none exist.

Read `src/data/about.json`, `src/data/practice-areas.json`, `src/data/fund.json` before writing this — use actual field names from those files.

The seed must insert in this order with sortOrder 0–8 for homepage, 0–5 for about:

**Homepage blocks (page = 'homepage'):**
```
sortOrder 0: type 'hero'               content: { title: 'We are the backbone of Public Health in Ghana', subtitle: '...(from about.json mission or a default)...' }
sortOrder 1: type 'stats_bar'          content: { items: [{count:'500', suffix:'+', label:'Members'}, {count:'42', suffix:'+', label:'Years Active'}, {count:'3', suffix:'', label:'Practice Areas'}, {count:'16', suffix:'', label:'Regions'}] }
sortOrder 2: type 'news_preview'       content: { heading: 'Latest News', count: 3 }
sortOrder 3: type 'events_preview'     content: { heading: 'Events & Programs', count: 3 }
sortOrder 4: type 'practice_areas_grid' content: { heading: 'Our Practice Areas', items: [...from practice-areas.json...] }
sortOrder 5: type 'leadership_preview' content: { heading: 'Our Leadership', count: 4 }
sortOrder 6: type 'gallery_teaser'     content: { heading: 'Gallery' }
sortOrder 7: type 'rich_text'          content: { heading: 'About GAPHTO', body: '...(from about.json background)...' }
sortOrder 8: type 'fund_cta'           content: { heading: 'GAPHTO Welfare Fund', subtitle: '...', buttonText: 'Apply Now' }
```

**About blocks (page = 'about'):**
```
sortOrder 0: type 'rich_text'           content: { heading: 'Background', body: '...(about.json background HTML)...' }
sortOrder 1: type 'rich_text'           content: { heading: 'Vision & Mission', body: '<p><strong>Vision:</strong> ...(about.json vision)...</p><p><strong>Mission:</strong> ...(about.json mission)...</p>' }
sortOrder 2: type 'objectives_list'     content: { heading: 'Aims & Objectives', items: [...(about.json objectives)...] }
sortOrder 3: type 'practice_areas_grid' content: { heading: 'Areas of Practice', items: [...same practice areas...] }
sortOrder 4: type 'timeline'            content: { heading: 'Our History', items: [{year:'1984', title:'Founding', description:'...'}, {year:'2006', ...}, {year:'2009', ...}, {year:'Present', ...}] }
```

**Important:** Before inserting, check if blocks already exist for the page:
```typescript
const existing = await db.select().from(pageBlocks).where(eq(pageBlocks.page, 'homepage'))
if (existing.length > 0) { console.log('Homepage blocks already seeded, skipping'); return }
```

Use a top-level `async` IIFE and call it directly — this is a script not a Next.js module:
```typescript
import { db } from './src/lib/db'  // adjust path as needed
...
;(async () => {
  await seedHomepage()
  await seedAbout()
  console.log('Seed complete')
  process.exit(0)
})()
```

Run it with: `bunx tsx src/lib/seed-blocks.ts`

---

## Task 7: Verify

Run the seed script:
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx tsx src/lib/seed-blocks.ts
```

Then confirm: run `bun dev`, make sure the app builds and homepage + about pages still work (they should be back to JSON mode after your cleanup in Task 1).

---

## Completion Report

Report:
1. ✅ Files deleted (cleanup)
2. ✅ Migration SQL file name created
3. ✅ Seed script ran successfully — how many blocks inserted (homepage + about)
4. ✅ Build passes (0 errors)
5. ✅ Any deviations or issues

Also update `plans/AGENT_CONTEXT.md`:
- Change Phase 5 active tasks section to "Page Builder Phase A ✅ COMPLETE"
- Add a `## Page Builder Notes` section with: pageBlocks table exists, seed script location, blocks.ts types location, blocks.ts actions location
