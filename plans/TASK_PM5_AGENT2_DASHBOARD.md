# Phase 5 — Agent 2: Dashboard Content Editor UI

## Your Role
You are Agent 2. You build the admin dashboard UI for editing page content.  
**Agent 1 must complete their work before you wire form submissions**, but you can build the UI scaffolding in parallel.

---

## MANDATORY FIRST STEP
Read `plans/AGENT_CONTEXT.md` **before writing any code**. It contains critical rules.

---

## Objective
Build a "Content" section in the admin dashboard that lets `super_admin` and `admin` users edit the homepage and about page content stored in the `siteSettings` database table.

---

## What Agent 1 Provides (PM will relay when ready)
- Import path for `savePageContent` and `getPageContent` actions
- Complete list of all key names (also listed below for reference)
- Any component prop changes needed

---

## Key Names Reference (from Agent 1 — do not invent your own)

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

about.background          ← rich text HTML
about.vision
about.mission
about.objectives          ← JSON string: string[]
about.timeline            ← JSON string: {year, title, description}[]
about.practice_areas      ← JSON string: {title, description}[]
```

---

## Reference Files to Read First

Before writing anything, read these files to understand patterns:
- `src/app/(dashboard)/dashboard/settings/page.tsx` — form pattern to follow
- `src/components/dashboard/sidebar.tsx` — how nav items are structured
- `src/components/dashboard/post-editor.tsx` — rich text editor component

---

## Tasks

### Task 1: Content Hub Page

Create `src/app/(dashboard)/dashboard/content/page.tsx`:
- Server component, requires auth (follow the same layout pattern as other dashboard pages)
- Renders two cards:
  - "Homepage Content" → link to `/dashboard/content/homepage`
  - "About Page Content" → link to `/dashboard/content/about`
- Add a brief description for each card explaining what can be edited
- Match the visual style of other dashboard pages (check `settings/page.tsx` for the header/card pattern)

### Task 2: Homepage Content Editor

Create `src/app/(dashboard)/dashboard/content/homepage/page.tsx`:

**Make this a client component** (or server component that passes data to a client form — follow the settings page pattern exactly).

Sections to render as form groups:

**Hero Section**
- `homepage.hero.title` → Input field (label: "Hero Title")
- `homepage.hero.subtitle` → Textarea (label: "Hero Subtitle")

**Stats Bar** (4 stats, 2 fields each)
- `homepage.stats.members_count` → Input (label: "Members — Count")
- `homepage.stats.members_label` → Input (label: "Members — Label")
- `homepage.stats.journals_count` → Input (label: "Journals — Count")
- `homepage.stats.journals_label` → Input (label: "Journals — Label")
- `homepage.stats.events_count` → Input (label: "Events — Count")
- `homepage.stats.events_label` → Input (label: "Events — Label")
- `homepage.stats.years_count` → Input (label: "Years — Count")
- `homepage.stats.years_label` → Input (label: "Years — Label")

**Section Headlines**
- One Input per section headline key
- Labels: "News Section Title", "Events Section Title", etc.

**Submit**: Single "Save Homepage Content" button — calls `savePageContent` with all values

**Pre-fill**: On page load, call `getPageContent([...all homepage keys...])` to pre-fill all form fields

### Task 3: About Page Content Editor

Create `src/app/(dashboard)/dashboard/content/about/page.tsx`:

**Simple fields:**
- `about.vision` → Textarea
- `about.mission` → Textarea
- `about.background` → **Rich text editor** (reuse the component from `post-editor.tsx`)

**Objectives (dynamic string list):**
- `about.objectives` — stored as JSON `string[]`
- Render a dynamic list: each item shows a text input + "Remove" button
- "Add Objective" button appends a new empty input
- On save: `JSON.stringify(objectivesArray)` → save as `about.objectives`
- On load: `JSON.parse(content['about.objectives'] || '[]')` to restore

**Timeline (dynamic object list):**
- `about.timeline` — stored as JSON `{year, title, description}[]`
- Render each item as a group of 3 inputs (Year, Title, Description) + "Remove" button
- "Add Timeline Entry" button appends new empty group
- On save: `JSON.stringify(timelineArray)`

**Practice Areas (dynamic object list):**
- `about.practice_areas` — stored as JSON `{title, description}[]`
- Render each item as 2 inputs (Title, Description) + "Remove" button
- "Add Practice Area" button appends new empty group
- On save: `JSON.stringify(practiceAreasArray)`

**Submit**: Two options (or one combined button):
- "Save About Content" → calls `savePageContent` with all about keys
- Organize with clear section headings and separators

### Task 4: Update Sidebar

Edit `src/components/dashboard/sidebar.tsx`:

Read the file first. Identify where `navGroups` is defined. Add a "Content" nav group (or add items to the "System" group if that's cleaner — use your judgment after reading the file).

New nav item:
```typescript
{
  label: 'Content',
  href: '/dashboard/content',
  icon: LayoutIcon,  // or FileEditIcon — pick from lucide-react icons already imported
}
```

Visibility: accessible to `['super_admin', 'admin']` roles — check how the sidebar currently filters items by role and follow the same pattern.

### Task 5: Permission Guard

Check `src/app/(dashboard)/layout.tsx` — it already guards the dashboard to `['super_admin', 'admin', 'editor']`. Content editing should be restricted to `['super_admin', 'admin']` only.

Option A (preferred): Add a role check inside `src/app/(dashboard)/dashboard/content/page.tsx` — redirect `editor` role to `/dashboard` with a "You don't have permission" toast.

Option B: If there's a pattern for per-page role checks in other dashboard pages, follow it.

---

## UI/UX Requirements

- Match the visual style of `settings/page.tsx` — same card structure, same button style
- Show a success toast on save (check how `settings/page.tsx` does it)
- Show loading state on submit button
- The dynamic list editors (objectives, timeline, practice areas) should be intuitive — drag-to-reorder is NOT required, just add/remove
- Mobile-responsive (Tailwind flex/grid, same as other dashboard pages)

---

## Do Not

- Do not create `src/middleware.ts`
- Do not use `npm` or `npx` — use `bun`
- Do not invent your own key names — use exactly the ones listed above
- Do not run DB migrations — no schema changes needed
- Do not duplicate the rich text editor — reuse what's in `post-editor.tsx`

---

## Completion Report

When done, report to PM:
1. ✅ Files created (list all new files)
2. ✅ Sidebar change — which group the Content link was added to
3. ✅ How the rich text editor was reused (import path)
4. ✅ Any deviations from this plan
