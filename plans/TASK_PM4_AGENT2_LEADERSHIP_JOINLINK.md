# PM4 — Agent 2: Leadership Social Links + Profile Page + "Join GAPHTO" → Login

> **Read `plans/AGENT_CONTEXT.md` first for critical project rules (proxy.ts, bun, migration command).**
> When finished, update the STATUS section at the bottom of this file.

---

## SCOPE

Three related improvements:
1. Add LinkedIn + Instagram fields to the leadership table and expose them in the dashboard form and public site.
2. Create a public "leadership profile" detail page so visitors can read more about each leader.
3. Replace the "Join GAPHTO" call-to-action in the hero with a session-aware login/portal link.

---

## TASK 1 — Leadership: Add Social Media Links

### 1a. Schema migration

**File:** `drizzle/schema.ts`

The `leadership` table already has `facebookUrl` and `twitterUrl`. Add two more nullable text columns:
```ts
linkedinUrl: text('linkedin_url'),
instagramUrl: text('instagram_url'),
```

After editing schema.ts, run the migration:
```bash
bunx drizzle-kit generate --config=drizzle/drizzle.config.ts
bunx tsx drizzle/migrate.ts
```

### 1b. Dashboard leadership form

**File:** `src/components/dashboard/leadership-form.tsx`

Read this file first to understand the existing form. Add two new input fields:
- LinkedIn URL (label "LinkedIn URL", placeholder "https://linkedin.com/in/...")
- Instagram URL (label "Instagram URL", placeholder "https://instagram.com/...")

These sit alongside the existing Facebook URL and Twitter URL fields. The form's server action already saves to the `leadership` table — extend it to include the two new fields.

### 1c. Public leadership display

**File:** `src/app/(public)/leadership/leadership-grid.tsx` (or whatever file renders the leadership cards)

Read the current leadership card component. For each leader, render a row of social icon links at the bottom of the card for any social URLs that are non-null:
- Facebook → `Facebook` icon from `lucide-react`
- Twitter/X → `Twitter` icon from `lucide-react`
- LinkedIn → `Linkedin` icon from `lucide-react`
- Instagram → `Instagram` icon from `lucide-react`
- Email → `Mail` icon (already may be there)

Icons should be small (`w-4 h-4`), open in `target="_blank" rel="noopener noreferrer"`, and styled `text-muted-foreground hover:text-primary`.

---

## TASK 2 — Leadership Public Profile Page

Create a public detail page for each leadership member:

**Route:** `/leadership/[id]` (use the UUID `id` from the DB — simpler than slug since leadership has no slug column)

**File to create:** `src/app/(public)/leadership/[id]/page.tsx`

### Page content
- Back link: `← Leadership Team` → `/leadership`
- Hero section: large avatar/photo, name, role, term (if `termStart`/`termEnd` are set).
- Full bio text (the `bio` field).
- Social links row: same icon set as Task 1c.
- Email link if `email` is set.

### Data fetching
This is a server component. Fetch directly from DB:
```ts
const [leader] = await db.select().from(leadership).where(eq(leadership.id, params.id)).limit(1)
if (!leader) notFound()
```

### Update the leadership grid
In `leadership-grid.tsx`, wrap the leader card (or add a "View Profile" link) that goes to `/leadership/{leader.id}`. Read the existing grid to decide where the link fits best — likely a small "Read more →" text link at the bottom of each card.

Note: The public leadership page at `/leadership/` currently uses scraped JSON data (`getLeadership()` from `src/lib/data.ts`), NOT the DB. Check how the public leadership page works before coding. If it reads from `src/lib/data.ts` (JSON), you will need to add the `id` to the JSON data OR switch the public page to read from the DB. **Check this first** — this is the most important thing to verify before writing any code for Task 2.

---

## TASK 3 — Replace "Join GAPHTO" with Session-Aware CTA

### The problem
`src/components/home/hero-carousel.tsx` is a `'use client'` component. It renders a hard-coded "Join GAPHTO" link at line ~142. This should instead:
- Show **"Member Login"** → `/login` for unauthenticated visitors
- Show **"Member Portal"** → `/member-centre` for logged-in users (any role)

### Solution — pass prop from server parent

**Step 1:** In `src/app/(public)/page.tsx` (server component), call `auth()` and derive session:
```ts
import { auth } from '@/auth'
// inside the default async function:
const session = await auth()
const isLoggedIn = !!session?.user
```
Pass `isLoggedIn` as a prop to `<HeroCarousel posts={posts} isLoggedIn={isLoggedIn} />`.

**Step 2:** In `src/components/home/hero-carousel.tsx`:
- Add `isLoggedIn?: boolean` to the `Props` interface.
- Replace the static "Join GAPHTO" link with:
```tsx
<Link
  href={isLoggedIn ? '/member-centre' : '/login'}
  className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary-subtle font-semibold px-7 py-3.5 rounded-xl transition-colors duration-200"
>
  {isLoggedIn ? 'Member Portal' : 'Member Login'}
</Link>
```

**Note:** `page.tsx` is currently a synchronous function — you will need to make it `async` to use `auth()`.

---

## WHAT NOT TO DO
- Do not create any API routes — use server actions and direct DB calls in server components.
- Do not touch `src/middleware.ts` — leave `src/proxy.ts` alone.
- Do not add learning or GIS features — those are Phase 3 scope.

---

## KEY FILES TO READ BEFORE CODING
| File | Why |
|------|-----|
| `drizzle/schema.ts` | Leadership table — add two columns |
| `src/components/dashboard/leadership-form.tsx` | Add social URL inputs |
| `src/app/(dashboard)/dashboard/leadership/page.tsx` | How the table is rendered |
| `src/app/(public)/leadership/leadership-grid.tsx` | Public grid — add icons + profile link |
| `src/app/(public)/leadership/page.tsx` | Public leadership page — understand data source |
| `src/lib/data.ts` | Check if public leadership reads JSON or DB |
| `src/app/(public)/page.tsx` | Homepage — make async, add auth() call |
| `src/components/home/hero-carousel.tsx` | Replace Join GAPHTO button |

---

## STATUS
- [x] Task 1a — Schema migration (linkedin_url, instagram_url) — migration 0006 generated and applied
- [x] Task 1b — Dashboard form updated — LinkedIn + Instagram inputs added; server action extended
- [x] Task 1c — Public grid social icons — grid switched to DB source; inline SVG brand icons (Facebook, X, LinkedIn, Instagram, Mail) rendered per leader
- [x] Task 2 — Leadership profile page `/leadership/[id]` — server component, DB fetch, back link, hero, bio, social icons; public leadership page switched from JSON to DB
- [x] Task 3 — Hero carousel session-aware CTA — `page.tsx` made async with `auth()`; `HeroCarousel` accepts `isLoggedIn` prop; "Join GAPHTO" replaced with "Member Login" → `/login` or "Member Portal" → `/member-centre`

Build: clean (`bun run build` passes, no TS errors). Note: lucide-react in this project has no brand icons; Facebook/X/LinkedIn/Instagram use inline SVG paths.
