# TASK: Agent 2 — Navigation Links Management
> Sprint: UI/UX Polish (2026-04-11)
> Read AGENT_CONTEXT.md for full project context before starting.

---

## GOAL
Replace the hardcoded navigation arrays in header.tsx and footer.tsx with a database-driven system. Build an admin UI so editors can add, remove, reorder, and toggle the visibility of navigation links — and those changes reflect instantly on the public site.

---

## CURRENT STATE (READ FIRST)

**Header nav** — `src/components/layout/header.tsx` lines 21-30:
```ts
const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'News', href: '/news' },
  { label: 'Blog', href: '/blog' },
  { label: 'Leadership', href: '/leadership' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Events', href: '/events' },
  { label: 'Contact', href: '/contact' },
]
```

**Footer quick links** — `src/components/layout/footer.tsx` lines 5-14:
```ts
const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'GAPHTO News', href: '/news' },
  ...
]
```

Both are hardcoded — no DB, no admin control.

---

## STEP 1 — Database Schema

**File:** `drizzle/schema.ts`

Add this table (insert after the `siteSettings` table definition, around line 280+):

```ts
export const navigationLinks = pgTable('navigation_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  label: text('label').notNull(),
  href: text('href').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isVisible: boolean('is_visible').notNull().default(true),
  openInNewTab: boolean('open_in_new_tab').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type NavigationLink = typeof navigationLinks.$inferSelect
export type NewNavigationLink = typeof navigationLinks.$inferInsert
```

---

## STEP 2 — Run Migration

```bash
bunx drizzle-kit generate --config=drizzle/drizzle.config.ts
bunx tsx drizzle/migrate.ts
```

---

## STEP 3 — Seed Default Nav Links

**Option A:** Add to `drizzle/seed.ts` (check if it re-seeds safely — only insert if table is empty).

**Option B:** Create `src/lib/seed-navigation.ts` (similar to `src/lib/seed-blocks.ts`) and run it with `bunx tsx src/lib/seed-navigation.ts`.

Insert these 8 links in order (sortOrder 0–7):
```ts
const defaultNavLinks = [
  { label: 'Home', href: '/', sortOrder: 0 },
  { label: 'About', href: '/about', sortOrder: 1 },
  { label: 'News', href: '/news', sortOrder: 2 },
  { label: 'Blog', href: '/blog', sortOrder: 3 },
  { label: 'Leadership', href: '/leadership', sortOrder: 4 },
  { label: 'Gallery', href: '/gallery', sortOrder: 5 },
  { label: 'Events', href: '/events', sortOrder: 6 },
  { label: 'Contact', href: '/contact', sortOrder: 7 },
]
```

Use `onConflictDoNothing()` or check count before inserting to make it idempotent.

---

## STEP 4 — Server Actions

**Create:** `src/app/actions/navigation.ts`

```ts
'use server'
import { db, navigationLinks } from '@/lib/db'
import { asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { can } from '@/lib/permissions'

// Public — used by header/footer
export async function getNavLinks() {
  return db.select().from(navigationLinks)
    .where(eq(navigationLinks.isVisible, true))
    .orderBy(asc(navigationLinks.sortOrder))
}

// Admin — all links including hidden
export async function getAllNavLinks() {
  const session = await auth()
  if (!session?.user || !can(session.user.role, 'navigation:manage')) throw new Error('Unauthorized')
  return db.select().from(navigationLinks).orderBy(asc(navigationLinks.sortOrder))
}

export async function createNavLink(data: { label: string; href: string; openInNewTab?: boolean }) { ... }
export async function updateNavLink(id: string, data: Partial<...>) { ... }
export async function deleteNavLink(id: string) { ... }
export async function toggleNavVisibility(id: string) { ... }
export async function reorderNavLinks(links: { id: string; sortOrder: number }[]) { ... }
```

All mutation actions must call `revalidatePath('/', 'layout')` so the public header re-fetches.

---

## STEP 5 — Permissions

**File:** `src/lib/permissions.ts`

Add to the matrix:
```ts
'navigation:manage': ['super_admin', 'admin'],
```

---

## STEP 6 — Admin UI

**Create directory:** `src/app/(dashboard)/dashboard/navigation/`

**Files to create:**
1. `page.tsx` — server component, loads all nav links, renders `<NavigationManager>`
2. `src/components/dashboard/navigation-manager.tsx` — client component with full CRUD

### page.tsx pattern
```tsx
import { getAllNavLinks } from '@/app/actions/navigation'
import NavigationManager from '@/components/dashboard/navigation-manager'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { can } from '@/lib/permissions'

export default async function NavigationPage() {
  const session = await auth()
  if (!session?.user || !can(session.user.role as any, 'navigation:manage')) redirect('/dashboard')
  const links = await getAllNavLinks()
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Navigation Links</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage the links that appear in the site header and footer.</p>
        </div>
      </div>
      <NavigationManager initialLinks={links} />
    </div>
  )
}
```

### NavigationManager component features
- List of links displayed as a sortable table/card list (use existing table pattern from other admin pages)
- Each row shows: drag handle (⠿), Sort#, Label, URL, New Tab toggle, Visible toggle (Switch), Edit (Pencil), Delete (Trash2)
- **Add Link** button → opens a Dialog/Sheet with form: Label (Input), URL (Input), Open in new tab (Switch)
- **Inline edit** → clicking pencil opens same dialog pre-populated
- **Delete** → confirmation Dialog (same pattern as other admin pages: "This action cannot be undone.")
- **Reorder** → drag handles with @dnd-kit (already installed — see page-builder-client.tsx for pattern)
- **Visibility toggle** → Switch that calls `toggleNavVisibility(id)` — immediately reflects on public site via revalidate

### Style guide (match existing admin pages)
```tsx
// Wrap in Card
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle>{links.length} links</CardTitle>
    <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Add Link</Button>
  </CardHeader>
  <CardContent>
    <Table>...</Table>
  </CardContent>
</Card>
```

---

## STEP 7 — Add to Sidebar

**File:** `src/components/dashboard/sidebar.tsx`

Find the Content group (around line 28-40) and add:
```tsx
{ label: 'Navigation', href: '/dashboard/navigation', icon: Menu },
```
Import `Menu` from `lucide-react`. Only show if user role passes `can(role, 'navigation:manage')`.

---

## STEP 8 — Wire Header to DB

**File:** `src/components/layout/header.tsx`

The header is currently `'use client'`. Navigation data must be fetched server-side. Choose one of:

**Option A (Recommended):** Make the public layout a server component that fetches nav links and passes them as props to the Header.

In `src/app/(public)/layout.tsx`:
```tsx
import { getNavLinks } from '@/app/actions/navigation'
import Header from '@/components/layout/header'

export default async function PublicLayout({ children }) {
  let navLinks = []
  try { navLinks = await getNavLinks() } catch {}
  return (
    <>
      <Header navLinks={navLinks} />
      <main className="pt-16 flex-1">{children}</main>
      <Footer />
    </>
  )
}
```

Update `header.tsx` to accept `navLinks` as a prop and remove the hardcoded array. Provide a typed fallback:
```tsx
interface HeaderProps {
  navLinks?: { label: string; href: string; openInNewTab?: boolean }[]
}
const fallbackNavLinks = [
  { label: 'Home', href: '/' },
  // ... rest of current hardcoded links
]
export default function Header({ navLinks = fallbackNavLinks }: HeaderProps) { ... }
```

**Option B:** Create a separate `<NavLinks />` async server component nested inside the client Header — but this is more complex. Use Option A.

---

## STEP 9 — Wire Footer to DB

**File:** `src/components/layout/footer.tsx`

Same approach — footer currently receives no props. Either:
- Pass `navLinks` from `PublicLayout` to `<Footer navLinks={navLinks} />`
- Or Footer fetches its own data (it's currently a server component — check with `grep 'use client' footer.tsx`)

The footer's "Quick Links" can mirror the same nav links or be a subset. For simplicity, use the same `navLinks` array passed from PublicLayout. If footer needs different links in future, that can be extended.

---

## ACCEPTANCE CRITERIA
- [x] `navigationLinks` table in DB, migration applied
- [x] 8 default nav links seeded
- [x] Server actions for full CRUD + reorder + toggle
- [x] `navigation:manage` permission added
- [x] Admin page at `/dashboard/navigation` — add, edit, delete, reorder, toggle visibility
- [x] Sidebar has "Navigation" link (visible to super_admin, admin)
- [x] Public header reads nav links from DB (with hardcoded fallback if DB empty)
- [x] Footer reads nav links from DB
- [x] Changes in admin instantly reflect on public site (revalidatePath)

---

## STATUS
- [x] Step 1 — Schema added
- [x] Step 2 — Migration run
- [x] Step 3 — Seeded default links
- [x] Step 4 — Server actions created
- [x] Step 5 — Permissions updated
- [x] Step 6 — Admin UI built
- [x] Step 7 — Sidebar updated
- [x] Step 8 — Header wired to DB
- [x] Step 9 — Footer wired to DB
- [x] Update AGENT_CONTEXT.md status log when done
