# Phase 5 — Agent 1: Backend + Public Page Integration

## Your Role
You are Agent 1. You handle the data layer and public-facing pages.  
Agent 2 is building the dashboard UI and is **waiting on your deliverables** before wiring forms.

---

## MANDATORY FIRST STEP
Read `plans/AGENT_CONTEXT.md` **before writing any code**. It contains critical rules (especially about middleware and package manager).

---

## Objective
Wire the `siteSettings` database table as the content source for the homepage and about page. Currently both pages read from static JSON files. After your work, the DB is authoritative — JSON is only a fallback for local dev.

---

## No DB Migration Required
The `siteSettings` table already exists:
```typescript
// drizzle/schema.ts
siteSettings = pgTable('site_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```
No `drizzle-kit generate` or `migrate.ts` needed.

---

## Key Naming Convention (SHARE THIS WITH AGENT 2 — DO NOT CHANGE)

```
homepage.hero.title
homepage.hero.subtitle
homepage.stats.members_count
homepage.stats.members_label
homepage.stats.journals_count
homepage.stats.journals_label
homepage.stats.events_count
homepage.stats.events_label
homepage.stats.years_count
homepage.stats.years_label
homepage.sections.news_title
homepage.sections.events_title
homepage.sections.practice_areas_title
homepage.sections.leadership_title
homepage.sections.gallery_title
homepage.sections.about_title
homepage.sections.fund_cta_title
homepage.sections.fund_cta_subtitle

about.background
about.vision
about.mission
about.objectives          ← JSON string: string[]
about.timeline            ← JSON string: {year: string, title: string, description: string}[]
about.practice_areas      ← JSON string: {title: string, description: string}[]
```

---

## Tasks

### Task 1: Create `src/app/actions/content.ts`

Model it **exactly** on `src/app/actions/settings.ts`. Read that file first.

```typescript
'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { siteSettings } from '../../../drizzle/schema'
import { inArray, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

// Fetch multiple keys at once — returns key→value map, missing keys get empty string
export async function getPageContent(keys: string[]): Promise<Record<string, string>> { ... }

// Batch upsert — permission: super_admin OR admin
export async function savePageContent(values: Record<string, string>): Promise<void> { ... }
```

- `getPageContent` does NOT require auth (public read)
- `savePageContent` requires `session.user.role` in `['super_admin', 'admin']` — throw `new Error('Forbidden')` otherwise
- After save: `revalidatePath('/', 'layout')` and `revalidatePath('/about')`

### Task 2: Add helpers to `src/lib/data.ts`

Read `src/lib/data.ts` first — it currently exports `getAbout()`, `getAllPosts()`, etc from JSON.

Add a new exported async function:
```typescript
export async function getContentMap(keys: string[]): Promise<Record<string, string>>
```

This calls `getPageContent(keys)` from the new action. Return the map so pages can do `content['homepage.hero.title'] ?? 'Default title'`.

**Important**: Do NOT break existing synchronous exports like `getAbout()`, `getAllPosts()`, etc. Add alongside them.

### Task 3: Update `src/app/(public)/page.tsx` (Homepage)

Read the file first. It's a server component that composes sections.

- Make it `async`
- Call `getContentMap([...all homepage keys...])` at the top
- Pass editable values as props to `StatsBar`, section heading props, `HeroCarousel`
- You will need to check which props these components accept — read their source before changing
- If a component doesn't accept a prop yet, add it (edit the component minimally)
- Use fallback values: `content['homepage.hero.title'] ?? 'Existing default text'`
- Seed the fallbacks with the **current hardcoded text** from the page so nothing breaks on first deploy

### Task 4: Update `src/app/(public)/about/page.tsx`

Read the file first. It has hardcoded `TIMELINE` and `PRACTICE_AREAS` arrays.

- Make it `async`  
- Call `getContentMap([...all about keys...])` at the top
- Replace `about.vision`, `about.mission`, `about.background` with DB values (fallback to `getAbout()` values)
- Replace hardcoded `TIMELINE` array:
  ```typescript
  const timeline = (() => {
    try { return JSON.parse(content['about.timeline'] || '') } catch { return TIMELINE_DEFAULTS }
  })()
  ```
- Replace hardcoded `PRACTICE_AREAS` array same way
- Replace `about.objectives` array same way

Define `TIMELINE_DEFAULTS`, `PRACTICE_AREAS_DEFAULTS`, `OBJECTIVES_DEFAULTS` as constants in the file using the current hardcoded values.

### Task 5: Update `plans/AGENT_CONTEXT.md`

Add a Phase 5 section at the top of the active tasks table:

```markdown
| `plans/TASK_PM5_AGENT1_BACKEND.md` | Agent 1 | Content actions + public page DB integration |
| `plans/TASK_PM5_AGENT2_DASHBOARD.md` | Agent 2 | Dashboard content editor UI |
```

Also add at the bottom of the file under a `## Phase 5 Notes` heading:
- The `savePageContent` function signature
- The complete key naming convention list
- Status: AGENT 1 COMPLETE / AGENT 2 PENDING

---

## What to Hand Off to Agent 2 (PM will relay)

When done, report:
1. ✅ Exact signature of `savePageContent` (import path: `@/app/actions/content`)
2. ✅ Complete list of all key names used
3. ✅ Whether any homepage/about components needed new props added (and what)
4. ✅ Any complications or deviations from this plan

---

## Do Not

- Do not create `src/middleware.ts` (use `src/proxy.ts`)
- Do not use `npm` or `npx` — use `bun` / `bunx`
- Do not break existing `getAbout()`, `getAllPosts()` etc exports
- Do not run a DB migration (no schema change needed)
