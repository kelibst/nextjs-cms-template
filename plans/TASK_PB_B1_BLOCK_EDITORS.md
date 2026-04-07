# Page Builder — Phase B, Agent 1: Block Editor Components

## Your Role
You build the reusable block editor components that live inside `src/components/dashboard/block-editor/`. Agent 2 (running in parallel) builds the page builder dashboard pages and will import your `BlockEditorShell` component. Do NOT create any dashboard pages — stay in the components directory.

---

## MANDATORY FIRST STEP
Read `plans/AGENT_CONTEXT.md` for critical rules (no middleware.ts, use bun, etc.).

---

## Reference Files to Read First

1. `src/lib/blocks.ts` — all block content types (HeroContent, StatsBarContent, etc.)
2. `src/app/actions/blocks.ts` — the upsertBlock action signature you'll call on save
3. `src/components/dashboard/post-editor.tsx` — Tiptap usage pattern to reuse
4. `src/app/(dashboard)/dashboard/settings/page.tsx` — form card/button style patterns
5. `src/components/dashboard/sidebar.tsx` — confirms you have lucide-react icons available

---

## Architecture

Each block editor component:
- Is a `'use client'` component
- Receives `blockId: string`, `initialContent: T` (the specific content type), and `onSave: (content: T) => Promise<void>` as props
- Manages its own local state
- Has a "Save" button that calls `onSave(content)`
- Shows a sonner toast on success/error (import from 'sonner')
- Does NOT call `upsertBlock` directly — the shell handles that

The `BlockEditorShell` wraps any editor and handles:
- The block card UI (border, header with type badge, visibility toggle, expand/collapse, delete)
- Calling `upsertBlock` and `deleteBlock` and `toggleBlockVisibility` actions
- Rendering the correct editor by `type`

---

## Files to Create

### 1. `src/components/dashboard/block-editor/hero-block-editor.tsx`

Props: `{ blockId: string; initialContent: HeroContent; onSave: (c: HeroContent) => Promise<void> }`

Fields:
- Title: `<Input>` (label: "Page Title")
- Subtitle: `<Textarea>` (label: "Subtitle / Tagline")
- Save button

### 2. `src/components/dashboard/block-editor/stats-bar-block-editor.tsx`

Props: `{ blockId: string; initialContent: StatsBarContent; onSave: (c: StatsBarContent) => Promise<void> }`

Content has `items: { count: string; suffix: string; label: string }[]`

UI:
- For each item: 3 inputs in a row (Count, Suffix, Label) + a Remove button
- "Add Stat" button appends a new empty item
- Save button

### 3. `src/components/dashboard/block-editor/rich-text-block-editor.tsx`

Props: `{ blockId: string; initialContent: RichTextContent; onSave: (c: RichTextContent) => Promise<void> }`

Content has `heading?: string` and `body: string` (HTML)

UI:
- Optional heading: `<Input>` (label: "Section Heading (optional)")
- Body: **Tiptap editor** — reuse the exact same `useEditor` + `EditorContent` pattern from `post-editor.tsx`. Read that file and copy the editor setup (StarterKit, Link, Placeholder, CharacterCount). Add a simple toolbar: Bold, Italic, H2, H3, BulletList, OrderedList.
- Save button — call `editor.getHTML()` for the body

### 4. `src/components/dashboard/block-editor/objectives-block-editor.tsx`

Props: `{ blockId: string; initialContent: ObjectivesContent; onSave: (c: ObjectivesContent) => Promise<void> }`

Content: `{ heading: string; items: string[] }`

UI:
- Heading: `<Input>`
- For each item: `<Input>` + Remove button (Trash2 icon)
- "Add Objective" button
- Save button

### 5. `src/components/dashboard/block-editor/timeline-block-editor.tsx`

Props: `{ blockId: string; initialContent: TimelineContent; onSave: (c: TimelineContent) => Promise<void> }`

Content: `{ heading: string; items: { year: string; title: string; description: string }[] }`

UI:
- Heading: `<Input>`
- For each item: 3 inputs in a card (Year, Title, Description — description as Textarea) + Remove button
- "Add Entry" button
- Save button

### 6. `src/components/dashboard/block-editor/practice-areas-block-editor.tsx`

Props: `{ blockId: string; initialContent: PracticeAreasContent; onSave: (c: PracticeAreasContent) => Promise<void> }`

Content: `{ heading: string; items: { title: string; description: string }[] }`

UI: same pattern as timeline but 2 inputs per item (Title, Description textarea)

### 7. `src/components/dashboard/block-editor/simple-section-block-editor.tsx`

A generic editor for blocks that only have a `heading` field (gallery_teaser, news_preview, events_preview, leadership_preview also have a `count` number). Accept heading + optional count.

Props: `{ blockId: string; initialContent: { heading: string; count?: number }; onSave: (c: { heading: string; count?: number }) => Promise<void>; showCount?: boolean }`

UI:
- Heading: `<Input>`
- Count: `<Input type="number">` (only if `showCount === true`, label: "Max items to show")
- Save button

### 8. `src/components/dashboard/block-editor/fund-cta-block-editor.tsx`

Props: `{ blockId: string; initialContent: FundCtaContent; onSave: (c: FundCtaContent) => Promise<void> }`

Content: `{ heading: string; subtitle: string; buttonText: string }`

UI: 3 inputs (Heading, Subtitle textarea, Button Text) + Save button

### 9. `src/components/dashboard/block-editor/block-editor-shell.tsx`

**This is the most important file.** It wraps any editor and handles all block-level actions.

```typescript
'use client'

import { useState, useTransition } from 'react'
import { upsertBlock, deleteBlock, toggleBlockVisibility } from '@/app/actions/blocks'
import { parseBlockContent } from '@/lib/blocks'
import { toast } from 'sonner'
// import all the editor components above
// import shadcn: Badge, Button, Switch
// import lucide: ChevronDown, ChevronUp, Trash2, GripVertical, Eye, EyeOff

type BlockRow = {
  id: string
  page: string
  type: string
  sortOrder: number
  content: string
  isVisible: boolean
  updatedAt: Date
}

type Props = {
  block: BlockRow
  // These callbacks are for reorder buttons — passed from parent
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
}
```

**Shell UI structure:**
```
┌─────────────────────────────────────────────────────┐
│ ≡ [HERO] badge  [title preview]  👁 toggle  ▲ ▼  🗑  ▼ expand │
├─────────────────────────────────────────────────────┤  ← collapsed by default
│  [Block-specific editor rendered here when expanded] │
│  [Save button inside each editor calls onSave]       │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Collapsed by default; click header row (or the chevron) to expand
- Block type displayed as a `<Badge>` with human-readable label (e.g. `hero` → "Hero", `stats_bar` → "Stats Bar")
- Visibility toggle: calls `toggleBlockVisibility(block.id)` with a `useTransition`
- Delete button: confirm with `window.confirm('Delete this block?')` then call `deleteBlock(block.id)` 
- Up/Down buttons: call `onMoveUp` / `onMoveDown` props (parent handles reorder logic)
- `onSave` passed to child editor: calls `upsertBlock({ id: block.id, page: block.page, type: block.type, content, sortOrder: block.sortOrder })` then shows toast

**Render the correct editor by block.type:**
```typescript
function renderEditor(block: BlockRow, onSave: (content: object) => Promise<void>) {
  switch (block.type) {
    case 'hero': return <HeroBlockEditor blockId={block.id} initialContent={parseBlockContent(block.content, defaultHero)} onSave={onSave} />
    case 'stats_bar': return <StatsBarBlockEditor ... />
    case 'rich_text': return <RichTextBlockEditor ... />
    case 'objectives_list': return <ObjectivesBlockEditor ... />
    case 'timeline': return <TimelineBlockEditor ... />
    case 'practice_areas_grid': return <PracticeAreasBlockEditor ... />
    case 'news_preview': return <SimpleSectionBlockEditor showCount initialContent={...} ... />
    case 'events_preview': return <SimpleSectionBlockEditor showCount ... />
    case 'leadership_preview': return <SimpleSectionBlockEditor showCount ... />
    case 'gallery_teaser': return <SimpleSectionBlockEditor ... />
    case 'fund_cta': return <FundCtaBlockEditor ... />
    default: return <p className="text-sm text-muted-foreground">Unknown block type: {block.type}</p>
  }
}
```

### 10. `src/components/dashboard/block-editor/index.ts`

Barrel export:
```typescript
export { BlockEditorShell } from './block-editor-shell'
// export other editors if needed externally
```

---

## Styling Guidelines
- Match the dark dashboard theme (look at settings/page.tsx for reference)
- Each editor inside the shell should have `p-4` padding
- Input/Textarea labels use `text-sm font-medium` class
- Dynamic list items in a `space-y-2` container
- Add/Remove buttons use `variant="outline" size="sm"`
- Save button uses `variant="default"` — green if possible (check if there's a success variant)
- Loading state on Save button: `disabled` + spinner icon or "Saving..."

---

## Do Not
- Do not create any dashboard pages (that's Agent 2)
- Do not create src/middleware.ts
- Do not use npm/npx — use bun
- Do not duplicate the full PostEditor component — only reuse Tiptap primitives

---

## Completion Report
When done, report:
1. All files created (list paths)
2. How Tiptap was reused in rich-text-block-editor
3. How the shell's onSave → upsertBlock wiring works
4. Build passes (0 errors)
5. Any deviations
