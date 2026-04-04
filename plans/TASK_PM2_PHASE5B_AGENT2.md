# PM2 Phase 5B — Agent 2: Member Directory

## Read First
Read `plans/AGENT_CONTEXT.md` for full project context (Phase 5 section and Phase 2 auth context).

## Your Goal
Build a searchable member directory inside the member centre (gated — requires login). Members can search by name and filter by specialty and region.

## Key Patterns To Understand First
- Read `src/app/(member)/layout.tsx` — understand the member centre layout/nav
- Read `src/app/(member)/member-centre/page.tsx` — understand the page structure pattern
- Read `src/lib/db.ts` — get exact table/column exports
- Read `drizzle/schema.ts` — understand `members` and `users` table columns
- Read `src/components/ui/` list — see what Shadcn components are available

## Files To Create

### 1. `src/app/(member)/member-centre/directory/page.tsx`
Server Component. Gated page — no extra auth check needed (layout already requires session).

```typescript
import type { SearchParams } from 'next/dist/server/request/search-params'

interface Props {
  searchParams: Promise<{ q?: string; specialty?: string; region?: string }>
}

export const metadata = {
  title: 'Member Directory',
  description: 'Search and connect with GAPHTO members across Ghana.',
}

export default async function MemberDirectoryPage({ searchParams }: Props) {
  const { q, specialty, region } = await searchParams
  
  // DB query: members JOIN users, filtered by active status + optional search params
  // Use ilike for case-insensitive name search
  // Return members with: id, name, specialty, region, facility, membershipStatus, role
  
  return (
    <div>
      <PageHeader title="Member Directory" description="..." />
      <MemberDirectoryClient initialMembers={members} />
    </div>
  )
}
```

**DB query pattern** (adjust column names to match actual schema):
```typescript
import { db, members, users } from '@/lib/db'
import { eq, and, ilike, or } from 'drizzle-orm'

const conditions = [eq(members.membershipStatus, 'active')]
if (q) conditions.push(ilike(users.name, `%${q}%`))
if (specialty) conditions.push(eq(members.specialty, specialty))
if (region) conditions.push(eq(members.region, region))

const results = await db
  .select({
    id: members.id,
    name: users.name,
    specialty: members.specialty,
    region: members.region,
    facility: members.facility,
    membershipStatus: members.membershipStatus,
    role: users.role,
  })
  .from(members)
  .innerJoin(users, eq(members.userId, users.id))
  .where(and(...conditions))
  .limit(100)
```

### 2. `src/components/member/member-directory-client.tsx`
`'use client'` component. Client-side search/filter UI that updates URL params (no fetch — Server Component re-renders with new searchParams).

```typescript
'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
// Use useDebouncedCallback or just debounce the router.push with a simple timeout

// UI: 
// - Search input: "Search by name..." — on change, updates ?q= param after 300ms debounce
// - Specialty select: All Specialties / Disease Control / Health Information Management / Nutrition / Other
// - Region select: All Regions / [all 16 Ghana regions]
// - Results count: "Showing X members"
// - Member card grid (2-3 cols)
```

Ghana's 16 regions:
```
Ahafo, Ashanti, Bono, Bono East, Central, Eastern, Greater Accra,
North East, Northern, Oti, Savannah, Upper East, Upper West,
Volta, Western, Western North
```

### 3. `src/components/member/member-card.tsx`
Card component for a single member.

```typescript
// Layout:
// - Avatar circle with initials (green-800 bg, white text)
// - Member name (bold)
// - Specialty badge (green)
// - Region (gray text with map pin icon)
// - Facility (gray text, smaller)
// - Membership status badge (active = green, inactive = gray)

// Use Shadcn Badge, Avatar (check if src/components/ui/avatar.tsx exists)
// Match the card style of src/components/home/leadership-preview.tsx
```

## Navigation Link
Check `src/app/(member)/layout.tsx` and `src/app/(member)/member-centre/page.tsx`. 
If the member centre has a sidebar nav or quick links section, add a "Member Directory" link pointing to `/member-centre/directory`.

## Ghana Specialty Values
From the DB schema enum (check `drizzle/schema.ts` for exact values):
- `disease-control` → "Disease Control"
- `health-information-management` → "Health Information Management"  
- `nutrition` → "Nutrition"

If the schema uses a different enum, match exactly.

## Style Guide
- Match green-800/green-700 brand palette
- Use existing Shadcn components: Badge, Card, Input, Select (check `src/components/ui/`)
- Avatar initials: take first letter of first + last name
- Empty state: friendly message "No members found matching your search"
- Loading: the Server Component re-renders on filter change, so no spinner needed

## Do NOT Touch
- Any dashboard files (`src/app/(dashboard)/**`)
- Any public-facing pages outside member centre
- `src/lib/email.ts` — Agent 1's domain
- `src/app/api/contact/route.ts` — Agent 1's domain
- `src/app/actions/event-registration.ts` — Agent 1 may modify this
- `drizzle/schema.ts`, `src/lib/db.ts`

## Verification
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx tsc --noEmit   # 0 errors
bun dev
# Visit http://localhost:3000/member-centre/directory (must be logged in)
# Search by name → URL updates → filtered results shown
# Filter by specialty → fewer results
```

## When Done
Update `plans/AGENT_CONTEXT.md` AGENT STATUS LOG:
```
| PM2 Phase 5B Agent 2 | Member Directory | DONE | <notes> |
```
