# TASK BRIEF — Agent 1: Foundation + Homepage
> Read AGENT_CONTEXT.md first: /home/kelib/Desktop/moreprojects/gaphto/plans/AGENT_CONTEXT.md

---

## STACK (confirmed)
- Next.js 16.2.2, React 19, TypeScript
- Tailwind CSS v4 + tw-animate-css (already in globals.css)
- Shadcn/ui (only `button.tsx` installed so far)
- Path alias: `@/*` → `src/*`
- Package manager: bun
- Root: `/home/kelib/Desktop/moreprojects/gaphto/`

---

## YOUR SCOPE
You build the **foundation and homepage** of the GAPHTO showcase:
1. Data loading layer (from scraped JSON files)
2. Shared layout (header + footer)
3. Homepage (`src/app/page.tsx`) with all sections
4. Reusable UI components used by the homepage

Agent 2 handles: news pages, leadership page, gallery page, events, contact, practice areas.

---

## STEP 0 — Install packages
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bun add framer-motion embla-carousel-react embla-carousel-autoplay
bunx shadcn@latest add carousel card badge separator avatar
```

---

## STEP 1 — Copy scraped data to src/data/
Copy these files from `scraper/output/` to `src/data/`:
```bash
cp scraper/output/news.json src/data/news.json
cp scraper/output/health-news.json src/data/health-news.json
cp scraper/output/blog.json src/data/blog.json
cp scraper/output/leadership.json src/data/leadership.json
cp scraper/output/gallery.json src/data/gallery.json
cp scraper/output/events.json src/data/events.json
cp scraper/output/about.json src/data/about.json
cp scraper/output/contact.json src/data/contact.json
cp scraper/output/practice-areas.json src/data/practice-areas.json
cp scraper/output/fund.json src/data/fund.json
```

Also copy scraped image assets:
```bash
cp -r scraped-assets/leadership public/images/leadership
cp -r scraped-assets/gallery public/images/gallery
```

---

## STEP 2 — Data types + loader: `src/lib/data.ts`
Export typed interfaces matching the JSON schemas (see AGENT_CONTEXT.md) and simple loader functions:
```ts
export function getNews(): Post[]         // news.json
export function getHealthNews(): Post[]   // health-news.json
export function getBlogPosts(): Post[]    // blog.json
export function getAllPosts(): Post[]     // merged, sorted by date desc
export function getLeadership(): Leader[]
export function getGalleryAlbums(): GalleryAlbum[]
export function getEvents(): Event[]
export function getAbout(): About
export function getContact(): Contact
export function getPracticeAreas(): PracticeArea[]
```

Use `import data from '@/data/filename.json'` — Next.js server components handle this natively.

For images: map `localPath` → `/images/leadership/filename` or `/images/gallery/album/filename`. If localPath is null, use a placeholder (`/images/placeholder.jpg`).

---

## STEP 3 — Layout

### `src/components/layout/header.tsx`
- Fixed top nav, white background, subtle shadow on scroll (use `useScroll` from framer-motion or a simple scroll listener)
- Logo: GAPHTO text logo left side (use org green color `#2d7a2d` or similar)
- Nav links: Home, About, News, Leadership, Gallery, Events, Contact
- Mobile: hamburger → slide-down menu
- CTA button: "Member Login" (right side, outline style)

### `src/components/layout/footer.tsx`
- Dark background (`#1a2e1a` or similar deep green)
- Three columns: About blurb + logo | Quick Links | Contact Info
- Contact: phone `030 296 4402`, email `info@gaphto.org`, address
- Social icons: Facebook, Twitter, YouTube (use lucide-react icons or simple SVGs)
- Bottom bar: copyright + "Powered by Ossy Digital Hub"

### Update `src/app/layout.tsx`
Import and use Header and Footer. Keep the existing font setup unchanged.

---

## STEP 4 — Homepage sections

### `src/app/page.tsx`
Assemble all sections in order. Each section is its own component.

---

### Section 1: Hero — `src/components/home/hero-carousel.tsx`
- Full-viewport height carousel using Shadcn `<Carousel>` with embla-carousel-autoplay
- 5 slides sourced from: latest announcement post + 4 most recent news posts
- Each slide: full-bleed background image (use Next.js `<Image>` with `fill`), dark overlay gradient, centered text
  - Slide content: category badge | headline | excerpt (2 lines) | CTA button
- Autoplay every 5s, pause on hover
- Dot indicators at bottom
- Animated text entrance per slide using framer-motion (`initial: {y:30, opacity:0}` → `animate: {y:0, opacity:1}`)
- If no featured image, use a Ghana public health themed gradient background

### Section 2: Stats Bar — `src/components/home/stats-bar.tsx`
- Dark green background, 4 stats in a row
- Stats: Members (use "500+" as placeholder), Years Active (2026-1984 = 42), Practice Areas (3), Regions (16)
- Count-up animation on scroll into view (use framer-motion `useInView` + `useMotionValue`)
- Small label under each number

### Section 3: Latest News — `src/components/home/news-preview.tsx`
- Section heading "Latest News" with "View All →" link
- 3-column grid of news cards (use Shadcn `<Card>`)
- Each card: featured image (Next.js `<Image>`), category badge, date, title, excerpt (2 lines, truncated), "Read More →"
- Cards from `getAllPosts()` sorted by date, take first 3
- Hover: slight lift (box-shadow + translateY)
- Section fade-in-up on scroll (framer-motion `whileInView`)

### Section 4: Upcoming Events — `src/components/home/events-preview.tsx`
- Section heading "Events & Programs"
- Horizontal scroll on mobile, 3-column grid on desktop
- Event card: date chip (day/month), title, location badge (Online/Physical), price, "Register" button
- Use events from `getEvents()`, show all (there are only 4)
- Empty state: "No upcoming events" if all are past

### Section 5: Practice Areas — `src/components/home/practice-areas.tsx`
- Section heading "Our Areas of Practice"
- 3 cards, icon + title + short description + "Learn More" link
- Icons: 🦠 Disease Control | 📊 Health Information | 🥗 Nutrition (use lucide-react: `Shield`, `BarChart3`, `Apple`)
- Card hover: green accent border animates in
- Scroll-triggered stagger animation (each card delays 0.1s)

### Section 6: Leadership Preview — `src/components/home/leadership-preview.tsx`
- Section heading "Our Leadership"
- 6-card grid (first 6 from `getLeadership()`)
- Each card: circular avatar (`<Avatar>`), name, role
- Images from `/images/leadership/` local paths
- Hover: scale(1.05)
- "Meet the Full Team →" link below grid

### Section 7: Gallery Teaser — `src/components/home/gallery-teaser.tsx`
- Section heading "Gallery"
- Masonry-style or 3×2 grid of 6 images (pick first 6 images across all albums)
- Each image: Next.js `<Image>` with hover overlay showing caption
- "View Full Gallery →" link

### Section 8: About / Mission — `src/components/home/about-section.tsx`
- Two-column split: text left, decorative right (image or pattern)
- Show: org tagline, mission statement (from `about.json`), vision statement
- Left side: heading, paragraphs, two stat pills ("Founded 1984", "Nationwide Presence")
- Right: image (use a gallery photo) with an offset color block behind it

### Section 9: Fund CTA — `src/components/home/fund-cta.tsx`
- Full-width banner, green gradient background
- Heading: "GAPHTO Welfare Fund"
- Short description from `fund.json`
- Two CTA buttons: "Learn More" + "Loan Calculator"
- Subtle animated background pattern (CSS)

---

## STEP 5 — next.config.ts
Add `images.remotePatterns` for `www.gaphto.org` (for any source URLs still in use) and ensure local `/images/**` is served.

---

## STEP 6 — Create a placeholder image
Create `public/images/placeholder.jpg` — copy any existing gallery image as placeholder:
```bash
cp public/images/gallery/*/IMG_*.jpg public/images/placeholder.jpg 2>/dev/null | true
```

---

## CONSTRAINTS
- All components are React Server Components unless they need interactivity (carousel, mobile nav, scroll animations) — mark those with `'use client'`
- Use `next/image` for ALL images — never `<img>`
- Use `next/link` for ALL internal links
- No hardcoded colors — use Tailwind classes
- Org color: use Tailwind `green-800` / `green-700` / `green-600` for primary brand
- Do NOT install additional packages beyond what's listed in Step 0
- Do NOT build news/leadership/gallery/contact pages — Agent 2 handles those

## WHEN DONE
Update AGENT_CONTEXT.md Agent 1 Phase 1 status row.
