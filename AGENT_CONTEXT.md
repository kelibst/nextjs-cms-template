# AGENT_CONTEXT.md — Template Build Shared State

> This file is the single source of truth for cross-agent decisions.
> Agent A writes the "decisions" sections after Phase 1.
> Agent B reads this BEFORE modifying any file that uses enum values.
> Each agent appends a "Phase Completed" block when done.

---

## Source Project
GAPHTO — copied from `/home/kelib/Desktop/moreprojects/gaphto`
Template destination: `/home/kelib/Desktop/moreprojects/nextjs-cms-template`

## Plan File
Full implementation plan: `/home/kelib/.claude/plans/elegant-coalescing-feigenbaum.md`

---

## Enum Decisions — FINALIZED ✓

### postCategoryEnum — final values
```
'news' | 'blog' | 'announcement'
```
(removed: gaphto-news, health-news)

### memberSpecialtyEnum — final values
```
'general' | 'specialist' | 'associate'
```
(removed: disease-control, health-information, nutrition)

### blockTypeEnum — final values
```
'hero' | 'stats_bar' | 'rich_text' | 'objectives_list' | 'timeline' |
'features_grid' | 'news_preview' | 'events_preview' | 'leadership_preview' |
'gallery_teaser' | 'image_banner' | 'about_preview' | 'cta_section'
```
Changes: practice_areas_grid → features_grid, fund_cta → cta_section (new)

### events table column rename — DONE ✓
- DB: `priceGhs` → `price` (in schema.ts)
- Actions: `EventInput.priceGhs` → `EventInput.price` (in events.ts)
- In all queries and inserts: `event.priceGhs` → `event.price`
- ⚠️ Agent B: any form field for event price must use name `price` not `priceGhs`

### eventRegistrations.paymentStatus — KEPT
- Defaults to 'complete' for free events, 'pending' for paid
- Serves as payment provider integration point

### mediaFiles default bucket — DONE ✓
- `'cms-media'`

---

## DB Table Status ✓

| Table | Status |
|---|---|
| fundApplications | DELETED from schema |
| users, posts, events, galleries, members, etc. | KEPT |

---

## Deleted Files ✓

- src/lib/ghana-regions.ts: DELETED
- src/lib/paystack.ts: DELETED
- src/app/actions/fund.ts: DELETED
- src/app/api/payments/: DELETED (entire directory)

---

## Branding Tokens

| Token | Value |
|---|---|
| SITE_NAME env var | `NEXT_PUBLIC_SITE_NAME` → default `"My CMS"` |
| SITE_URL env var | `NEXT_PUBLIC_APP_URL` → default `"http://localhost:3000"` |
| Admin email default | `admin@example.com` |
| Contact email default | `contact@example.com` |
| Default locale | `en-US` (was `en-GH`) |
| Default currency symbol | `$` (was `GH₵`/`GHS`) |
| Postgres DB/user | `cms` |
| MinIO bucket | `cms-media` |

---

## Notes for Agent B — READ BEFORE MODIFYING ANY FILES

1. **Specialty dropdown options**: `general | specialist | associate`
2. **Post category filter**: `all | news | blog | announcement` (NOT gaphto-news or health-news)
3. **Event price field**: use `price` not `priceGhs` in all forms and display
4. **Block renderer**:
   - Remove `fund_cta` case → component deleted
   - `practice_areas_grid` → rename case to `features_grid`
   - Add `cta_section` case → use `CtaSection` component
5. **Component renames needed** (Agent B does this):
   - `src/components/home/fund-cta.tsx` → `cta-section.tsx`, export `CtaSection`
   - `src/components/home/practice-areas.tsx` → `features-grid.tsx`, export `FeaturesGrid`
   - `src/components/dashboard/block-editor/practice-areas-block-editor.tsx` → `features-grid-block-editor.tsx`
6. **Route deletions needed** (Agent B does this):
   - `src/app/(public)/fund/` — entire directory
   - `src/app/(public)/practice-areas/` — entire directory
   - `src/app/(public)/events/payment/` — entire directory
   - `src/components/fund/` — entire directory
   - `src/components/events/payment-button.tsx`
7. **Ghana region dropdown**: Remove entirely, replace with free-text input for region field
8. **No Paystack**: Payment button is deleted, payment page is deleted
9. **Locale**: `en-US` everywhere (not en-GH)
10. **Currency**: `$` or generic (not GH₵/GHS)
11. **members-map.tsx**: `ghana-regions.ts` import MUST be removed (file deleted). Use `[0, 0]` default center.
12. **Member number prefix**: `MBR-` (was GAPHTO-)

## Phase 1 Backend Files — COMPLETED ✓

The following files have already been cleaned in Phase 1 — do NOT re-edit them:
- drizzle/schema.ts (enums done, fundApplications deleted)
- drizzle/seed.ts (fully rewritten with demo data)
- src/lib/blocks.ts (FeaturesGridContent, CtaSectionContent, no FundCtaContent)
- src/lib/permissions.ts (clean)
- src/lib/audit.ts (clean)
- src/lib/email.ts (clean)
- src/lib/storage.ts (cms-media bucket)
- src/lib/media-url.ts (cms-media)
- src/lib/data.ts (clean, returns empty arrays)
- src/lib/server-data.ts (clean)
- src/lib/seed-blocks.ts (full rewrite, no GAPHTO)
- src/lib/seed-about-blocks.ts (full rewrite, no GAPHTO)
- src/proxy.ts (fund/apply removed, still named proxy.ts)
- src/app/actions/events.ts (price not priceGhs, en-US)
- src/app/actions/event-registration.ts (price not priceGhs, en-US)
- src/app/actions/newsletter.ts (no gaphto.org)
- src/app/actions/auth.ts (MBR- prefix)
- package.json (name: nextjs-cms-template)
- infrastructure/docker-compose.yml (cms_* containers)
- infrastructure/docker-compose.prod.yml (cms_* containers)
- infrastructure/nginx.conf (YOUR_DOMAIN.COM placeholder)
- infrastructure/ecosystem.config.js (cms app name)
- infrastructure/.env.example (clean)
- .env.example (root, clean)

---

## Phase Completion Log

### Phase 0 (Bootstrap) — COMPLETED ✓
- Project copied from gaphto to nextjs-cms-template
- scraper/, scraped-assets/, src/data/, scripts/, plans/, readme/, deploy.sh deleted
- AGENT_CONTEXT.md created

### Phase 1 (Backend) — COMPLETED ✓
- All backend files cleaned (see list above)
- Key decisions: see Enum Decisions section
- Remaining work is ALL in Phase 2 (public pages/components) and Phase 3 (dashboard)

### Phase 3 (Dashboard + Block Editors) — COMPLETED ✓

**Deleted:**
- src/app/(dashboard)/dashboard/fund-applications/ (DELETED)
- src/components/dashboard/fund-application-actions.tsx (DELETED)
- src/components/dashboard/block-editor/fund-cta-block-editor.tsx (DELETED)

**Renamed:**
- practice-areas-block-editor.tsx → features-grid-block-editor.tsx (export: FeaturesGridBlockEditor)

**Modified:**
- src/components/dashboard/sidebar.tsx — removed Fund Applications nav item + Banknote import
- src/app/(dashboard)/dashboard/page.tsx — en-GH → en-US
- src/app/(dashboard)/dashboard/posts/page.tsx — categoryLabels: news/blog/announcement only
- src/app/(dashboard)/dashboard/events/page.tsx — priceGhs → price, GHS → $
- src/components/dashboard/post-editor.tsx — default category 'news', select items updated
- src/components/dashboard/event-form.tsx — priceGhs → price, label updated, GH₵ removed
- src/components/dashboard/page-builder-client.tsx — removed fund/practice-areas from PAGE_LABELS; features_grid + cta_section in BLOCK_TYPE_LABELS and DEFAULT_CONTENT; generic hero/about defaults
- src/components/dashboard/block-editor/block-editor-shell.tsx — removed fund_cta case + import, practice_areas_grid → features_grid, PracticeAreasContent → FeaturesGridContent
- src/components/dashboard/block-editor/about-preview-block-editor.tsx — generic placeholders
- src/components/dashboard/members-map.tsx — removed ghana-regions import, MAP_CENTER [0,0], zoom 2, specialty labels updated

**All dashboard pages and block editors cleaned of GAPHTO/Ghana/fund branding.**

### Phase 2 (Public Pages + Layout) — COMPLETED ✓

**Deleted routes:**
- src/app/(public)/fund/ (DELETED)
- src/app/(public)/practice-areas/ (DELETED)
- src/app/(public)/events/payment/ (DELETED)
- src/components/fund/ (DELETED)
- src/components/events/payment-button.tsx (DELETED)

**Renamed components:**
- fund-cta.tsx → cta-section.tsx (export CtaSection)
- practice-areas.tsx → features-grid.tsx (export FeaturesGrid)

**Modified files:**
- src/app/layout.tsx — metadata uses NEXT_PUBLIC_SITE_NAME env var, locale en_US, generic description
- src/app/robots.ts — baseUrl fallback → localhost:3000
- src/app/sitemap.ts — baseUrl fallback → localhost:3000, removed /fund and /practice-areas routes
- src/components/layout/Logo.tsx — alt and tagline use NEXT_PUBLIC_SITE_NAME
- src/components/layout/footer.tsx — removed GAPHTO Fund/Health News links, generic description, # social links, contact@example.com, generic address, copyright uses NEXT_PUBLIC_SITE_NAME
- src/components/shared/block-renderer.tsx — fund_cta removed, practice_areas_grid → features_grid, FundCta/PracticeAreas → CtaSection/FeaturesGrid, removed fund/practiceAreas from BlockDataSources
- src/components/shared/post-card.tsx — gaphto-news/health-news → news/announcement
- src/components/home/hero-carousel.tsx — CATEGORY_CONFIG updated, generic defaults, NEXT_PUBLIC_SITE_NAME label
- src/components/home/hero-bold.tsx — generic defaults
- src/components/home/hero-centered.tsx — generic defaults, NEXT_PUBLIC_SITE_NAME label
- src/components/home/hero-split.tsx — generic defaults, NEXT_PUBLIC_SITE_NAME label
- src/components/home/news-preview.tsx — category maps updated, generic text
- src/components/home/about-section.tsx — generic heading, alt text, "About Us" label
- src/components/home/leadership-preview.tsx — generic text
- src/components/home/events-preview.tsx — priceGhs → price, GH₵ → $
- src/components/about/about-block-sections.tsx — generic timeline/objectives/focus-areas defaults, removed practice-areas link
- src/components/events/event-registration-form.tsx — priceGhs → price, GH₵ → $, removed payment page redirect
- src/app/(public)/page.tsx — removed getFund/getPracticeAreas, FundCta/PracticeAreas → CtaSection/FeaturesGrid
- src/app/(public)/news/page.tsx — generic description/subtitle
- src/app/(public)/news/news-client.tsx — CATEGORIES updated to news/blog/announcement
- src/app/(public)/news/[slug]/page.tsx — category maps updated
- src/app/(public)/events/page.tsx — generic description/subtitle
- src/app/(public)/events/[slug]/page.tsx — priceGhs → price, GH₵ → $, generic OG description
- src/app/(public)/events/events-list-client.tsx — priceGhs → price, GH₵ → $, generic past events text
- src/app/(public)/about/page.tsx — generic metadata, timeline, objectives, focus areas, hero props
- src/app/(public)/blog/page.tsx — generic metadata/subtitle
- src/app/(public)/contact/page.tsx — generic metadata/subtitle/copy/address
- src/app/(public)/gallery/page.tsx — generic description/subtitle
- src/app/(public)/leadership/page.tsx — generic description/subtitle
- src/app/(public)/leadership/[id]/page.tsx — generic title/description
- src/app/(public)/publications/page.tsx — generic metadata, member-only message
- src/app/(public)/publications/[slug]/page.tsx — generic title/subtitle

**All public pages and home/layout components cleaned of GAPHTO/Ghana branding.**

### Phase 4 (Member Portal + Auth Pages) — COMPLETED ✓

**Auth pages cleaned:** login, register (page + register-form), forgot-password, reset-password, layout

**Member portal cleaned:** layout, member-centre layout, member-centre dashboard, publications, learning, directory, profile

**Member components cleaned:** member-card, member-directory-client, email-preferences-form

**Key changes:**
- Specialty enum values: `general | specialist | associate` (was `disease-control | health-information | nutrition`)
- Region field: free-text Input with debounce (Ghana region Select dropdown removed)
- All GAPHTO branding → `process.env.NEXT_PUBLIC_SITE_NAME ?? 'My CMS'`
- Demo credentials: `member@example.com` / `admin@example.com` (was `@gaphto.org`)
- `src/app/(member)/member-centre/page.tsx`: removed broken `import newsData from "@/data/news.json"` (src/data/ deleted in Phase 0); replaced with empty array placeholder
- Publications sample data: generic titles, year 2024 (was GAPHTO-specific 2016/2017 entries)

**All member portal and auth pages verified clean.**

### Phase 5A (Architecture + Customisation Docs) — COMPLETED ✓
- docs/ARCHITECTURE.md created
- docs/CUSTOMISATION.md created

### Phase 5B (Routes + Components + README docs) — COMPLETED ✓
- docs/ROUTES.md created
- docs/COMPONENTS.md created
- README.md rewritten
- .gitignore updated
