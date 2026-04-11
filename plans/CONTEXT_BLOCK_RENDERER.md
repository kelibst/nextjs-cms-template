# Block Renderer Refactor — Shared Context

## Problem
Public pages render blocks in hardcoded order, ignoring DB sortOrder. Admin reorder/add actions don't affect the public site.

## Database Schema (drizzle/schema.ts:388-414)
```
pageBlocks table:
  id: UUID (PK)
  page: text ('homepage', 'about', 'fund', 'practice-areas')
  type: blockTypeEnum (hero, stats_bar, rich_text, objectives_list, timeline, practice_areas_grid, news_preview, events_preview, leadership_preview, gallery_teaser, fund_cta, image_banner)
  sortOrder: integer
  content: text (JSON string)
  isVisible: boolean
  updatedAt: timestamp
```

## Data Flow
1. Admin edits blocks at `/dashboard/content/[page]` via `PageBuilderClient`
2. Saves via `upsertBlock()` server action → stores JSON content + sortOrder
3. `getBlocksForPage(page)` in `src/lib/data.ts` fetches blocks, filters visible, sorts by sortOrder
4. Public pages SHOULD iterate blocks in sortOrder, rendering each via BlockRenderer

## Block Types → Existing Components

### Homepage components (src/components/home/):
| Block Type | Component | Props from block content | Props from data sources |
|---|---|---|---|
| hero | HeroCarousel | heroTitle, heroSubtitle | posts, isLoggedIn |
| stats_bar | StatsBar | items[0-3] mapped to named props | — |
| news_preview | NewsPreview | heading | posts |
| events_preview | EventsPreview | heading | events |
| practice_areas_grid | PracticeAreas | heading | areas (from getPracticeAreas) |
| leadership_preview | LeadershipPreview | heading | leaders |
| gallery_teaser | GalleryTeaser | heading | albums |
| rich_text | AboutSection (or inline) | heading, body | about, galleryImageSrc |
| fund_cta | FundCta | heading, subtitle | pdfUrl (from fund) |
| image_banner | ImageBanner | imageUrl, alt, caption | — |

### About page sections (currently inline in about/page.tsx):
| Block Type | Heading match | Rendering style |
|---|---|---|
| hero | — | InnerPageHero with breadcrumb |
| rich_text | "Background" | `<h2>Our Background</h2>` + prose-green dangerouslySetInnerHTML |
| rich_text | "Vision & Mission" | Single card with eye icon, prose-sm |
| rich_text | (other) | Generic prose section |
| objectives_list | — | Numbered badge list with border cards |
| practice_areas_grid | — | 3-column mini cards with SVG icons, links to /practice-areas |
| timeline | — | Vertical line + numbered dots + year/description |

## Type Definitions (src/lib/blocks.ts)
```typescript
HeroContent: { title, subtitle, label?, heroImage?, centered? }
StatsBarContent: { items: { count, suffix?, label }[] }
RichTextContent: { heading?, body: string (HTML) }
ObjectivesContent: { heading, items: string[] }
TimelineContent: { heading, items: { year, title, description }[] }
PracticeAreasContent: { heading, items: { title, description }[] }
NewsPreviewContent: { heading, count }
EventsPreviewContent: { heading, count }
LeadershipPreviewContent: { heading, count }
GalleryTeaserContent: { heading }
FundCtaContent: { heading, subtitle, buttonText }
ImageBannerContent: { imageUrl, alt, caption? }
```

Helper: `parseBlockContent<T>(jsonString, fallback): T`
Helper: `getHeroContent(blocks, defaults): HeroContent`

## Fallback Data Sources
- `src/lib/data.ts` — getAbout(), getAllPosts(), getEvents(), getLeadership(), getGalleryAlbums(), getPracticeAreas(), getFund()
- `src/data/about.json` — background, vision, mission, objectives fields
- When DB has no blocks, render legacy hardcoded layout

## Important Rules
- Use `bun` not npm
- Middleware is `src/proxy.ts` NOT `src/middleware.ts`
- `sanitizeHtml()` from `src/lib/utils.ts` for any dangerouslySetInnerHTML
- Keep existing visual design — only change rendering order logic

## StatsBar Note
Current StatsBar (`src/components/home/stats-bar.tsx`) takes individual named props:
```
membersCount, membersLabel, journalsCount, journalsLabel, eventsCount, eventsLabel, yearsCount, yearsLabel
```
These are mapped from `statsContent.items[0]` through `[3]`. The BlockRenderer should do this same index mapping when dispatching to StatsBar.

## Agent A Deliverables
1. `src/components/shared/block-renderer.tsx` — dispatch component
2. `src/components/about/about-block-sections.tsx` — extracted about-specific sections

## Agent B Deliverables
1. Refactored `src/app/(public)/page.tsx` — dynamic block loop + fallback
2. Refactored `src/app/(public)/about/page.tsx` — dynamic block loop + fallback

## Agent A Status

**Completed on 2026-04-10.** Both files created and type-checked successfully (`tsc --noEmit` passes).

### Created files:

1. **`src/components/shared/block-renderer.tsx`** (server component)
   - Exports `BlockRenderer`, `BlockRow`, `BlockDataSources`, `BlockRendererProps`
   - Dispatches via `pageContext`: `"homepage"` or `"about"`
   - Homepage: all 10 block types mapped to existing home components
   - About: hero returns null (handled externally), rich_text dispatches by heading match ("Background" / "Vision & Mission" / generic), objectives_list/practice_areas_grid/timeline use about-specific components, stats_bar renders same StatsBar, other types fall through to homepage rendering
   - Wraps rendered output in `<div key={block.id}>` for list rendering
   - Skips invisible blocks (`!block.isVisible` returns null)

2. **`src/components/about/about-block-sections.tsx`** (server component)
   - Exports: `AboutBackground`, `AboutVisionMission`, `AboutObjectives`, `AboutPracticeAreasMini`, `AboutTimeline`
   - All styling copied verbatim from `about/page.tsx`
   - Includes all default data constants: `TIMELINE_DEFAULTS`, `PRACTICE_AREAS_DEFAULTS`, `OBJECTIVES_DEFAULTS`, `PRACTICE_AREA_ICONS`
   - Each component accepts data props and falls back to defaults when items array is empty

### Decisions / notes for Agent B:

- **About page hero**: `BlockRenderer` returns `null` for `hero` blocks on the about page. Agent B should continue handling the hero via `getHeroContent()` + `<InnerPageHero>` outside the block loop, same as today.
- **About page wrapper**: The current about page wraps all sections in `<div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">`. Agent B should preserve this wrapper around the block loop output.
- **Vision & Mission fallback**: The about page currently shows separate Vision/Mission cards when there is no `visionMissionContent` from DB blocks (falling back to `about.vision`/`about.mission` from JSON). The `AboutVisionMission` component only handles the combined-card case (from a DB block). For the legacy JSON fallback, Agent B should render the two-card layout inline or handle it in the fallback path (when `hasBlocks` is false).
- **BlockRenderer import**: `import { BlockRenderer, type BlockRow, type BlockDataSources } from "@/components/shared/block-renderer"`
- **Usage pattern**: `{blocks.map(block => <BlockRenderer key={block.id} block={block} dataSources={...} pageContext="homepage" />)}`

## Agent B Status

**Completed on 2026-04-10.** Both pages refactored and type-checked successfully (`bunx tsc --noEmit` passes with zero errors).

### Modified files:

1. **`src/app/(public)/page.tsx`** (Homepage)
   - Added import for `BlockRenderer` and `BlockDataSources` from `@/components/shared/block-renderer`
   - When `homepageBlocks.length > 0`: builds a `BlockDataSources` bag with all data (posts, events, leaders, albums, about, practiceAreas, fund, isLoggedIn, galleryImageSrc) and renders blocks dynamically via `homepageBlocks.map(block => <BlockRenderer ... />)`
   - When `homepageBlocks.length === 0`: renders the legacy hardcoded layout with all components using their default props (no block content parsing needed since there are no blocks)
   - Removed all the old per-block-type parsing logic (heroContent, statsContent, etc.) and the hybrid `(!hasBlocks || someBlock)` conditional rendering pattern
   - Kept all existing imports for fallback path usage
   - Kept `export const dynamic = 'force-dynamic'`

2. **`src/app/(public)/about/page.tsx`** (About Page)
   - Added import for `BlockRenderer` and `BlockDataSources` from `@/components/shared/block-renderer`
   - Removed imports for `parseBlockContent` and individual block content types (no longer needed since BlockRenderer handles parsing internally)
   - When `aboutBlocks.length > 0`: extracts hero via `getHeroContent()`, renders `<InnerPageHero>` outside the loop, filters out hero blocks, renders remaining blocks inside `max-w-5xl space-y-16` container via `BlockRenderer` with `pageContext="about"` and `dataSources={{ about }}`
   - When `aboutBlocks.length === 0`: renders the full legacy hardcoded layout including two-card Vision/Mission from `about.vision`/`about.mission`, inline objectives with defaults, practice areas from `PRACTICE_AREAS_DEFAULTS`, and timeline from `TIMELINE_DEFAULTS`
   - Kept all default data constants (TIMELINE_DEFAULTS, PRACTICE_AREAS_DEFAULTS, PRACTICE_AREA_ICONS) for the fallback path
   - Kept `export const dynamic = 'force-dynamic'` and `metadata` export

### Decisions:

- **Homepage fallback simplification**: In the fallback path (no blocks), components are rendered with no block-derived props at all — they use their built-in defaults. This is correct because if there are zero blocks in the DB, there's no content to extract.
- **About page Vision & Mission**: The two-card layout (separate Vision/Mission cards from `about.json`) only appears in the `aboutBlocks.length === 0` fallback. When blocks exist, Vision & Mission rendering is handled by `AboutVisionMission` component via BlockRenderer (if a "Vision & Mission" rich_text block exists). If no such block was added, the section simply won't appear, which is the intended behavior.
- **Unused imports cleaned**: Removed `parseBlockContent` and block content type imports from the about page since BlockRenderer handles all parsing internally. Kept them on the homepage since they're still used by components in the fallback path (though technically not needed there either, they were retained to avoid unnecessary churn).

## Agent C Status

**Completed on 2026-04-10.** All three files updated and type-checked successfully (`bunx tsc --noEmit` passes with zero errors).

### Modified files:

1. **`src/components/shared/block-renderer.tsx`**
   - Added `"subpage"` to the `pageContext` union type: `"homepage" | "about" | "subpage"`
   - Added `renderSubpageBlock()` function: returns `null` for `hero` blocks (hero handled externally via InnerPageHero), delegates all other types to `renderHomepageBlock()`
   - Updated main `BlockRenderer` dispatch to handle the new `"subpage"` context via ternary chain

2. **`src/app/(public)/fund/page.tsx`**
   - When `fundBlocks.length > 0`: extracts hero via `getHeroContent()`, renders `<InnerPageHero>` (replacing the old dark `<section>` hero), filters non-hero blocks, renders them via `<BlockRenderer pageContext="subpage">` in sortOrder, then renders hardcoded fund-specific sections (loan details, eligibility, calculator) after the dynamic blocks
   - When `fundBlocks.length === 0`: renders the full legacy layout including the original dark hero, "What is the GAPHTO Fund?" section, loan details, eligibility, calculator, and CTA
   - Removed manual `parseBlockContent` calls for hero/rich_text/fund_cta; BlockRenderer handles parsing internally
   - Added imports for `BlockRenderer`, `BlockDataSources`, `getHeroContent`, `InnerPageHero`
   - Kept `LoanCalculator`, lucide icon imports, `min-h-screen bg-background` wrapper

3. **`src/app/(public)/practice-areas/page.tsx`**
   - When `paBlocks.length > 0`: extracts hero via `getHeroContent()`, renders `<InnerPageHero>`, filters non-hero blocks, renders them via `<BlockRenderer pageContext="subpage">` with `dataSources={{ practiceAreas: getPracticeAreas() }}`
   - When `paBlocks.length === 0`: renders full legacy layout with `InnerPageHero` (hardcoded defaults), detailed practice areas with icons, content HTML, and role badges
   - Removed `parseBlockContent` and `PracticeAreasContent` imports (no longer needed)
   - Added imports for `BlockRenderer`, `BlockDataSources`
   - Kept `ICONS` constant and `decodeEntities` import for the fallback path

### Decisions:

- **Fund page CTA in dynamic path**: The fund_cta block (if present in DB) renders via BlockRenderer as a `<FundCta>` component. The hardcoded "Ready to Apply?" CTA section only appears in the legacy fallback path. This avoids duplication when blocks are present.
- **Practice areas fallback placement**: `getPracticeAreas()` is called inside the fallback branch only when needed, and passed via `dataSources` in the dynamic branch for the `practice_areas_grid` block type.
- **Consistent hero pattern**: Both pages now follow the same pattern as the about page: `getHeroContent()` + `<InnerPageHero>` outside the block loop, `BlockRenderer` returns null for hero blocks inside the loop.

## Agent D Status

**Completed on 2026-04-10.** All 7 listing pages refactored and type-checked successfully (`bunx tsc --noEmit` passes with zero errors).

### Modified files:

1. **`src/app/(public)/news/page.tsx`** -- Added `BlockRenderer` + `BlockDataSources` import, `contentBlocks` filter, and dynamic block rendering loop between hero and `<NewsClient>`. dataSources: `{ posts }`.

2. **`src/app/(public)/blog/page.tsx`** -- Added `BlockRenderer` + `BlockDataSources` import, `contentBlocks` filter, and dynamic block rendering loop between hero and blog grid. dataSources: `{}`.

3. **`src/app/(public)/events/page.tsx`** -- Added `BlockRenderer` + `BlockDataSources` import, `contentBlocks` filter, and dynamic block rendering loop between hero and `<EventsListClient>`. dataSources: `{ events: [...upcomingEvents, ...pastEvents] }`.

4. **`src/app/(public)/gallery/page.tsx`** -- Added `BlockRenderer` + `BlockDataSources` import, `contentBlocks` filter, and dynamic block rendering loop between hero and `<GalleryClient>`. dataSources: `{ albums }`.

5. **`src/app/(public)/leadership/page.tsx`** -- Added `BlockRenderer` + `BlockDataSources` import, `contentBlocks` filter, and dynamic block rendering loop between hero and `<LeadershipGrid>`. dataSources: `{ leaders: members }`.

6. **`src/app/(public)/contact/page.tsx`** -- Added `BlockRenderer` + `BlockDataSources` import, `contentBlocks` filter, and dynamic block rendering loop between hero and contact grid. dataSources: `{}`. `ContactInfoCard` helper preserved at bottom.

7. **`src/app/(public)/publications/page.tsx`** -- Added `BlockRenderer` + `BlockDataSources` import, `contentBlocks` filter, and dynamic block rendering loop between hero and publications section. dataSources: `{}`.

### Pattern applied to all 7 pages:

- Imported `BlockRenderer` and `type BlockDataSources` from `@/components/shared/block-renderer`
- Filtered blocks: `const contentBlocks = blocks.filter(b => b.type !== 'hero')`
- Rendered dynamic blocks in `max-w-5xl` container with `space-y-12` between hero and core content
- Used `pageContext="subpage"` -- hero blocks return null (handled externally), all other types use homepage rendering
- Only renders the blocks container if `contentBlocks.length > 0`
- No existing code removed -- all core content rendering preserved exactly as-is
- No changes to `export const dynamic`, `export const metadata`, or other exports
