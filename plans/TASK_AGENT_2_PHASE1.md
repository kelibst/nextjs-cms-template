# TASK BRIEF — Agent 2: Content Pages
> Read AGENT_CONTEXT.md first: /home/kelib/Desktop/moreprojects/gaphto/plans/AGENT_CONTEXT.md
> Agent 1 is building the homepage and layout simultaneously. Do NOT touch: src/app/page.tsx, src/components/home/*, src/components/layout/*

---

## STACK (confirmed)
- Next.js 16.2.2, React 19, TypeScript
- Tailwind CSS v4 + tw-animate-css
- Shadcn/ui with `@/*` → `src/*` alias
- Package manager: bun
- Root: `/home/kelib/Desktop/moreprojects/gaphto/`

---

## YOUR SCOPE
You build all **inner content pages** for the GAPHTO showcase:
- News listing + article detail
- Leadership page
- Gallery page with lightbox
- About page
- Contact page
- Practice areas page

**Assume Agent 1 has already:**
- Installed framer-motion, embla-carousel-react, Shadcn carousel/card/badge/separator/avatar
- Created `src/data/*.json` files
- Created `src/lib/data.ts` with typed loaders
- Copied images to `public/images/`
- Created layout (header + footer)

If `src/data/*.json` or `src/lib/data.ts` don't exist yet when you run, create them yourself using the same spec from AGENT_CONTEXT.md.

---

## STEP 0 — Install additional packages if needed
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx shadcn@latest add card badge separator avatar dialog
bun add yet-another-react-lightbox
```

---

## STEP 1 — Shared components

### `src/components/shared/page-header.tsx`
Reusable page header banner for inner pages:
- Full-width, green gradient background
- Props: `title`, `subtitle`, `breadcrumb`
- Subtle animated background pattern

### `src/components/shared/post-card.tsx`
Reusable card for news/blog posts:
- Props: `post: Post`
- Featured image (Next.js `<Image>`), category badge (color-coded), date, title, excerpt (3 lines), "Read More →" link
- Hover: lift effect

---

## STEP 2 — News pages

### `src/app/news/page.tsx`
- PageHeader: "News & Updates"
- Category filter tabs: All | GAPHTO News | Health News | Blog (use Shadcn tabs or simple button group)
- Grid of PostCards — filtered by active tab
- Data: `getAllPosts()` from `@/lib/data`
- Pagination: simple show-more button (show 9, then load more client-side)

### `src/app/news/[slug]/page.tsx`
- `generateStaticParams` → all post slugs from `getAllPosts()`
- Article layout: max-w-3xl centered
- Featured image full-width at top
- Category badge + date + title (large)
- Article body: render `post.content` as HTML using `dangerouslySetInnerHTML` wrapped in a `prose` div
  - Add Tailwind Typography: `bun add @tailwindcss/typography` then add `prose prose-green` classes
- "← Back to News" link
- Related posts: 3 cards from same category at bottom

---

## STEP 3 — Leadership page

### `src/app/leadership/page.tsx`
- PageHeader: "Our Leadership", subtitle: "National Executive Committee"
- Grid of leadership cards (all 12)
- Each card (larger than homepage preview):
  - Photo (circular, 120px)
  - Name + role
  - Facebook link icon if `facebookUrl` present
  - Bio if present
- Group by implied hierarchy (President/VP first, then rest)
- Stagger animation on mount (framer-motion)

---

## STEP 4 — Gallery page

### `src/app/gallery/page.tsx`
- PageHeader: "Photo Gallery"
- Album tabs or sections: one section per album
- Album heading + event date
- Responsive image grid (3 cols desktop, 2 tablet, 1 mobile)
- Click any image → opens lightbox (use `yet-another-react-lightbox`)
  - Full screen, keyboard navigation, caption display
- Each image uses Next.js `<Image>` with `width` and `height`

---

## STEP 5 — About page

### `src/app/about/page.tsx`
- PageHeader: "About GAPHTO"
- Section 1: Background — render `about.background` HTML in a prose container
- Section 2: Vision & Mission — two highlight boxes side by side
  - Vision box: emerald accent
  - Mission box: green accent
- Section 3: Our Objectives — numbered list, each objective as a card with number chip
- Section 4: Practice Areas mini-overview — 3 horizontal cards linking to /practice-areas
- Timeline: key dates (1984 founding → 2006 inauguration → 2009 renamed GAPHTO → present)

---

## STEP 6 — Contact page

### `src/app/contact/page.tsx`
- PageHeader: "Contact Us"
- Two-column layout:
  - Left: contact info cards (phone, email, address, social links) — data from `getContact()`
  - Right: contact form (name, email, subject, message, submit button)
    - Form is client component, use React state for fields
    - On submit: POST to `/api/contact` (create this API route too)
    - Show success/error state
- Map placeholder: a styled div with the address text (no actual map API needed)

### `src/app/api/contact/route.ts`
- POST handler
- Validate required fields (name, email, message)
- For now: just return `{ success: true }` (no email sending yet)
- Return 400 with error message if validation fails

---

## STEP 7 — Practice Areas page

### `src/app/practice-areas/page.tsx`
- PageHeader: "Areas of Practice"
- 3 sections, one per practice area (Disease Control, HIM, Nutrition)
- Each section: icon + heading + full content HTML from `getPracticeAreas()`
- Professional roles listed as badges

---

## STEP 8 — Update src/app/layout.tsx metadata
Update the metadata in layout.tsx:
```ts
export const metadata: Metadata = {
  title: {
    default: "GAPHTO — Public Health, Our Concern",
    template: "%s | GAPHTO"
  },
  description: "Ghana Association of Public Health Technical Officers — Building collective effort in the prevention of diseases and promotion of good health practices.",
}
```

---

## CONSTRAINTS
- All page components are Server Components by default
- Client components: gallery lightbox wrapper, contact form, news filter tabs
- Use `next/image` for ALL images, `next/link` for ALL internal links
- Use `dangerouslySetInnerHTML` only for scraped article content wrapped in `prose` class
- Tailwind green-800/700/600 for brand color
- Do NOT touch: `src/app/page.tsx`, `src/components/home/**`, `src/components/layout/**`
- Install `@tailwindcss/typography` for prose styling in article pages

## WHEN DONE
Update AGENT_CONTEXT.md Agent 2 Phase 1 status row.
