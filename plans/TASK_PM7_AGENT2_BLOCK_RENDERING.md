# TASK: Agent 2 — Block Rendering Fixes (Public Side)
> Sprint: Block System Completion (2026-04-11)
> Read AGENT_CONTEXT.md for project rules before starting.

## OVERVIEW
Fix the public-side rendering of blocks so that admin-configured values (count, selected albums, fund URLs) are actually honoured. The PM has already updated `src/lib/blocks.ts` with expanded types.

**Files you will touch** (Agent 1 owns editors — do NOT touch editor components):
- `src/components/shared/block-renderer.tsx`
- `src/components/home/news-preview.tsx`
- `src/components/home/events-preview.tsx`
- `src/components/home/leadership-preview.tsx`
- `src/components/home/gallery-teaser.tsx`
- `src/components/home/fund-cta.tsx`

---

## TASK 1 — Pass `count` to news/events/leadership preview components

### Problem
`NewsPreviewContent`, `EventsPreviewContent`, and `LeadershipPreviewContent` all have a `count` field but the block-renderer passes only `heading`. The components display a hardcoded number of items.

### Step 1a — Read the three components first:
- `src/components/home/news-preview.tsx`
- `src/components/home/events-preview.tsx`
- `src/components/home/leadership-preview.tsx`

For each one, find where it slices or limits the data array. Add a `count` prop (default = existing hardcoded number) and use it to slice.

Example pattern for news-preview.tsx:
```tsx
// Before
interface Props { posts: Post[]; heading?: string }
// rendered posts: posts.slice(0, 3) or similar

// After
interface Props { posts: Post[]; heading?: string; count?: number }
// rendered posts: posts.slice(0, count ?? 3)
```

### Step 1b — Update block-renderer.tsx

Read `src/components/shared/block-renderer.tsx`. Find the `renderHomepageBlock` function. Find where news_preview, events_preview, leadership_preview blocks are rendered and pass the count:

```tsx
// news_preview
const c = parseBlockContent<NewsPreviewContent>(block.content, { heading: 'Latest News', count: 3 })
return <NewsPreview posts={dataSources.posts ?? []} heading={c.heading} count={c.count} />

// events_preview
const c = parseBlockContent<EventsPreviewContent>(block.content, { heading: 'Events', count: 3 })
return <EventsPreview events={dataSources.events ?? []} heading={c.heading} count={c.count} />

// leadership_preview
const c = parseBlockContent<LeadershipPreviewContent>(block.content, { heading: 'Leadership', count: 4 })
return <LeadershipPreview leaders={dataSources.leaders ?? []} heading={c.heading} count={c.count} />
```

---

## TASK 2 — Gallery Teaser: respect selected albums and count

### Problem
`GalleryTeaser` currently always shows the first 6 images from all albums, regardless of block config.

### New type (read from `src/lib/blocks.ts`):
```ts
type GalleryTeaserContent = {
  heading: string
  count?: number              // max photos to show (default 6)
  selectedAlbumSlugs?: string[] // empty/undefined = show from all albums
}
```

### Update `src/components/home/gallery-teaser.tsx`

Read this file first. Then:

1. Add props `count?: number` and `selectedAlbumSlugs?: string[]` to the Props interface.

2. In the component logic where it collects images from albums, filter by `selectedAlbumSlugs` if provided and non-empty:
```tsx
const filteredAlbums = (selectedAlbumSlugs && selectedAlbumSlugs.length > 0)
  ? albums.filter(a => selectedAlbumSlugs.includes(a.albumSlug))
  : albums

// Collect images, up to count (default 6)
const maxCount = count ?? 6
const images: ImageItem[] = []
for (const album of filteredAlbums) {
  for (const img of album.images) {
    if (images.length >= maxCount) break
    images.push({ src: `/images/${img.localPath}`, caption: img.caption, albumTitle: album.albumTitle })
  }
  if (images.length >= maxCount) break
}
```

(Adapt to the actual data structure you find in the file.)

### Update block-renderer.tsx

In `renderHomepageBlock` for `gallery_teaser`:
```tsx
const c = parseBlockContent<GalleryTeaserContent>(block.content, { heading: 'Gallery', count: 6 })
return <GalleryTeaser 
  albums={dataSources.albums ?? []} 
  heading={c.heading} 
  count={c.count}
  selectedAlbumSlugs={c.selectedAlbumSlugs}
/>
```

Also update any other places in block-renderer.tsx where GalleryTeaser is used (check `renderSubpageBlock` too).

---

## TASK 3 — Fund CTA: use block-configured values

### Problem
`FundCta` component has hardcoded buttons. The block content fields are ignored.

### New type (read from `src/lib/blocks.ts`):
```ts
type FundCtaContent = {
  heading: string
  subtitle: string
  buttonText: string
  buttonHref?: string
  pdfUrl?: string
  showCalculator?: boolean
}
```

### Update `src/components/home/fund-cta.tsx`

Read this file first. It likely has hardcoded "Learn More → /fund", "View Fund Document", "Loan Calculator" buttons.

Update it to accept and use these props:
```tsx
interface Props {
  heading?: string
  subtitle?: string
  buttonText?: string         // Primary button label (default "Learn More")
  buttonHref?: string         // Primary button URL (default "/fund")
  pdfUrl?: string             // If truthy, show "View Fund Document" button
  showCalculator?: boolean    // Show calculator button (default true)
}
```

Changes in the component:
- Primary button: use `buttonText ?? 'Learn More'` and `buttonHref ?? '/fund'`
- Fund document button: show ONLY if `pdfUrl` is set (truthy), link to that URL
- Calculator button: show ONLY if `showCalculator !== false`

### Update block-renderer.tsx

In `renderHomepageBlock` for `fund_cta`:
```tsx
const c = parseBlockContent<FundCtaContent>(block.content, { heading: 'GAPHTO Welfare Fund', subtitle: '', buttonText: 'Learn More', showCalculator: true })
return <FundCta
  heading={c.heading}
  subtitle={c.subtitle}
  buttonText={c.buttonText}
  buttonHref={c.buttonHref}
  pdfUrl={c.pdfUrl ?? dataSources.fund?.pdfUrl}
  showCalculator={c.showCalculator}
/>
```

Note: `pdfUrl` falls back to `dataSources.fund?.pdfUrl` so existing seeded data still works.

---

## TASK 4 — Practice Areas Grid: use block content on homepage

### Problem
On the homepage, `practice_areas_grid` block rendering ignores the block's `items[]` content and always fetches from `dataSources.practiceAreas`. This makes the editor useless for the homepage.

### Fix in block-renderer.tsx

In `renderHomepageBlock` for `practice_areas_grid`:
```tsx
const c = parseBlockContent<PracticeAreasContent>(block.content, { heading: 'Practice Areas', items: [] })
// If block has custom items, use them; otherwise fall back to DB practice areas
const areas = (c.items && c.items.length > 0) ? c.items : (dataSources.practiceAreas ?? [])
return <PracticeAreas areas={areas} heading={c.heading} />
```

Check `src/components/home/practice-areas.tsx` first to understand its prop types and adapt accordingly.

---

## TASK 5 — Stats Bar: support more than 4 items

### Problem
The stats_bar renderer in block-renderer.tsx hardcodes indices 0-3 to specific prop names (membersCount, membersLabel, etc.). Items beyond index 3 are silently dropped.

### Fix in block-renderer.tsx

Read how StatsBar is currently called. Then read `src/components/home/stats-bar.tsx` to understand its props. Update the StatsBar component to accept a generic `items` array and render them dynamically instead of fixed named props.

In `src/components/home/stats-bar.tsx`:
- Add `items?: { count: string; suffix: string; label: string }[]` prop
- If `items` is provided, render those items dynamically
- Otherwise keep the existing named-prop logic as backward-compatible fallback

In block-renderer.tsx, for stats_bar:
```tsx
const c = parseBlockContent<StatsBarContent>(block.content, { items: [] })
return <StatsBar items={c.items} />
```

---

## ACCEPTANCE CRITERIA
- [ ] NewsPreview, EventsPreview, LeadershipPreview accept and use `count` prop
- [ ] block-renderer.tsx passes count to all three preview components
- [ ] GalleryTeaser filters by selectedAlbumSlugs if provided
- [ ] GalleryTeaser respects count (max images shown)
- [ ] block-renderer passes count and selectedAlbumSlugs to GalleryTeaser
- [ ] FundCta uses buttonText, buttonHref, pdfUrl, showCalculator from props
- [ ] block-renderer passes all FundCta content fields
- [ ] practice_areas_grid on homepage uses block items if non-empty
- [ ] StatsBar accepts generic items[] and renders dynamically
- [ ] TypeScript compiles: `bunx tsc --noEmit`
- [ ] Update AGENT_CONTEXT.md status log when done

## STATUS
- [x] Task 1 — count prop in news/events/leadership components
- [x] Task 1 — block-renderer passes count
- [x] Task 2 — gallery-teaser album filtering and count
- [x] Task 2 — block-renderer updated for gallery_teaser
- [x] Task 3 — fund-cta uses block-configured values
- [x] Task 3 — block-renderer updated for fund_cta
- [x] Task 4 — practice areas uses block content on homepage
- [x] Task 5 — stats-bar supports dynamic items
- [x] TypeScript check passed
