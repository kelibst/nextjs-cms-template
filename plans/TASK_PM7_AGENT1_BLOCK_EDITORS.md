# TASK: Agent 1 — Block Editor Fixes (Admin Side)
> Sprint: Block System Completion (2026-04-11)
> Read AGENT_CONTEXT.md for project rules before starting.

## OVERVIEW
Fix and enhance the admin-side block editors. The PM has already updated `src/lib/blocks.ts` with the new expanded types. Your job is to update/create the editor components so they match those types.

---

## TASK 1 — Gallery Teaser Block Editor

### Current state
`gallery_teaser` uses `SimpleSectionBlockEditor` which only shows a heading input. The user needs to be able to:
- Set how many photos to show (count)
- Select which specific albums to feature (optional — show all if none selected)

### New type (already in blocks.ts)
```ts
type GalleryTeaserContent = {
  heading: string
  count?: number              // max photos to show (default 6)
  selectedAlbumSlugs?: string[] // empty = show from all albums
}
```

### Create: `src/components/dashboard/block-editor/gallery-teaser-block-editor.tsx`

This is a NEW file replacing the `SimpleSectionBlockEditor` for gallery_teaser type.

```tsx
'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { GalleryTeaserContent } from '@/lib/blocks'

interface Props {
  content: GalleryTeaserContent
  onChange: (content: GalleryTeaserContent) => void
}

type AlbumOption = { id: string; title: string; slug: string }
```

**Layout:**
1. Heading (Input, required)
2. Max Photos to Show (Input type=number, min=3, max=24, default=6)
3. Album Selection section:
   - Subheading: "Featured Albums" + note: "Leave all unchecked to show photos from all albums"
   - Fetch albums via a server action `getGalleryAlbumsSummary()` (create this action — see below)
   - Loading state while fetching
   - Error state if fetch fails
   - Scrollable list (max-h-48 overflow-y-auto, border rounded) of checkboxes — one per album:
     - Checkbox + album title
   - Checked = that album's slug is in `selectedAlbumSlugs`

**Create the server action** `src/app/actions/gallery.ts` — ADD to existing file (don't create new):
```ts
export async function getGalleryAlbumsSummary() {
  return db.select({ id: galleryAlbums.id, title: galleryAlbums.title, slug: galleryAlbums.slug })
    .from(galleryAlbums)
    .orderBy(asc(galleryAlbums.createdAt))
}
```
Check if `src/app/actions/gallery.ts` exists first. If it does, add to it. If not, create it.

**Important**: The editor must call `onChange` with the full GalleryTeaserContent object on any field change. Use `useTransition` or just regular server action call for the album fetch.

### Update `src/components/dashboard/block-editor/block-editor-shell.tsx`

Find where `gallery_teaser` type is handled (it currently routes to `SimpleSectionBlockEditor` with showCount=false). Replace with:
```tsx
case 'gallery_teaser':
  return <GalleryTeaserBlockEditor content={parsedContent as GalleryTeaserContent} onChange={handleSave} />
```
Import the new component at the top.

### Update `src/components/dashboard/page-builder-client.tsx`

Find `DEFAULT_CONTENT` for `gallery_teaser` and update:
```ts
gallery_teaser: { heading: 'Gallery', count: 6, selectedAlbumSlugs: [] }
```

---

## TASK 2 — Fund CTA Block Editor

### Current state
`FundCtaBlockEditor` has: heading, subtitle, buttonText — but buttonText is never used on the public site (hardcoded buttons exist). The fund block needs more control.

### New type (already in blocks.ts)
```ts
type FundCtaContent = {
  heading: string
  subtitle: string
  buttonText: string          // Primary CTA button label
  buttonHref?: string         // Primary CTA button URL (default '/fund')
  pdfUrl?: string             // If set, shows "View Fund Document" button
  showCalculator?: boolean    // Show Loan Calculator button (default true)
}
```

### Update: `src/components/dashboard/block-editor/fund-cta-block-editor.tsx`

Read this file first. Add these fields after the existing ones:

1. **Primary Button URL** (Input, placeholder="/fund or https://..."):
   - Label: "Primary Button URL"
   - Maps to `buttonHref`
   
2. **Fund Document URL** (Input, optional, placeholder="https://... or leave empty to hide button"):
   - Label: "Fund Document PDF URL (optional)"
   - Note below: 'Leave empty to hide the "View Document" button'
   - Maps to `pdfUrl`
   
3. **Show Loan Calculator button** (Switch):
   - Label: "Show Loan Calculator Button"
   - Maps to `showCalculator`, defaults to true

Update the save handler to include all 6 fields.

### Update `src/components/dashboard/page-builder-client.tsx`

Find `DEFAULT_CONTENT` for `fund_cta` and update:
```ts
fund_cta: { heading: 'GAPHTO Welfare Fund', subtitle: 'Supporting our members when it matters most.', buttonText: 'Learn More', buttonHref: '/fund', pdfUrl: '', showCalculator: true }
```

---

## TASK 3 — Stats Bar count enforcement note

The `stats_bar` block editor already works well. No change needed. The rendering issue (only uses 4 items) will be handled by Agent 2.

---

## ACCEPTANCE CRITERIA
- [x] `GalleryTeaserBlockEditor` created — shows heading, count, album checkboxes (fetched from DB)
- [x] `block-editor-shell.tsx` routes gallery_teaser to the new editor
- [x] `FundCtaBlockEditor` has all 6 fields with proper labels and inputs
- [x] Default content updated in page-builder-client.tsx for both blocks
- [x] TypeScript compiles without errors (run `bunx tsc --noEmit` to check)
- [x] Update AGENT_CONTEXT.md status log when done

## STATUS
- [x] Gallery teaser editor created
- [x] Gallery albums server action added
- [x] Block editor shell updated for gallery_teaser
- [x] Fund CTA editor updated with new fields
- [x] Default content updated
- [x] TypeScript check passed
