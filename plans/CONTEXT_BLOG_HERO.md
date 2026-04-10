# Context: Blog/Publications + Hero Improvements

## Project
GAPHTO — WordPress → Next.js 16 migration. Stack: TypeScript, shadcn/ui, Tailwind, Framer Motion, Prisma/Postgres.

## Current State (as of 2026-04-09)

### Interior Page Hero
**File:** `src/components/shared/page-header.tsx`
- Left-aligned text (h1 + optional subtitle)
- Gradient bg: `from-primary-deep via-primary-hover to-primary`
- Animated pulsing blobs (top-left, bottom-right) + SVG grid overlay
- Props: `title`, `subtitle`, `breadcrumb[]`, `className`
- Used by: `/news/page.tsx`, `/publications/page.tsx`

### News Listing
**File:** `src/app/(public)/news/page.tsx`
- Uses `PageHeader` + `NewsClient` component
- `NewsClient` has category tabs: All, GAPHTO News, Health News, Blog
- Blog posts are mixed into /news, filtered by category "blog"
- Data: `src/lib/data.ts` → `getAllPosts()` merges `data/news.json`, `data/health-news.json`, `data/blog.json`

### Article Detail Page
**File:** `src/app/(public)/news/[slug]/page.tsx`
- Featured image: `h-64 sm:h-80 md:h-96`, gradient overlay `from-transparent to-black/60`
- Title + metadata appear **below** the image (not overlaid)
- No Framer Motion animations
- Related posts section at bottom

### Publications Page
**File:** `src/app/(public)/publications/page.tsx`
- Uses `PageHeader` + hardcoded 3 teaser items (blurred with lock overlay)
- No real data — purely decorative teaser
- No auth check — always shows locked state
- No publication detail routes

### Homepage Hero
**File:** `src/components/home/hero-carousel.tsx`
- Full-screen, two-column layout
- Framer Motion stagger animations
- Right panel: auto-rotating news carousel

## What Needs to Be Built

### 1. Enhanced PageHeader / InnerPageHero Component
Replace or extend current `PageHeader` with:
- **Centered** text layout (title + subtitle centered)
- Decorative badge/label above title (e.g. "Explore" or section label)
- Better background: keep gradient but add subtle radial glow in center
- Optional `heroImage` prop — when provided, show full-bleed image with dark overlay + text overlaid
- Framer Motion entrance animations (fade-up for title, fade-up delayed for subtitle)
- Consistent height: `min-h-[320px] md:min-h-[400px]`
- Breadcrumb centered below title

### 2. Article / Blog Post Detail Hero
Upgrade the news/[slug] featured image hero:
- Overlay the article title + metadata **ON** the image (not below it)
- Taller: `h-80 md:h-[480px]`
- Stronger gradient overlay: `from-black/20 via-black/40 to-black/80` (bottom-heavy)
- Title in white, large (text-4xl+)
- Category badge + date + author overlaid at bottom-left
- Back button top-left with semi-transparent bg
- Framer Motion: title fades up on load

### 3. Blog Listing (Separated from News)
Add `/blog` route as dedicated blog listing:
- Route: `src/app/(public)/blog/page.tsx`
- Uses data from `data/blog.json` only
- Enhanced `PageHeader` (centered) with "Blog" title
- Card grid with reading time estimate
- PostCard already exists — reuse it

### 4. Publications — Real Implementation
Upgrade publications from decorative teaser to real:
- Add `data/publications.json` (scraped from WordPress) with fields:
  `{ id, title, year, type, description, fileUrl, coverImage, isPublic }`
- `src/lib/data.ts` — add `getAllPublications()`, `getPublicationBySlug()`
- `src/app/(public)/publications/page.tsx`:
  - Check auth session (use existing `getServerSession` pattern)
  - Logged-in members: see full cards, download links
  - Logged-out: show 3 blurred teaser + CTA (current behavior)
- `src/app/(public)/publications/[slug]/page.tsx` — new detail page:
  - Members-only guard (redirect to login if not authenticated)
  - PDF embed or download button
  - Publication metadata display

## Key Files to Read Before Implementing
- `src/components/shared/page-header.tsx` — current PageHeader (to extend)
- `src/app/(public)/news/[slug]/page.tsx` — article detail (to upgrade hero)
- `src/app/(public)/news/page.tsx` — news listing (reference pattern for blog)
- `src/app/(public)/publications/page.tsx` — publications (to enhance)
- `src/lib/data.ts` — data loaders (to add publications loader)
- `src/components/shared/post-card.tsx` — PostCard (reuse for blog listing)
- `src/lib/utils.ts` — sanitizeHtml, helpers

## Auth Pattern
- Use `getServerSession()` from `next-auth` — already used in dashboard routes
- Role check: `session?.user?.role` (values: `member`, `admin`)
- Middleware for auth protection: use `src/proxy.ts` (NOT middleware.ts — that breaks the build)

## Design Tokens
- Primary gradient: `from-primary-deep via-primary-hover to-primary`
- Text on gradient: `text-primary-foreground`
- Animations: Framer Motion `initial={{ opacity: 0, y: 16 }}` → `animate={{ opacity: 1, y: 0 }}`
- Border radius: `rounded-2xl` for cards
- Blur glow: `blur-3xl` background elements
