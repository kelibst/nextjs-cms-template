# Page Builder — Phase B, Agent 2: Page Builder Dashboard UI

## Your Role
You build the dashboard pages that let admins manage page blocks. Agent 1 (running in parallel) is building the block editor components in `src/components/dashboard/block-editor/`. You will import `BlockEditorShell` from `@/components/dashboard/block-editor` in your pages — it will exist when both agents are done.

---

## MANDATORY FIRST STEP
Read `plans/AGENT_CONTEXT.md` for critical rules (no middleware.ts, use bun, etc.).

---

## Reference Files to Read First

1. `src/app/actions/blocks.ts` — getPageBlocks, reorderBlocks, upsertBlock signatures
2. `src/lib/blocks.ts` — block content types
3. `src/app/(dashboard)/dashboard/settings/page.tsx` — dashboard page UI pattern (header, card structure)
4. `src/components/dashboard/sidebar.tsx` — check existing "Pages" nav group
5. `src/app/(dashboard)/dashboard/content/page.tsx` — the current stub left by Phase A, replace it

---

## What to Build

### 1. Replace `src/app/(dashboard)/dashboard/content/page.tsx`

The Pages hub. Shows all manageable pages as cards.

**Server component.** Auth check — redirect non-admin/non-super_admin to `/dashboard`.

Display a grid of page cards:
- **Homepage** — link to `/dashboard/content/homepage` — shows block count
- **About Page** — link to `/dashboard/content/about` — shows block count

Fetch block counts server-side: `getPageBlocks('homepage')` and `getPageBlocks('about')`, display `X blocks` in each card.

Card structure (match the dashboard's existing card style):
```
┌─────────────────────┐
│ 🏠 Homepage          │
│ 9 blocks            │
│ [Edit Content →]    │
└─────────────────────┘
```

### 2. Create `src/app/(dashboard)/dashboard/content/[page]/page.tsx`

The actual page builder. Dynamic route — `page` param is `'homepage'` or `'about'`.

**Server component** (data fetching). Pass data to a client component for interactivity.

This page:
1. Checks auth (redirect non-admin to `/dashboard`)
2. Validates `page` param — if not `homepage` or `about`, redirect to `/dashboard/content`
3. Fetches all blocks: `const blocks = await getPageBlocks(page)`
4. Renders `<PageBuilderClient blocks={blocks} page={page} />`

### 3. Create `src/components/dashboard/page-builder-client.tsx`

**This is a `'use client'` component** — all the interactivity lives here.

Props: `{ blocks: BlockRow[]; page: string }`

**State:**
```typescript
const [blockList, setBlockList] = useState(blocks)
const [isPendingReorder, startReorder] = useTransition()
```

**UI Layout:**
```
Page Title: "Homepage" / "About Page"
Breadcrumb: Dashboard > Content > [page name]

[Block list — each block rendered as BlockEditorShell]
[↑ move up] [↓ move down]  handled here via reorderBlocks

[+ Add Block] button at the bottom
```

**Reorder logic:**
- Each `BlockEditorShell` receives `onMoveUp` and `onMoveDown` props
- `onMoveUp(index)` swaps sortOrder of block[index] and block[index-1], then calls `reorderBlocks(updatedList.map(b => ({ id: b.id, sortOrder: b.sortOrder })))` inside `startTransition`
- Update local `blockList` state immediately (optimistic) and let revalidatePath refresh from server

**Add Block:**
- "Add Block" button opens a `<Sheet>` or `<Dialog>` from shadcn
- Inside the dialog: a grid of block type options the user can click
- Display each block type as a card with icon + label:
  - Hero, Stats Bar, Rich Text, Objectives List, Timeline, Practice Areas, News Preview, Events Preview, Leadership Preview, Gallery Teaser, Fund CTA, Image Banner
- On click: call `upsertBlock({ id: null, page, type: selectedType, content: defaultContentForType, sortOrder: blockList.length })` then refresh (router.refresh() or revalidate)
- After adding, close dialog

**Default content for new blocks** (used in Add Block):
```typescript
const DEFAULT_CONTENT: Record<string, object> = {
  hero: { title: 'New Section', subtitle: '' },
  stats_bar: { items: [{ count: '0', suffix: '', label: 'Stat' }] },
  rich_text: { heading: 'New Section', body: '<p>Enter content here.</p>' },
  objectives_list: { heading: 'Objectives', items: [''] },
  timeline: { heading: 'Timeline', items: [{ year: '', title: '', description: '' }] },
  practice_areas_grid: { heading: 'Practice Areas', items: [{ title: '', description: '' }] },
  news_preview: { heading: 'Latest News', count: 3 },
  events_preview: { heading: 'Events', count: 3 },
  leadership_preview: { heading: 'Leadership', count: 4 },
  gallery_teaser: { heading: 'Gallery' },
  fund_cta: { heading: 'Fund', subtitle: '', buttonText: 'Learn More' },
  image_banner: { imageUrl: '', alt: '', caption: '' },
}
```

**Rendering the block list:**
```typescript
import { BlockEditorShell } from '@/components/dashboard/block-editor'

// In render:
{blockList.map((block, index) => (
  <BlockEditorShell
    key={block.id}
    block={block}
    onMoveUp={index > 0 ? () => handleMoveUp(index) : undefined}
    onMoveDown={index < blockList.length - 1 ? () => handleMoveDown(index) : undefined}
    isFirst={index === 0}
    isLast={index === blockList.length - 1}
  />
))}
```

### 4. Check/Update Sidebar

Read `src/components/dashboard/sidebar.tsx`. The "Pages" nav group was added in Phase 5 with a link to `/dashboard/content`. Verify it still points to `/dashboard/content` and the FileEdit icon is there. If it was removed during Phase A cleanup, re-add it exactly as it was.

---

## Block Type Labels for the Add Block Dialog

```typescript
const BLOCK_TYPE_LABELS: Record<string, { label: string; description: string; icon: string }> = {
  hero: { label: 'Hero', description: 'Full-width hero with title and subtitle', icon: '🏠' },
  stats_bar: { label: 'Stats Bar', description: 'Animated stat counters', icon: '📊' },
  rich_text: { label: 'Rich Text', description: 'Formatted text section', icon: '📝' },
  objectives_list: { label: 'Objectives', description: 'Numbered objectives list', icon: '✅' },
  timeline: { label: 'Timeline', description: 'Chronological history entries', icon: '📅' },
  practice_areas_grid: { label: 'Practice Areas', description: 'Card grid of practice areas', icon: '🗂️' },
  news_preview: { label: 'News Preview', description: 'Latest news section', icon: '📰' },
  events_preview: { label: 'Events', description: 'Upcoming events section', icon: '🗓️' },
  leadership_preview: { label: 'Leadership', description: 'Team member showcase', icon: '👥' },
  gallery_teaser: { label: 'Gallery', description: 'Photo gallery section', icon: '🖼️' },
  fund_cta: { label: 'Fund CTA', description: 'Call to action for the welfare fund', icon: '💰' },
  image_banner: { label: 'Image Banner', description: 'Full-width image', icon: '🖼️' },
}
```

---

## Important Notes

- Import `BlockEditorShell` from `'@/components/dashboard/block-editor'` — Agent 1 creates this. The import path will work once both agents' work is merged.
- Do NOT implement block editors yourself — that's Agent 1's job
- Use `useRouter().refresh()` or server action revalidation after adding/deleting blocks to sync server state
- The page builder page title should show "Homepage" when param is `homepage`, "About Page" when `about`

---

## Imports Reference

```typescript
// Server actions
import { getPageBlocks, upsertBlock, reorderBlocks } from '@/app/actions/blocks'
// Types
import type { BlockRow } from '@/lib/blocks'  // or define inline from the schema return type
// Shell (Agent 1 creates this)
import { BlockEditorShell } from '@/components/dashboard/block-editor'
// Shadcn
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
// or Dialog instead of Sheet
```

---

## Do Not

- Do not implement block editors (no Tiptap, no field inputs per block type) — that's Agent 1
- Do not create src/middleware.ts
- Do not use npm/npx

---

## Completion Report

When done, report:
1. All files created/modified
2. How the Add Block dialog is implemented (Sheet or Dialog?)
3. How reorder works (optimistic update detail)
4. How router refresh is triggered after mutations
5. Build passes (0 errors) — note: if Agent 1's BlockEditorShell doesn't exist yet, you may get a TypeScript error on that import. That's expected — note it in your report and confirm everything else builds.
