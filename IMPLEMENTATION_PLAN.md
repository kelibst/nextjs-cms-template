# Plan: Extract Next.js 16 CMS Template from GAPHTO

## Context

The GAPHTO project is a production-ready, full-featured CMS + membership platform built with Next.js 16, TypeScript, NextAuth v5, Drizzle ORM + PostgreSQL, MinIO (S3 storage), and shadcn/ui. The user wants to extract a **reusable, generic, well-documented template** from it so future projects can start from a solid foundation instead of from scratch.

**Goal**: Copy GAPHTO to `/home/kelib/Desktop/moreprojects/nextjs-cms-template`, strip all GAPHTO/Ghana-specific content, generalize all domain-specific values, write clean documentation, and verify the template builds and runs cleanly with generic demo seed data.

**Source**: `/home/kelib/Desktop/moreprojects/gaphto`
**Destination**: `/home/kelib/Desktop/moreprojects/nextjs-cms-template`

---

## Agent Architecture & Context Sharing

Two worker agents share state via a context file at the **template root**:

```
nextjs-cms-template/AGENT_CONTEXT.md
```

- **Agent A** — Backend specialist. Owns: DB schema, enums, migrations, lib/, server actions, API routes, Docker, seed data, package.json
- **Agent B** — Frontend specialist. Owns: pages (all route groups), components, layouts, dashboard UI

**Protocol**: Agent A completes Phase 1 first and writes all enum/type decisions to `AGENT_CONTEXT.md`. Agent B **must read `AGENT_CONTEXT.md` before modifying any file** that uses enum values (category selects, specialty dropdowns, block type cases, etc.). Each agent appends a "Phase Completed" section to `AGENT_CONTEXT.md` when done. The PM reviews `AGENT_CONTEXT.md` between phases to catch drift.

**Token efficiency rule**: All agent prompts reference this plan file and `AGENT_CONTEXT.md` by path. Agents do not re-explore the codebase — they use the file inventory in this plan and the shared context file.

---

## What Stays (Template Features)

| Feature | Notes |
|---|---|
| Auth (NextAuth v5, JWT, bcrypt, tokenVersion invalidation) | Core — keep as-is |
| RBAC (super_admin, admin, editor, member) | Core — keep |
| Posts/Blog management | Generalize categories |
| Events management | Rename priceGhs → price |
| Gallery (albums + images) | Keep |
| Publications / Documents | Keep |
| Media manager (MinIO upload + DB metadata) | Keep |
| Page builder (block system) | Generalize 2 block names |
| Navigation management | Keep |
| Site settings | Generalize defaults |
| Contact form + submissions inbox | Keep |
| Member registration + member portal | Generalize specialty enum |
| Newsletter management | Keep |
| Audit logging | Keep (remove payment/fund actions) |
| Announcements | Keep |
| Leadership profiles | Keep |
| Learning platform (courses, lessons, enrollments) | Keep |
| Dashboard UI (sidebar, topbar, all forms) | Keep — strip branding |

## What Gets Removed / Replaced

| Item | Action |
|---|---|
| Fund Applications (table, pages, actions, sidebar link) | DELETE |
| Paystack payment API routes + lib | DELETE |
| WordPress scraper (`scraper/`) | DELETE |
| Scraped data files (`src/data/*.json`, `scraped-assets/`) | DELETE |
| Ghana regions data (`src/lib/ghana-regions.ts`) | DELETE |
| Practice-areas public page | DELETE (component repurposed) |
| `/fund` and `/fund/apply` public pages | DELETE |
| All GAPHTO/Ghana branding strings | REPLACE with generic |
| `gaphto-news`, `health-news` post categories | REPLACE with `news` |
| `disease-control`, `health-information`, `nutrition` specialties | REPLACE with `general`, `specialist`, `associate` |
| `fund_cta` block type | REPLACE with `cta_section` |
| `practice_areas_grid` block type | RENAME to `features_grid` |
| GHS/GH₵ currency, `en-GH` locale | REPLACE with USD/`en-US` |
| Minio bucket `gaphto-media` | RENAME to `cms-media` |
| All 12 old migrations | DELETE — regenerate as single `0000_initial_schema.sql` |
| Old seed (loads scraper JSON) | REWRITE with clean demo data |

---

## Phase Dependency Map

```
Phase 0 — Bootstrap (PM)
  └── Phase 1 — Backend Schema + Lib + Actions (Agent A)
        ├── Phase 2 — Public Pages + Layout (Agent B)  ← parallel with Phase 3
        ├── Phase 3 — Dashboard Pages + Block Editors (Agent A)  ← parallel with Phase 2
        └── Phase 4 — Member Portal + Auth Pages (Agent B)  ← after Phase 2 + 3
              └── Phase 5 — Documentation (Agent A + B in parallel)
                    └── Phase 6 — Final Build Verification (PM with Agent A)
```

---

## Phase 0 — Bootstrap (PM / Agent A first act)

**Who**: PM or first instruction in Agent A's Phase 1 prompt.

**Steps**:
1. `cp -r /home/kelib/Desktop/moreprojects/gaphto /home/kelib/Desktop/moreprojects/nextjs-cms-template`
2. Delete immediately:
   - `scraper/` — WordPress scraper + output JSONs
   - `scraped-assets/` — all scraped images
   - `scripts/migrate-to-minio.ts`
   - `plans/` — GAPHTO internal planning docs
   - `readme/` — GAPHTO-specific docs (will be replaced)
   - `.env` and `.env.local` (keep `.env.example` — Agent A rewrites it)
   - `src/data/` — all scraped JSON files
   - `public/images/posts/`, `public/images/gallery/`, `public/images/documents/`, `public/images/leadership/` — GAPHTO media
   - `bun.lock` — regenerate on first install
3. Create `AGENT_CONTEXT.md` at template root with scaffolded sections (Agent A fills the "decisions" sections)

**Verify**: `ls nextjs-cms-template/` — scraper/, scraped-assets/, src/data/ are gone.

---

## Phase 1 — Backend: Schema, Lib, Actions (Agent A)

**Reads**: This plan file
**Writes**: `AGENT_CONTEXT.md` (decisions section + Phase 1 completion block)

### drizzle/schema.ts
- `postCategoryEnum` → `['news', 'blog', 'announcement']` (drop `gaphto-news`, `health-news`)
- `memberSpecialtyEnum` → `['general', 'specialist', 'associate']`
- `blockTypeEnum` → remove `fund_cta`, rename `practice_areas_grid` → `features_grid`, add `cta_section`
- `events.priceGhs` → `events.price`
- `eventRegistrations.paymentStatus` — **KEEP** (default `'complete'`, serves as payment provider hook point)
- `mediaFiles.bucket` default → `'cms-media'`
- `fundApplications` table → **DELETE ENTIRELY**
- Delete all existing migrations (`drizzle/migrations/0000`–`0012` + meta/). Run `bun run db:generate` to produce single clean `0000_initial_schema.sql`.

### drizzle/seed.ts — COMPLETE REWRITE
Replace all scraper-JSON-loading logic with hardcoded demo data:
- 4 users: `superadmin@example.com`, `admin@example.com`, `editor@example.com`, `member@example.com` (all password `Demo1234!`)
- 2 leadership entries (generic: "Jane Smith, President" / "John Doe, Secretary")
- 3 posts: one each `news`, `blog`, `announcement`
- 1 upcoming event (free, `price: 0`)
- 1 gallery album + 2 placeholder image entries
- 2 publications (one `isMemberOnly: true`, one false)
- 3 site settings: `site_name`, `contact`, `about`
- 2 nav links: Home, About
- Call seed-blocks.ts + seed-navigation.ts seeders

### Files to MODIFY
- `src/lib/storage.ts` — bucket default `'gaphto-media'` → `'cms-media'`, URL default → `'http://localhost:9000/cms-media'`
- `src/lib/media-url.ts` — default URL → `'http://localhost:9000/cms-media'`
- `src/lib/email.ts` — all `'GAPHTO'` strings → `process.env.NEXT_PUBLIC_SITE_NAME ?? 'My CMS'`; `'en-GH'` → `'en-US'`; `'GHS'`/`GH₵` → generic; `admin@gaphto.org` → `'admin@example.com'`
- `src/lib/permissions.ts` — remove `'fund:review'` permission; add `'announcements:manage': ['super_admin', 'admin', 'editor']`
- `src/lib/audit.ts` — remove `'payment.initialized'`, `'payment.verified'`, `'fund.reviewed'` from `AuditAction` union
- `src/lib/data.ts` — remove all JSON imports (scraped data deleted); all fallback functions return empty arrays
- `src/lib/server-data.ts` — `'GAPHTO'` default author → `'Admin'`; `'en-GH'` → `'en-US'`
- `src/lib/blocks.ts` — remove `FundCtaContent` type; rename `PracticeAreasContent` → `FeaturesGridContent`; update `BlockContent` union; update `blockTypeEnum` references
- `src/lib/seed-blocks.ts` — remove scraper JSON imports; replace GAPHTO homepage text with generic placeholders; rename `seedPracticeAreas` → `seedFeaturesGrid`; remove `seedFund`
- `src/lib/seed-about-blocks.ts` — replace Ghana history timeline with generic placeholders
- `src/proxy.ts` — remove `/fund/apply` route check and `isFundApply` logic (**FILE MUST STAY NAMED proxy.ts**)
- `infrastructure/docker-compose.yml` — rename all `gaphto_*` containers/volumes to `cms_*`; update `POSTGRES_USER/DB` to `cms`; `PGADMIN_DEFAULT_EMAIL` → `admin@example.com`
- `.env.example` — full rewrite removing Paystack, WordPress scraper vars; generic defaults (`cms`, `cms-media`, `My CMS`, `example.com`)
- `package.json` — name `'gaphto'` → `'nextjs-cms-template'`; remove scripts: `scrape`, `scrape:xml`, `db:sync-data`

### Files to DELETE
- `src/lib/ghana-regions.ts`
- `src/lib/paystack.ts`
- `src/app/actions/fund.ts`
- `src/app/api/payments/` — entire directory

### Server Actions
- `src/app/actions/events.ts` — `priceGhs` → `price` in `EventInput` type
- `src/app/actions/posts.ts` — category type: remove `'gaphto-news'`, `'health-news'`; add `'news'`
- `src/app/actions/blocks.ts` — remove `fund_cta` validation; `practice_areas_grid` → `features_grid`
- All action files — scan for and replace `'en-GH'` → `'en-US'`, `'gaphto'` branding strings

**Phase 1 Verify**:
- `bun run db:generate` → single clean migration, no GAPHTO strings
- `grep -r "gaphto\|ghana\|paystack\|GHS\|GH₵\|en-GH" src/lib/ src/app/actions/ src/app/api/` → 0 matches

---

## Phase 2 — Frontend: Public Pages + Layout (Agent B)

**Must read first**: `AGENT_CONTEXT.md` (Phase 1 decisions)
**Writes**: `AGENT_CONTEXT.md` (Phase 2 completion block)

### Files to DELETE
- `src/app/(public)/fund/` — entire directory
- `src/app/(public)/practice-areas/` — entire directory
- `src/app/(public)/events/payment/` — entire directory
- `src/components/fund/` — entire directory
- `src/components/events/payment-button.tsx`

### Component Renames
- `src/components/home/fund-cta.tsx` → `cta-section.tsx` (export `CtaSection`; generic CTA defaults; remove loan calculator logic)
- `src/components/home/practice-areas.tsx` → `features-grid.tsx` (export `FeaturesGrid`)

### Files to MODIFY

**Layout & Global**:
- `src/app/layout.tsx` — metadata title/description/locale (`en_GH` → `en_US`); site name reads from `NEXT_PUBLIC_SITE_NAME`; OG URL from `NEXT_PUBLIC_APP_URL`
- `src/components/layout/Logo.tsx` — alt text from env; tagline generic
- `src/components/layout/footer.tsx` — remove fund/health-news links; replace GAPHTO description; copyright uses `NEXT_PUBLIC_SITE_NAME`; social links → `#` placeholder
- `src/app/robots.ts` — remove `gaphto.org`
- `src/app/sitemap.ts` — URL from `NEXT_PUBLIC_APP_URL`

**Homepage + Home Components**:
- `src/app/(public)/page.tsx` — remove `getFund()`, `getPracticeAreas()` calls; remove `FundCta` and `PracticeAreas` component usage; update `BlockDataSources` to not include `fund`/`practiceAreas` keys
- `src/components/shared/block-renderer.tsx` — remove `fund_cta` case; rename `practice_areas_grid` → `features_grid` case; update imports to `CtaSection`, `FeaturesGrid`; remove `fund`/`practiceAreas` from `BlockDataSources` type
- All hero components (`hero-carousel`, `hero-bold`, `hero-centered`, `hero-split`) — remove all GAPHTO strings; generic defaults
- `src/components/home/news-preview.tsx` — `"GAPHTO News"` → `"Latest News"`; `"gaphto-news"` category filter → `"news"`
- `src/components/home/about-section.tsx` — generic heading default
- `src/components/home/leadership-preview.tsx` — generic text
- `src/components/about/about-block-sections.tsx` — remove Ghana-specific content; generic placeholders

**Category & Post Components**:
- `src/components/shared/post-card.tsx` — remove `gaphto-news`/`health-news` from `categoryColors`/`categoryLabels`; add `news`
- `src/app/(public)/news/news-client.tsx` — `CATEGORIES` array: replace with `all | news | blog | announcement`

**Events**:
- `src/app/(public)/events/[slug]/page.tsx` — remove `PaymentButton` import; paid event section → placeholder text; `GH₵`/`en-GH` → USD/`en-US`
- `src/app/(public)/events/events-list-client.tsx` — `GH₵` → `$`; `en-GH` → `en-US`

**Auth Pages**:
- `src/app/(auth)/login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx` — remove GAPHTO branding; register specialty options: `general | specialist | associate`
- `src/app/(auth)/layout.tsx` — remove GAPHTO branding

**Other Public Pages** (metadata/string cleanup):
- `/about`, `/contact`, `/gallery`, `/blog`, `/leadership`, `/publications`, `/events` pages — remove GAPHTO branding from metadata, default descriptions, email fallbacks

**Members Map**:
- `src/components/dashboard/members-map.tsx` — remove `ghana-regions.ts` import; default map center `[0, 0]`, generic zoom

**Phase 2 Verify**:
- `grep -r "gaphto\|GAPHTO\|ghana\|Ghana\|GHS\|GH₵\|fund_cta\|practice_areas_grid" src/app/\(public\)/ src/components/home/ src/components/layout/ src/components/shared/ src/components/about/ src/app/\(auth\)/` → 0 matches
- Routes `/fund` and `/practice-areas` are deleted (no page.tsx exists)

---

## Phase 3 — Dashboard Pages + Block Editors (Agent A)

**Runs in parallel with Phase 2**
**Reads**: `AGENT_CONTEXT.md`
**Writes**: Appends Phase 3 block to `AGENT_CONTEXT.md`

### Files to DELETE
- `src/app/(dashboard)/dashboard/fund-applications/` — entire directory
- `src/components/dashboard/fund-application-actions.tsx`
- `src/components/dashboard/block-editor/fund-cta-block-editor.tsx`

### Block Editor Rename
- `src/components/dashboard/block-editor/practice-areas-block-editor.tsx` → `features-grid-block-editor.tsx`

### Files to MODIFY
- `src/components/dashboard/sidebar.tsx` — remove Fund Applications nav item + `Banknote` icon import; remove GAPHTO text from sidebar header
- `src/components/dashboard/post-editor.tsx` — category select: `news | blog | announcement` only
- `src/components/dashboard/event-form.tsx` — `priceGhs` → `price`; label `"Price (GHS)"` → `"Ticket Price (optional)"`; remove GH₵
- `src/components/dashboard/settings-form.tsx` — generic default values
- `src/components/dashboard/page-builder-client.tsx` — remove `fund_cta` from block type dropdown; `practice_areas_grid` → `features_grid`
- `src/components/dashboard/block-editor/features-grid-block-editor.tsx` — generic language (was practice-areas)
- `src/components/dashboard/block-editor/index.ts` — update exports (remove fund-cta, rename practice-areas)
- `src/components/dashboard/block-editor/block-editor-shell.tsx` — remove `fund_cta` case; `practice_areas_grid` → `features_grid`
- `src/app/(dashboard)/dashboard/posts/page.tsx` — update category labels; `en-GH` → `en-US`
- `src/app/(dashboard)/dashboard/events/page.tsx` — price column: remove GHS; `en-GH` → `en-US`
- `src/app/(dashboard)/dashboard/members/*.tsx` — specialty select: `general | specialist | associate`; region: free-text input (remove Ghana dropdown)

**Phase 3 Verify**:
- `grep -r "fund-applications\|fundApplications\|fund_cta\|practice_areas_grid\|disease-control\|health-information\|nutrition\|gaphto-news\|health-news\|priceGhs\|GHS\|en-GH" src/app/\(dashboard\)/ src/components/dashboard/` → 0 matches

---

## Phase 4 — Member Portal + Auth Pages (Agent B)

**Runs after Phase 2 + Phase 3 complete**
**Reads**: `AGENT_CONTEXT.md`
**Writes**: Appends Phase 4 block to `AGENT_CONTEXT.md`

### Files to MODIFY
- `src/app/(auth)/register/page.tsx` — specialty dropdown uses new enum values from `AGENT_CONTEXT.md`
- `src/components/member/member-card.tsx` — specialty label map: `general | specialist | associate`
- `src/components/member/member-directory-client.tsx` — remove Ghana region dropdown; free-text region search; specialty filter uses new enum
- `src/components/member/edit-profile-form.tsx` — region: free-text input; specialty: new enum; remove `ghana-regions` import
- `src/components/member/email-preferences-form.tsx` — `"Receive GAPHTO newsletter"` → `"Receive newsletter emails"`
- `src/app/(member)/member-centre/` layout and pages — remove GAPHTO branding
- `src/app/(member)/member-centre/directory/page.tsx` — remove Ghana region filter

**Phase 4 Verify**:
- `grep -r "gaphto\|GAPHTO\|ghana\|Ghana\|disease-control\|health-information\|nutrition" src/app/\(member\)/ src/components/member/` → 0 matches

---

## Phase 5 — Documentation (Agent A + Agent B in parallel)

**Runs after Phase 4**
**Both agents write to `/docs/` — no overlap**

### Agent A writes:
- `docs/ARCHITECTURE.md` — auth flow, RBAC matrix, page builder blocks, media upload lifecycle, proxy.ts naming rule
- `docs/CUSTOMISATION.md` — how to add: post category, new block type, RBAC permission, payment provider hook-in

### Agent B writes:
- `docs/ROUTES.md` — full page route table (public, auth, dashboard, member)
- `docs/COMPONENTS.md` — component directory map with annotations

### Both contribute (PM assembles):
- `README.md` — full rewrite: overview, feature list, tech stack, quick start (10 steps), env vars reference, project structure tree, key architecture notes, customisation pointers, deployment notes

### .gitignore
Update: add `/public/images/uploads/`, remove GAPHTO-specific entries

---

## Phase 6 — Final Build Verification (PM with Agent A)

**All phases must be complete before Phase 6**

### Steps
1. `bun install` — clean install
2. `bun run db:up` — Docker services healthy
3. `bun run db:migrate` — single migration applies
4. `bun run db:seed` — demo data inserts
5. `bun run build` — **must be 0 TypeScript errors, 0 build errors**
6. `bun run dev` — starts on port 3000

### Smoke Test Checklist
- `GET /` — homepage loads with page builder blocks
- `GET /news` — 3 demo posts; filter shows `news | blog | announcement`
- `GET /events` — 1 demo event
- `GET /gallery` — 1 demo album
- `POST /login` → `admin@example.com / Demo1234!` → redirects to `/dashboard`
- `GET /dashboard` — stats cards render
- `GET /dashboard/posts/new` — category select: `news | blog | announcement` only
- `GET /fund` → 404
- `GET /practice-areas` → 404

### Final Branding Scan (must return 0 matches)
```bash
grep -r "gaphto\|GAPHTO\|ghana\|Ghana\|paystack\|Paystack\|GHS\|GH₵\|gaphto\.org\|gaphto-media\|en-GH\|en_GH" \
  src/ drizzle/ infrastructure/ .env.example package.json README.md docs/
```

### Git Init
```bash
cd /home/kelib/Desktop/moreprojects/nextjs-cms-template
git init
git add .
git commit -m "chore: initial Next.js CMS template scaffold"
```

---

## Critical Files Reference

| File | Why Critical |
|---|---|
| `drizzle/schema.ts` | All enum decisions cascade to ~40 files. Agent A handles entirely. |
| `src/lib/blocks.ts` | Links schema enum ↔ block-editor components ↔ block-renderer. Cross-agent sync point. |
| `src/proxy.ts` | **Must NEVER be renamed to middleware.ts** — breaks auth silently. |
| `drizzle/seed.ts` | Complete rewrite; wrong values here breaks Phase 6 smoke test. |
| `src/components/shared/block-renderer.tsx` | Integration point between Agent A block changes and Agent B render layer. |
| `AGENT_CONTEXT.md` | Single source of truth for cross-agent decisions. Both agents read before touching shared types. |

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| TypeScript errors from deleted `fundApplications` | Agent A greps all import sites before deleting |
| `proxy.ts` renamed | Explicit check in Phase 6 + note in AGENT_CONTEXT.md |
| Seed references deleted scraper JSONs | Phase 1 rewrites seed.ts completely; data/ deleted after |
| `members-map.tsx` imports deleted `ghana-regions.ts` | Agent B Phase 2 removes import (tracked in component list) |
| `events.priceGhs` rename breaks form/action chain | Agent A renames in schema + action + `EventInput` type together; Agent B renames in `event-form.tsx` |
| Block type mismatch between A and B layers | Both read `AGENT_CONTEXT.md` enum decisions before touching block files |

---

## Template Deliverable Summary

A developer cloning `nextjs-cms-template` gets:
- Full CMS platform with auth, RBAC, posts, events, gallery, publications, media, page builder, navigation, settings, contact, newsletters, announcements, leadership, courses/learning, member portal
- Zero GAPHTO/Ghana content anywhere
- Generic demo seed data (4 users, 3 posts, 1 event, etc.)
- Clean `.env.example` with all required variables documented
- Single baseline migration
- Docker Compose for local Postgres + MinIO
- Comprehensive docs (README, ARCHITECTURE, CUSTOMISATION, ROUTES, COMPONENTS)
- 10-minute onboarding: clone → copy .env.example → docker up → migrate → seed → dev
