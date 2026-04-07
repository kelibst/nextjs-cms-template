# GAPHTO Project — Shared Agent Context
> This file is the single source of truth for all agents working on this project.
> Agents MUST update the STATUS section when they complete work.

---

## ACTIVE TASKS — Page Builder Phases A/B/C/D/E ✅ ALL COMPLETE

| File | Agent | Feature |
|------|-------|---------|
| `plans/TASK_PB_A_FOUNDATION.md` | Agent ✅ | pageBlocks schema + migration + CRUD actions + seed |
| `plans/TASK_PB_B1_BLOCK_EDITORS.md` | Agent 1 ✅ | Block editor components (10 files in block-editor/) |
| `plans/TASK_PB_B2_PAGE_BUILDER_UI.md` | Agent 2 ✅ | Dashboard page builder UI + /content/[page] route |
| `plans/TASK_PB_C_PUBLIC_PAGES.md` | Agent ✅ | Public pages render from pageBlocks with JSON fallback |

**Page Builder key facts:**
- `pageBlocks` table: page, type (blockTypeEnum), sortOrder, content (JSON text), isVisible
- `src/app/actions/blocks.ts` — getPageBlocks, upsertBlock, deleteBlock, reorderBlocks, toggleBlockVisibility
- `src/lib/blocks.ts` — block content types + parseBlockContent<T>() helper
- `src/lib/seed-blocks.ts` — seed: `bunx tsx src/lib/seed-blocks.ts` (9 homepage + 5 about blocks)
- `src/components/dashboard/block-editor/` — all per-type editors + BlockEditorShell (index.ts)
- `src/components/dashboard/page-builder-client.tsx` — reorder, add-block dialog client
- Dashboard: `/dashboard/content` (hub) + `/dashboard/content/[page]` (builder)
- `src/lib/data.ts` — `getBlocksForPage(page)` fetches visible+sorted blocks
- Public pages: read from pageBlocks DB; full JSON fallback if DB empty
- **Phase D (drag-to-reorder) ✅ DONE** — @dnd-kit installed; BlockEditorShell uses useSortable; page-builder-client uses DndContext + arrayMove
- Block types: hero, stats_bar, rich_text, objectives_list, timeline, practice_areas_grid, news_preview, events_preview, leadership_preview, gallery_teaser, fund_cta, image_banner
- Managed pages: homepage (9 blocks), about (5 blocks), fund (3 blocks), practice-areas (2 blocks)
- Dashboard hub at /dashboard/content shows all 4 pages; /dashboard/content/[page] handles homepage|about|fund|practice-areas
- src/components/home/image-banner.tsx — ImageBanner component (for image_banner blocks)
- Homepage has catch-all renderer for extra rich_text + image_banner blocks admins add
- About page Vision & Mission renders as full-width combined card when DB block exists
- To seed a fresh DB: bunx tsx src/lib/seed-blocks.ts
- **DO NOT reference Phase 5 CMS files** — all deleted in Phase A cleanup

---

## COMPLETED TASK FILES (Phase 4 — UX Polish)

| File | Agent | Feature |
|------|-------|---------|
| `plans/TASK_PM4_AGENT1_SIDEBAR_PROFILE.md` | Agent 1 | Retractable sidebar + Profile edit + Password change |
| `plans/TASK_PM4_AGENT2_LEADERSHIP_JOINLINK.md` | Agent 2 | Leadership social links + Profile page + Hero CTA fix |

**Key shared facts for Phase 4:**
- `bcryptjs` is already installed — import as `import bcrypt from 'bcryptjs'`
- Dashboard sidebar is at `src/components/dashboard/sidebar.tsx` — already `'use client'`
- Profile page is at `src/app/(member)/member-centre/profile/page.tsx`
- Server actions go in `src/app/actions/auth.ts` (already has bcrypt + db imports)
- Hero carousel is `'use client'` — pass session state as prop from `src/app/(public)/page.tsx` (make it async)
- Leadership table already has `facebookUrl`, `twitterUrl`, `email` — adding `linkedinUrl`, `instagramUrl`
- Drizzle migration: `bunx drizzle-kit generate --config=drizzle/drizzle.config.ts && bunx tsx drizzle/migrate.ts`
- Public leadership page may use scraped JSON (`src/lib/data.ts`) — **Agent 2 must check this before Task 2**

---

## COMPLETED TASK FILES (Phase 3 — New Features)

| File | Agent | Feature |
|------|-------|---------|
| `plans/TASK_PM3_AGENT1_GIS.md` | Agent 1 | GIS Member Map (react-leaflet, Ghana regions, dashboard + directory) |
| `plans/TASK_PM3_AGENT2_LEARN_NEWSLETTER.md` | Agent 2 | Learning Platform (courses/lessons/enrollments) + Newsletter/Email (Resend batch) |

---

## Page Builder Notes

- `pageBlocks` table exists in DB — schema in `drizzle/schema.ts` (`blockTypeEnum` + `pageBlocks`)
- Migration file: `drizzle/migrations/0007_magical_tempest.sql`
- Seed script: `src/lib/seed-blocks.ts` (run with `bunx tsx src/lib/seed-blocks.ts`)
- Block type definitions + `parseBlockContent` helper: `src/lib/blocks.ts`
- Server actions (getPageBlocks, upsertBlock, deleteBlock, reorderBlocks, toggleBlockVisibility): `src/app/actions/blocks.ts`
- 9 homepage blocks seeded (sortOrder 0–8); 5 about blocks seeded (sortOrder 0–4)
- Public pages (`/`, `/about`) are back on JSON-only data — page builder UI in Phase B will wire them to DB blocks

---

## ⚠️ CRITICAL PROJECT RULES — READ BEFORE WRITING ANY CODE

### 1. MIDDLEWARE — Next.js 16 uses `src/proxy.ts`, NOT `src/middleware.ts`
This project runs Next.js 16 which uses **`src/proxy.ts`** as the middleware entry point.
- **NEVER create `src/middleware.ts`** — it will conflict with `src/proxy.ts` and break the build.
- All route protection logic (auth guards, redirects) goes in `src/proxy.ts`.
- The file already exists and exports a NextAuth `auth` handler with route matchers.
- If you need to add a new protected route, edit `src/proxy.ts` → add to the `config.matcher` array and add the guard logic inside the handler.

### 2. Package manager: `bun` (not npm/yarn/pnpm)
Always use `bun add`, `bun run`, `bunx` — never `npm` or `npx`.

### 3. Migration command
```bash
bunx drizzle-kit generate --config=drizzle/drizzle.config.ts
bunx tsx drizzle/migrate.ts
```

---

## PROJECT SUMMARY
Migrating **gaphto.org** (WordPress + WooCommerce + CiviCRM) to a modern stack:
- **Frontend/API:** Next.js 16, TypeScript, Shadcn/ui, Tailwind CSS
- **Database:** PostgreSQL (via Docker), Drizzle ORM
- **Auth:** NextAuth.js v5
- **Current Phase:** Phase 0 — Infrastructure + Data Scraping

---

## WORKING DIRECTORY
```
/home/kelib/Desktop/moreprojects/gaphto/
├── plans/
│   ├── migration-plan.md      ← Full project plan (READ THIS)
│   ├── AGENT_CONTEXT.md       ← THIS FILE
│   ├── TASK_AGENT_1.md        ← Infrastructure agent task brief
│   └── TASK_AGENT_2.md        ← Scraper agent task brief
├── scraper/                   ← Agent 2 creates this
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── scrape-news.ts
│   │   ├── scrape-leadership.ts
│   │   ├── scrape-gallery.ts
│   │   ├── scrape-about.ts
│   │   ├── scrape-events.ts
│   │   ├── scrape-contact.ts
│   │   ├── scrape-fund.ts
│   │   └── download-images.ts
│   └── output/                ← JSON output files land here
│       ├── news.json
│       ├── health-news.json
│       ├── blog.json
│       ├── leadership.json
│       ├── gallery.json
│       ├── about.json
│       ├── events.json
│       └── contact.json
├── scraped-assets/            ← Downloaded images land here
│   ├── gallery/
│   ├── leadership/
│   └── posts/
├── infrastructure/            ← Agent 1 creates this
│   ├── docker-compose.yml
│   └── .env.example
└── drizzle/                   ← Agent 1 creates this
    ├── schema.ts
    ├── migrate.ts
    ├── seed.ts
    └── drizzle.config.ts
```

---

## TARGET WEBSITE
- **URL:** https://www.gaphto.org/
- **Platform:** WordPress (confirmed via /wp-login.php)
- **Sitemap:** https://www.gaphto.org/sitemap.xml

### Pages to Scrape
| Content          | URL Pattern                          | Notes                              |
|------------------|--------------------------------------|------------------------------------|
| Leadership       | /leadership/                         | 12 executives, structured HTML     |
| GAPHTO News      | /gaphto-news/ + /gaphto-news/page/N/ | 43+ articles, paginated            |
| Health News      | /health-news/ + /health-news/page/N/ | ~15 articles                       |
| Blog             | /blog/ + /blog/page/N/               | ~20+ posts                         |
| About Background | /about-us/background/                | Static page                        |
| About Aims       | /about-us/aims-objectives/           | Static page, has 6 objectives      |
| Disease Control  | /disease-control-prevention/         | Practice area page                 |
| Health Info Mgmt | /health-information-management/      | Practice area page                 |
| Nutrition        | /nutrition/                          | Practice area page                 |
| Contact          | /contact-us/                         | Extract structured contact info    |
| GAPHTO Fund      | /gaphto-fund/                        | Fund overview + PDF link           |
| Gallery          | /gallery/ + individual album pages   | Images, captions, album names      |
| Events           | /cpd-registration/                   | Event details (even if expired)    |

### Known 404 pages (skip these)
/about-us/, /the-media/, /member-centre/, /nominations-open/, /gaphto-journal/,
/member-forum/, /career-guidance/, /events/, /accounts/, /privacy-policy/

---

## DATABASE SCHEMA (Summary)
Full SQL in migration-plan.md Section 4. Tables:
- `users` (id, email, password_hash, name, role)
- `posts` (id, slug, title, content, excerpt, category, status, featured_image, author_id, published_at)
- `tags` + `post_tags`
- `events` (id, title, slug, description, location, is_online, start_date, price_ghs, status)
- `event_registrations`
- `leadership` (id, name, role, image_url, bio, facebook_url, sort_order, is_active)
- `gallery_albums` + `gallery_images`
- `publications`
- `members` (id, user_id, member_number, specialty, region, facility, membership_status)
- `announcements`
- `contact_submissions`

---

## JSON OUTPUT SCHEMAS (Agent 2 must conform to these)

### posts (news, health-news, blog)
```json
{
  "slug": "string",
  "title": "string",
  "content": "string (HTML)",
  "excerpt": "string",
  "date": "YYYY-MM-DD",
  "category": "gaphto-news | health-news | blog",
  "author": "string",
  "featuredImage": "string (original URL)",
  "localImage": "string (path under scraped-assets/)",
  "tags": ["string"],
  "sourceUrl": "string"
}
```

### leadership
```json
{
  "name": "string",
  "role": "string",
  "imageUrl": "string (original URL)",
  "localImage": "string (path under scraped-assets/leadership/)",
  "bio": "string | null",
  "facebookUrl": "string | null",
  "sortOrder": "number"
}
```

### gallery
```json
{
  "albumTitle": "string",
  "albumSlug": "string",
  "eventDate": "YYYY-MM-DD | null",
  "images": [
    {
      "url": "string (original URL)",
      "localPath": "string (scraped-assets/gallery/album-slug/filename)",
      "caption": "string | null",
      "sortOrder": "number"
    }
  ]
}
```

### about
```json
{
  "background": "string (HTML content)",
  "aimsObjectives": "string (HTML content)",
  "vision": "string",
  "mission": "string",
  "objectives": ["string"]
}
```

### contact
```json
{
  "phone": "string",
  "email": "string",
  "address": "string",
  "facebook": "string",
  "twitter": "string",
  "youtube": "string"
}
```

### events
```json
{
  "title": "string",
  "slug": "string",
  "description": "string (HTML)",
  "location": "string | null",
  "isOnline": "boolean",
  "startDate": "ISO 8601 | null",
  "endDate": "ISO 8601 | null",
  "priceGhs": "number",
  "status": "upcoming | past | cancelled",
  "featuredImage": "string | null",
  "sourceUrl": "string"
}
```

### practiceAreas
```json
[
  {
    "slug": "disease-control-prevention",
    "title": "string",
    "content": "string (HTML)",
    "roles": ["string"]
  }
]
```

---

## ROLES & PERMISSIONS (for Drizzle seed + future auth)
```
super_admin → admin → editor → member → public
```
The seed script should create one user per role for testing:
- superadmin@gaphto.org / password: Test1234!
- admin@gaphto.org / password: Test1234!
- editor@gaphto.org / password: Test1234!
- member@gaphto.org / password: Test1234!

---

## DOCKER / ENV
```
DATABASE_URL="postgresql://gaphto:gaphto_secret@localhost:5432/gaphto"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

---

## AGENT STATUS LOG
> Agents update this section when tasks are complete.

| Agent | Task | Status | Notes |
|-------|------|--------|-------|
| Agent 1 | Infrastructure (docker, drizzle schema, seed) | DONE | infrastructure/docker-compose.yml, infrastructure/.env.example, drizzle/schema.ts, drizzle/drizzle.config.ts, drizzle/migrate.ts, drizzle/seed.ts, package.json |
| Agent 2 | Scraper scripts + run scrape | DONE | REST API: 12 gaphto-news, 10 health-news, 20 blog posts. HTML pages (leadership, gallery, contact, about, events, fund, practice-areas) return 403 — site blocks direct HTML scraping. Images also 403. All 8 scrapers resilient and completed. |
| Agent 2 | REST API deep scrape (Phase 2) | DONE | Via wp-json/wp/v2: leadership.json (12 members, all with images), gallery.json (2 albums: 2017 AGC 12 images + 2016 AGC 16 images), about.json (background + vision + mission + 6 objectives), contact.json (email + facebook), fund.json (PDF link), practice-areas.json (3 areas), media-all.json (153 items), events.json (4 events). 28 gallery images + 12 leadership photos downloaded to scraped-assets/. Scraper: src/scrape-via-rest-api.ts |
| Agent 1 | Phase 1 — Foundation + Homepage | DONE | src/data/*.json (10 files), public/images/placeholder.jpg, src/lib/data.ts (updated: added getNews, getHealthNews, getBlogPosts, getEvents, getFund, getGalleryAlbums), src/components/ui/carousel.tsx, src/components/layout/header.tsx, src/components/layout/footer.tsx, src/app/layout.tsx (updated: Header+Footer+metadata), src/app/page.tsx (full homepage), src/components/home/hero-carousel.tsx, src/components/home/stats-bar.tsx, src/components/home/news-preview.tsx, src/components/home/events-preview.tsx, src/components/home/practice-areas.tsx, src/components/home/leadership-preview.tsx, src/components/home/gallery-teaser.tsx, src/components/home/about-section.tsx, src/components/home/fund-cta.tsx, next.config.ts (images.remotePatterns). Build: ✓ 53 pages, 0 errors. |
| Agent 2 | Phase 1 — Content pages | DONE | src/lib/data.ts, src/data/*.json (9 files), public/images/ (leadership + gallery assets), src/components/ui/card.tsx, src/components/ui/badge.tsx, src/components/ui/separator.tsx, src/components/ui/avatar.tsx, src/components/ui/dialog.tsx, src/components/shared/page-header.tsx, src/components/shared/post-card.tsx, src/app/news/page.tsx, src/app/news/news-client.tsx, src/app/news/[slug]/page.tsx, src/app/leadership/page.tsx, src/app/leadership/leadership-grid.tsx, src/app/gallery/page.tsx, src/app/gallery/gallery-client.tsx, src/app/about/page.tsx, src/app/contact/page.tsx, src/app/contact/contact-form.tsx, src/app/api/contact/route.ts, src/app/practice-areas/page.tsx; also updated src/app/layout.tsx metadata + src/app/globals.css (@plugin @tailwindcss/typography). Build: 53 pages, 0 errors. |

## PHASE 1 CONTEXT

### Stack
- Next.js 16.2.2, React 19, TypeScript, Tailwind CSS v4, Shadcn/ui
- Package manager: bun
- Root: /home/kelib/Desktop/moreprojects/gaphto/
- Path alias: @/* → src/*
- Shadcn installed: button.tsx only (agents add more)

### Brand colors
- Primary: green-800 / green-700 / green-600
- Dark backgrounds: green-950 or slate-900

### Data source for showcase
Read JSON directly — import from '@/data/filename.json' in Server Components.
Copy scraped JSON to src/data/ and images to public/images/ before building.

### Agent 1 builds (DO NOT overlap)
src/app/page.tsx, src/components/home/*, src/components/layout/*, src/lib/data.ts, src/data/

### Agent 2 builds (DO NOT overlap)
src/app/news/**, src/app/leadership/**, src/app/gallery/**, src/app/about/**, src/app/contact/**, src/app/practice-areas/**, src/app/api/contact/**, src/components/shared/**
| Agent 1 | Phase 2 — Auth infrastructure (NextAuth, DB, middleware) | DONE | src/auth.ts (NextAuth v5 credentials + bcrypt), src/lib/db.ts (Drizzle + pg Pool), src/app/api/auth/[...nextauth]/route.ts, src/types/next-auth.d.ts, src/middleware.ts (JWT protection for /member-centre /publications /dashboard), src/components/providers.tsx (SessionProvider), src/app/layout.tsx (Providers wrapper + await auth()), src/components/layout/header.tsx (auth-aware header with user dropdown), src/components/ui/dropdown-menu.tsx. DB runs on port 5434 (5432 taken). Migrations run, 4 test users seeded. TSC: 0 errors. |
| Agent 2 | Phase 2 — Auth UI pages (login, register, member centre) | DONE | src/auth.ts (stub), src/lib/db.ts (stub + schema re-exports), src/types/next-auth.d.ts, src/components/ui/input.tsx, src/components/ui/label.tsx, src/components/ui/tooltip.tsx, src/components/ui/select.tsx, src/app/(auth)/layout.tsx, src/app/(auth)/login/page.tsx, src/app/(auth)/login/login-form.tsx, src/app/(auth)/register/page.tsx, src/app/(auth)/register/register-form.tsx, src/app/api/auth/register/route.ts, src/app/actions/auth.ts, src/app/(member)/layout.tsx, src/app/(member)/member-centre/page.tsx, src/app/(member)/member-centre/profile/page.tsx, src/app/(member)/member-centre/publications/page.tsx, src/app/publications/page.tsx. TSC: 0 errors. |
| Agent A | Phase 3 — TanStack Query infrastructure + fetch forms | DONE | src/lib/api.ts (new), providers.tsx (QueryClientProvider), layout.tsx (Toaster), post-editor.tsx, leadership-form.tsx, event-form.tsx, publication-form.tsx, album-form.tsx, gallery-image-manager.tsx refactored. Build: 0 errors. |
| Agent B | Phase 3 — TanStack Query server-action components | DONE | settings-form.tsx, new-announcement-sheet.tsx, member-status-toggle.tsx, contact-inbox.tsx, post-delete-button.tsx, leadership-delete-button.tsx, event-delete-button.tsx, album-delete-button.tsx, publication-delete-button.tsx, announcement-actions.tsx refactored. All confirm() dialogs replaced with Dialog component. Also fixed pre-existing broken @/../../drizzle/schema imports in 5 server pages (replaced with @/lib/db). Build: 0 errors. |
| PM2 Agent 1 | Forms → Server Actions (post-editor, leadership-form, publication-form) | DONE | Replaced apiRequest('/api/posts'), apiRequest('/api/leadership'), apiRequest('/api/publications') in mutationFn with direct createPost/updatePost, createLeadership/updateLeadership, createPublication/updatePublication server action calls. Removed ApiError imports; kept apiRequest import (still used for /api/upload). Changed err instanceof ApiError → err instanceof Error in all onError handlers. TSC: 0 errors. |
| PM2 Agent 2 | Forms → Server Actions (event-form, album-form, gallery-image-manager) | DONE | Replaced apiRequest('/api/events/...') with createEvent/updateEvent from @/app/actions/events; apiRequest('/api/gallery/...') with createAlbum/updateAlbum from @/app/actions/gallery; addImageToAlbum, updateImageCaption, updateImageOrder server actions in gallery-image-manager. Kept apiRequest for /api/upload calls and deleteMutation (leave it per task brief). Removed ApiError imports. Changed err instanceof ApiError → err instanceof Error. TSC: 0 errors. |
| PM2 Phase 5A Agent 1 | SEO + Sitemap | DONE | src/app/sitemap.ts (dynamic sitemap: static routes + DB posts+events with graceful fallback if DB unavailable), src/app/robots.ts (robots.txt with dashboard+api disallow), src/app/layout.tsx (enhanced metadata: OG type/locale/url/siteName/image + twitter card), src/app/news/[slug]/page.tsx (generateMetadata enhanced with OG article fields + image), src/app/gallery/page.tsx (metadata title/description updated to match spec). TSC: 0 errors. |
| PM2 Phase 5A Agent 2 | Public Events Page + Registration | DONE | src/app/events/page.tsx (Server Component, DB query for upcoming/past split, OG metadata), src/app/events/events-list-client.tsx (framer-motion card grid with upcoming + past sections), src/app/events/[slug]/page.tsx (detail page with hero image overlay, sidebar infobox, generateMetadata with OG, inline + sidebar registration form), src/components/events/event-registration-form.tsx ('use client', useMutation + sonner toast + registered success card), src/app/actions/event-registration.ts (server action: duplicate email check, capacity check, insert with paymentStatus). Header already had Events nav link — not touched. TSC: 0 errors. |
| PM2 Phase 5B Agent 1 | Email Integration (Resend) | DONE | resend@6.10.0 installed. src/lib/email.ts (sendContactAcknowledgement, sendContactNotification, sendEventRegistrationConfirmation — typed helpers). src/app/api/contact/route.ts updated: inserts into contactSubmissions table then sends both emails in separate try/catch (email failures do NOT block 200 response). src/app/actions/event-registration.ts updated: sends confirmation email in try/catch after successful DB insert. TSC: 0 errors. Requires RESEND_API_KEY and ADMIN_EMAIL in .env.local. |
| PM2 Phase 5B Agent 2 | Member Directory | DONE | src/app/(member)/member-centre/directory/page.tsx (Server Component: members JOIN users, filtered by q/specialty/region searchParams, graceful DB fallback), src/components/member/member-directory-client.tsx ('use client': search input with 300ms debounce, specialty + region Select filters — all update URL params so Server Component re-renders), src/components/member/member-card.tsx (Avatar initials, specialty badge, region/facility rows, membership status badge). Added Member Directory nav link + quick link to src/app/(member)/member-centre/page.tsx. TSC: 0 errors. |
| Agent A | Phase 3b — Theme: foundation + public pages | DONE | globals.css (primary=green, 4 new tokens), providers.tsx (ThemeProvider), layout.tsx (suppressHydrationWarning), theme-toggle.tsx (new), header.tsx + footer.tsx, all home components, all public pages. Build: 0 errors. |
| Agent B | Phase 3b — Theme: dashboard components + pages | DONE | sidebar, topbar, data-table, all dashboard form components (colors only), contact-inbox, settings-form, delete buttons (dark: variants), announcement-actions, all dashboard pages refactored. Build: 0 errors. |
| PM2 Phase 5C Agent 1 | Paystack Payment Integration | DONE | drizzle/schema.ts (paymentReference column added to eventRegistrations), drizzle/migrations/0001_magenta_red_ghost.sql (generated + applied), src/lib/paystack.ts (initializePayment + verifyPayment fetch helpers), src/app/api/payments/initialize/route.ts (POST: lookup registration+event, call Paystack, return authorizationUrl), src/app/api/payments/verify/route.ts (GET: verify payment, update DB paymentStatus+paymentReference, redirect to event page), src/app/events/payment/[registrationId]/page.tsx (Server Component: shows event title/date, registrant details, amount), src/components/events/payment-button.tsx ('use client': POST to /api/payments/initialize then window.location.href). event-registration.ts already returns requiresPayment+registrationId — no change needed. event-registration-form.tsx already redirects to /events/payment/[registrationId] — no change needed. TSC: 0 errors. Requires PAYSTACK_SECRET_KEY, PAYSTACK_PUBLIC_KEY, NEXT_PUBLIC_APP_URL in .env.local. |
| PM2 Phase 5C Agent 2 | Fund Loan Application | DONE | drizzle/schema.ts (fundApplications table + FundApplication/NewFundApplication types), drizzle/migrations/0002_rich_silver_surfer.sql (generated + applied), src/app/actions/fund.ts (submitLoanApplication + reviewApplication with RBAC + revalidatePath), src/app/fund/page.tsx (public info page: loan details, eligibility checklist, LoanCalculator, CTA), src/components/fund/loan-calculator.tsx ('use client' controlled+uncontrolled calculator, real-time simple interest formula), src/app/fund/apply/page.tsx (auth-gated Server Component, redirects unauthenticated to login), src/components/fund/fund-application-form.tsx ('use client' useMutation form with 16 Ghana regions, inline calculator sync), src/app/(dashboard)/dashboard/fund-applications/page.tsx (stats bar + full table with reviewer join), src/components/dashboard/fund-application-actions.tsx ('use client' Approve/Reject/Review buttons with Dialog + notes), sidebar.tsx (Banknote icon + Fund Applications link in People group). TSC: 0 errors. |
| PM2 Phase 5D | Analytics + Sitemap update | DONE | @next/third-parties@16.2.2 installed. src/app/layout.tsx (GoogleAnalytics conditional on NEXT_PUBLIC_GA_ID). src/app/sitemap.ts (/fund/apply + /member-centre/directory routes added; /fund priority corrected to 0.7). src/lib/email.ts (lazy Resend init — fixed pre-existing build crash when RESEND_API_KEY absent). TSC: 0 errors. Build: ✓ 81 pages. |
| PM2 Dashboard Agent 2 | Layout fix + Dark Mode + Profile Links | DONE | src/app/layout.tsx (stripped Header+Footer), src/app/(public)/layout.tsx (new: Header+main wrapper+Footer), all public dirs moved into (public)/ route group (page.tsx, news, about, leadership, gallery, events, contact, practice-areas, fund, publications). src/components/dashboard/topbar.tsx (ThemeToggle + DropdownMenu with avatar, My Profile, Settings, Sign Out). src/components/dashboard/sidebar.tsx (user prop added, user profile card with initials avatar above Back to site). src/app/(dashboard)/layout.tsx (passes user name+email to sidebar). Also fixed pre-existing build blocker: merged middleware.ts into proxy.ts (src/middleware.ts renamed .bak), eliminating Next.js 16 Turbopack dual-middleware conflict. Build: ✓ 83 pages, 0 errors. |
| PM2 Auth Agent 1 | Forgot Password + Middleware | DONE | drizzle/schema.ts (passwordResetToken + passwordResetTokenExpiry columns added to users table), drizzle/migrations/0003_third_scalphunter.sql (generated + applied), src/lib/email.ts (sendPasswordResetEmail added), src/app/actions/auth.ts (requestPasswordReset + resetPassword server actions added), src/app/(auth)/forgot-password/page.tsx (NEW), src/app/(auth)/forgot-password/forgot-password-form.tsx (NEW — useMutation + green checkmark success state), src/app/(auth)/reset-password/page.tsx (NEW — reads token searchParam, shows error if missing), src/app/(auth)/reset-password/reset-password-form.tsx (NEW — show/hide password, confirm match, useMutation), src/app/(auth)/login/login-form.tsx (href="#" → href="/forgot-password"), src/middleware.ts (NEW — JWT route protection: /dashboard requires admin role, /member-centre + /publications + /fund/apply require session; fixed import to named { authConfig }). TSC: 0 errors. Build: ✓ 83 pages, 0 errors. |
| API Cleanup Agent 1 | Delete 16 dead routes + gallery delete migration | DONE | Deleted src/app/api/{posts,events,leadership,publications,announcements,members,settings} and src/app/api/contact/[id] and entire src/app/api/gallery/. Migrated gallery-image-manager.tsx deleteMutation from apiRequest('/api/gallery/...') to deleteGalleryImage(albumId, imageId) server action. Added deleteGalleryImage to import from @/app/actions/gallery. Cleared stale .next/ cache (it held TS validator refs to deleted routes). TSC: 0 errors. Remaining API routes: auth/[...nextauth], auth/register, contact, payments/initialize, payments/verify, upload. |
| API Cleanup Agent 2 | submitContactForm + registerUser server actions, migrate 2 forms, delete 2 routes | DONE | Added submitContactForm to src/app/actions/contact.ts (no auth, fires ack+notification emails fire-and-forget). Migrated src/app/(public)/contact/contact-form.tsx off fetch('/api/contact'). Added registerUser to src/app/actions/auth.ts (bcrypt hash, duplicate email check, inserts user+member rows; specialty cast to enum). Migrated src/app/(auth)/register/register-form.tsx off fetch('/api/auth/register'). Deleted src/app/api/contact/route.ts and src/app/api/auth/register/route.ts. TSC: 0 errors. Remaining API routes: auth/[...nextauth], payments/initialize, payments/verify, upload (4 files). |
| Phase 5 Agent 1 | Content actions + public page DB integration | DONE | src/app/actions/content.ts (getPageContent + savePageContent), src/lib/data.ts (getContentMap added), src/app/(public)/page.tsx (async, fetches 18 homepage keys, passes props to all home sections), src/app/(public)/about/page.tsx (async, fetches 6 about keys, JSON.parse fallbacks for objectives/timeline/practice_areas), 9 home components updated with optional heading/content props (hero-carousel, stats-bar, news-preview, events-preview, practice-areas, leadership-preview, gallery-teaser, about-section, fund-cta). No DB migration needed. |

## PHASE 5 — COMPLETE (2026-04-04)
All Phase 5 features shipped:
- 5A: SEO sitemap, robots.txt, OG metadata, public events page + registration
- 5B: Resend email (contact form + event confirmations), member directory
- 5C: Paystack payment for events, GAPHTO Fund loan application + dashboard review
- 5D: Google Analytics, sitemap updated
Pending Phase 4: WordPress DB migration (awaiting MySQL dump from client)

## PHASE 2 CONTEXT

### Auth stack
- next-auth@beta (v5) with JWT strategy
- Credentials provider (email + bcrypt password)
- Custom Drizzle queries — no @auth/drizzle-adapter
- src/auth.ts — exports: handlers, auth, signIn, signOut
- src/lib/db.ts — exports: db (Drizzle + pg Pool)

### Route groups
- src/app/(auth)/ — login, register (no layout header/footer)
- src/app/(member)/ — member-centre, publications (requires session)

### Protected routes (middleware)
- /member-centre/** → requires any authenticated session
- /publications/* (member route) → requires any authenticated session
- /dashboard/** → requires role: super_admin | admin | editor

### Test credentials (seeded)
- member@gaphto.org / Test1234!
- editor@gaphto.org / Test1234!
- admin@gaphto.org / Test1234!
- superadmin@gaphto.org / Test1234!

### DB
- Docker: docker compose -f infrastructure/docker-compose.yml up -d
- Credentials: postgresql://gaphto:gaphto_secret@localhost:5432/gaphto
- .env.local must exist with DATABASE_URL + NEXTAUTH_SECRET + NEXTAUTH_URL

---

## PHASE 3b — THEME SYSTEM CONTEXT

### Why
599 hardcoded Tailwind color classes (green-*, gray-*, status badges). Dark mode CSS is defined but dead (no ThemeProvider, no toggle). `--primary` token was gray — must become GAPHTO green so all shadcn utilities work correctly.

### Packages added (Agent A installs)
- `next-themes` — runtime dark/light/system toggle

### New CSS tokens in globals.css (Agent A sets these)
```css
/* :root additions */
--primary: oklch(0.527 0.154 150.069)        /* green-700 — replaces gray */
--primary-foreground: oklch(1 0 0)
--primary-hover: oklch(0.448 0.119 151.328)  /* green-800 */
--primary-subtle: oklch(0.982 0.018 155.826) /* green-50 */
--primary-muted: oklch(0.962 0.044 156.743)  /* green-100 */
--primary-deep: oklch(0.206 0.074 152.934)   /* green-950 */

/* .dark overrides */
--primary: oklch(0.696 0.17 162.48)          /* emerald-400 */
--primary-deep: same as light (sidebar always dark)

/* @theme inline additions */
--color-primary-hover: var(--primary-hover)
--color-primary-subtle: var(--primary-subtle)
--color-primary-muted: var(--primary-muted)
--color-primary-deep: var(--primary-deep)
```

### Provider changes (Agent A)
- `providers.tsx` — `ThemeProvider attribute="class" defaultTheme="system" enableSystem` wraps everything (outermost)
- `layout.tsx` — `suppressHydrationWarning` added to `<html>` tag

### New component (Agent A)
`src/components/shared/theme-toggle.tsx` — Sun/Moon icon toggle via `useTheme()`, placed in `header.tsx`

### Color replacement rules (canonical reference)
```
Brand green → primary tokens:
  bg-green-950 → bg-primary-deep
  bg-green-800/hover:bg-green-800 → bg-primary-hover/hover:bg-primary-hover
  bg-green-700 → bg-primary
  bg-green-100 → bg-primary-muted
  bg-green-50  → bg-primary-subtle
  text-green-700/600 → text-primary
  text-green-800 → text-primary/80
  text-green-300/200/100 → text-primary-foreground/70/60/80 (inside dark-bg)
  border-green-* → border-primary equivalents

Gray neutrals → semantic tokens:
  bg-white (content) → bg-background or bg-card
  bg-gray-50 → bg-muted/50
  bg-gray-100 → bg-muted
  text-gray-900 → text-foreground
  text-gray-700 → text-foreground/80
  text-gray-600/500 → text-muted-foreground
  text-gray-400 → text-muted-foreground/70
  border-gray-200 → border-border
  border-gray-100 → border-border/50

Status badges — keep palette, add dark: variants:
  bg-green-100 text-green-700 → + dark:bg-green-900/30 dark:text-green-400
  bg-red-100 text-red-600    → + dark:bg-red-900/30 dark:text-red-400
  bg-blue-100 text-blue-700  → + dark:bg-blue-900/30 dark:text-blue-400
  bg-amber-100 text-amber-800 → + dark:bg-amber-900/30 dark:text-amber-400
  bg-purple-100 text-purple-700 → + dark:bg-purple-900/30 dark:text-purple-400
  bg-gray-100 text-gray-600 → bg-muted text-muted-foreground (auto-adapts, no dark: needed)
```

### Sidebar rule
`bg-primary-deep` is intentionally the SAME value in light and dark mode.
Sidebar is permanently deep green. Do NOT add dark: variants to sidebar classes.

### Agent A owns (foundation + public pages) — runs FIRST
globals.css, providers.tsx, layout.tsx,
NEW: src/components/shared/theme-toggle.tsx,
src/components/layout/header.tsx + footer.tsx,
src/components/home/*.tsx (all 9 files),
src/app/page.tsx,
src/components/shared/page-header.tsx,
src/app/news/**, src/app/leadership/**, src/app/gallery/**,
src/app/(auth)/login/login-form.tsx, src/app/(auth)/register/register-form.tsx,
src/app/(member)/**,
src/app/about/**, src/app/contact/**, src/app/practice-areas/**, src/app/publications/**

### Agent B owns (dashboard) — starts AFTER Agent A commits globals.css
src/components/dashboard/sidebar.tsx, topbar.tsx, data-table.tsx,
post-editor.tsx, leadership-form.tsx, event-form.tsx, publication-form.tsx, album-form.tsx, gallery-image-manager.tsx,
settings-form.tsx, new-announcement-sheet.tsx, member-status-toggle.tsx, contact-inbox.tsx — COLORS ONLY (no state changes),
all *-delete-button.tsx + announcement-actions.tsx — add dark:hover:bg-red-950/30 only,
src/app/(dashboard)/layout.tsx,
ALL src/app/(dashboard)/dashboard/**/*.tsx page files

### Do NOT touch (either agent)
src/app/actions/**, src/app/api/**, drizzle/**, src/auth.ts, src/lib/db.ts

---

## PHASE 3 — TANSTACK QUERY INTEGRATION CONTEXT

### Why
All 15+ dashboard Client Components manage mutations with raw `useState(saving/error/saved)`, call `fetch()` without checking `res.ok`, and give no user feedback on failure. Adding `@tanstack/react-query` + `sonner` standardises mutation handling before more dashboard forms are built.

### Packages added (Agent A installs these)
- `@tanstack/react-query` — useMutation for all client-side mutations
- `@tanstack/react-query-devtools` (devDependency) — dev panel
- `sonner` — toast notifications (success/error)

### New shared utility (Agent A creates, Agent B reads)
`src/lib/api.ts` — `apiRequest<T>(url, options)` helper + `ApiError` class
- Throws `ApiError(status, message)` on non-ok responses
- Auto-sets `Content-Type: application/json` unless body is FormData
- Used by all components that call API routes via fetch()
- Agent B does NOT use apiRequest — server actions need no fetch helper

### Provider changes (Agent A)
`src/components/providers.tsx` — wrapped with `QueryClientProvider`
- QueryClient config: `staleTime: Infinity`, `refetchOnWindowFocus: false`, `retry: false`
- Devtools only in `process.env.NODE_ENV === 'development'`
`src/app/layout.tsx` — `<Toaster position="bottom-right" richColors />` added as sibling of Providers

### Core useMutation pattern
```typescript
// For fetch()-based mutations (Agent A components)
const mutation = useMutation({
  mutationFn: (body: BodyType) => apiRequest<ResultType>(url, { method: 'POST', body: JSON.stringify(body) }),
  onSuccess: () => { toast.success('Saved'); router.push('/dashboard/...') },
  onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
})
// disabled={mutation.isPending} on the save button

// For server action mutations (Agent B components)
const mutation = useMutation({
  mutationFn: () => serverAction(id),
  onSuccess: () => { toast.success('Done'); router.refresh() },  // router.refresh() when staying on same page
  onError: () => toast.error('Failed'),
})
```

### Router refresh rule
- Form that navigates away → `router.push('/dashboard/...')` in onSuccess
- Component that stays on same page (toggle, delete, inbox) → `router.refresh()` in onSuccess
- Server actions call `revalidatePath()` internally; `router.refresh()` triggers the RSC re-fetch in the browser

### Delete button normalisation
All delete buttons must use Dialog component (not `confirm()`). Reference: `post-delete-button.tsx`.
Apply to: leadership-delete-button, event-delete-button, album-delete-button, publication-delete-button, announcement-actions.

### Agent A owns (fetch-based forms)
`src/lib/api.ts` (NEW), `src/components/providers.tsx`, `src/app/layout.tsx`,
`post-editor.tsx`, `leadership-form.tsx`, `event-form.tsx`, `publication-form.tsx`, `album-form.tsx`, `gallery-image-manager.tsx`

### Agent B owns (server-action components) — starts AFTER Agent A commits providers.tsx
`settings-form.tsx`, `new-announcement-sheet.tsx`, `member-status-toggle.tsx`, `contact-inbox.tsx`,
`post-delete-button.tsx`, `leadership-delete-button.tsx`, `event-delete-button.tsx`,
`album-delete-button.tsx`, `publication-delete-button.tsx`, `announcement-actions.tsx`

### Do NOT touch (either agent)
`src/app/actions/**`, `src/app/api/**`, all Server Component pages (`src/app/(dashboard)/dashboard/**`),
all public-facing pages, `src/auth.ts`, `src/lib/db.ts`, `drizzle/schema.ts`

### Verification after both agents complete
```bash
bun run build                                          # must be 0 errors
grep -r "await fetch(" src/components/dashboard/      # must return 0 results
grep -r "window.confirm\|confirm(" src/components/dashboard/  # must return 0 results
```

---

## PHASE 3B — SERVER ACTION MIGRATION CONTEXT (PM2)

### Status (as of 2026-04-04)
All RBAC and infrastructure work is complete. The remaining task is wiring forms off API routes onto server actions.

| Item | Status |
|------|--------|
| All server actions — `can()` RBAC guards | ✅ DONE |
| All API routes — role checks | ✅ DONE |
| `/api/upload` — role check | ✅ DONE |
| gallery.ts — createAlbum, updateAlbum, addImageToAlbum, updateImageOrder | ✅ DONE |
| Forms wired to Server Actions directly | ❌ PM2 Agent 1 + Agent 2 doing this |

### PM2 Agent Ownership (DO NOT OVERLAP)
**PM2 Agent 1** owns: `post-editor.tsx`, `leadership-form.tsx`, `publication-form.tsx`
**PM2 Agent 2** owns: `event-form.tsx`, `album-form.tsx`, `gallery-image-manager.tsx`
**PM1 Agent B** owns: `settings-form.tsx`, `new-announcement-sheet.tsx`, `member-status-toggle.tsx`, `contact-inbox.tsx`, all `*-delete-button.tsx`, `announcement-actions.tsx`

### Migration Rule
Replace `apiRequest('/api/...')` in useMutation `mutationFn` with direct server action calls.
Keep all `fetch('/api/upload', FormData)` upload calls unchanged.
Change `err instanceof ApiError` → `err instanceof Error` in onError handlers.

### Server Action imports per file
- post-editor.tsx → `@/app/actions/posts` (createPost, updatePost)
- leadership-form.tsx → `@/app/actions/leadership` (createLeadership, updateLeadership)
- publication-form.tsx → `@/app/actions/publications` (createPublication, updatePublication)
- event-form.tsx → `@/app/actions/events` (createEvent, updateEvent)
- album-form.tsx → `@/app/actions/gallery` (createAlbum, updateAlbum)
- gallery-image-manager.tsx → `@/app/actions/gallery` (addImageToAlbum, updateImageCaption, updateImageOrder)

---

## PHASE 5 — ADVANCED FEATURES CONTEXT

### Phase Sequence
```
5A (parallel) → 5B (parallel) → 5C (parallel) → 5D
SEO + Events     Email + Dir     Payment + Fund   Analytics
```

### Phase 5A Status
| Item | Status |
|------|--------|
| Sitemap + robots.txt | Agent 1 |
| OG metadata on layout + news + gallery | Agent 1 |
| Public events listing + detail pages | Agent 2 |
| Event registration server action | Agent 2 |

### Phase 5B — Email (Resend) + Member Directory
- **Email:** Install `resend`. Create `src/lib/email.ts`. Wire contact form API route to save to `contactSubmissions` DB table + send emails. Wire event registration action to send confirmation email. RESEND_API_KEY env var required.
- **Directory:** New pages under `src/app/(member)/member-centre/directory/`. Server Component with search params + client filter component. Queries `members JOIN users`. Gated — requires session.

### Phase 5C — Paystack + Fund Application
- **Paystack:** Use REST API via fetch (no package). Add `paymentReference` column to `event_registrations` via Drizzle migration. New API routes: `/api/payments/initialize` + `/api/payments/verify`. New page: `/events/payment/[registrationId]`. Env vars: PAYSTACK_SECRET_KEY, PAYSTACK_PUBLIC_KEY, NEXT_PUBLIC_APP_URL.
- **Fund:** New DB table `fund_applications` (add to schema + migration). New pages: `/fund/page.tsx`, `/fund/apply/page.tsx`. Dashboard page: `/dashboard/fund-applications`. Loan calculator component (simple interest, 10% pa).

### Phase 5D — Analytics
- Add Google Analytics via `next/third-parties`. Env var: NEXT_PUBLIC_GA_ID. Update sitemap to include /fund + event pages.

### Key DB Tables for Phase 5
- `events` — existing, has: id, slug, title, description, location, isOnline, startDate, endDate, priceGhs, maxAttendees, status, featuredImage
- `eventRegistrations` — existing, has: id, eventId, userId, name, email, phone, paymentStatus. Missing: paymentReference (added in 5C)
- `contactSubmissions` — existing schema but API route doesn't use it yet (fixed in 5B)
- `members` + `users` — used by member directory in 5B
- `fundApplications` — NEW table created in 5C

### Env Vars Added Per Phase
```
# 5B
RESEND_API_KEY=re_...
ADMIN_EMAIL=admin@gaphto.org

# 5C
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 5D
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Task Files
- `plans/TASK_PM2_PHASE5A_AGENT1.md` — SEO + Sitemap
- `plans/TASK_PM2_PHASE5A_AGENT2.md` — Public Events + Registration
- (Phase 5B-5D task files written after 5A completes)

---

## Phase 5 Notes — Admin Content Management / CMS

### Status
- AGENT 1 COMPLETE (2026-04-05)
- AGENT 2 PENDING (dashboard editor UI)

### savePageContent — Exact Signature
```typescript
// Import path: @/app/actions/content
import { savePageContent, getPageContent } from '@/app/actions/content'

export async function savePageContent(values: Record<string, string>): Promise<void>
```
- Requires `session.user.role` in `['super_admin', 'admin']`
- Throws `new Error('Forbidden')` for unauthorized callers
- After save: `revalidatePath('/', 'layout')` + `revalidatePath('/about')`

### Complete Key Naming Convention
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

### Components with new optional props (Agent 2 note)
All props are optional with hardcoded fallbacks — no breaking changes.

| Component | New Props |
|-----------|-----------|
| `HeroCarousel` | `heroTitle?: string`, `heroSubtitle?: string` |
| `StatsBar` | `membersCount`, `membersLabel`, `journalsCount`, `journalsLabel`, `eventsCount`, `eventsLabel`, `yearsCount`, `yearsLabel` (all `string?`) |
| `NewsPreview` | `heading?: string` |
| `EventsPreview` | `heading?: string` |
| `PracticeAreas` | `heading?: string` |
| `LeadershipPreview` | `heading?: string` |
| `GalleryTeaser` | `heading?: string` |
| `AboutSection` | `heading?: string` |
| `FundCta` | `heading?: string`, `subtitle?: string` |
