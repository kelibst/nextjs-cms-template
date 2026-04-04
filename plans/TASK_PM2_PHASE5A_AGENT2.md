# PM2 Phase 5A — Agent 2: Public Events Page + Registration

## Read First
Read `plans/AGENT_CONTEXT.md` for full project context. Pay attention to the DB schema section and the auth/session patterns.

## Your Goal
Build a public events listing page, event detail page with OG metadata, and a registration form backed by a server action. No payment yet — that comes in Phase 5C.

## Stack Reminders
- Next.js 16 App Router, TypeScript, Tailwind CSS v4, Shadcn/ui
- DB: Drizzle ORM + PostgreSQL. Read `src/lib/db.ts` for exports.
- Auth: `import { auth } from '@/auth'` in Server Components
- Server actions pattern: see `src/app/actions/events.ts` for reference
- UI components: match existing cards style from `src/components/home/events-preview.tsx` or `src/components/shared/post-card.tsx`
- framer-motion is installed — use tasteful scroll animations matching the rest of the site

## Files To Create

### 1. `src/app/events/page.tsx`
Server Component. 

```typescript
// Fetch all events, split upcoming vs past
// upcoming: startDate >= now, ordered ASC
// past: startDate < now, ordered DESC
```

Layout: Page header "Events & CPD" → Upcoming Events section (card grid) → Past Events section (subdued card grid).

Card shows: event image (or placeholder), title, date formatted nicely, location/online badge, price badge (free or GHS amount), "View Details" button → `/events/[slug]`.

Add OG metadata:
```typescript
export const metadata = {
  title: 'Events & CPD',
  description: 'Upcoming and past CPD events from GAPHTO.',
}
```

### 2. `src/app/events/[slug]/page.tsx`
Server Component. Fetch event by slug. If not found, `notFound()`.

Layout:
- Hero: event image (full width), title overlay, date chip, location chip
- Body: description (render as HTML with `dangerouslySetInnerHTML` if it's HTML, or plain text)
- Sidebar/infobox: date, time, location, price, capacity remaining
- Registration form section: `<EventRegistrationForm event={event} />` — show only if event.status !== 'past'
- After successful registration: show success message "You're registered! Check your email for confirmation."

Add `generateMetadata`:
```typescript
export async function generateMetadata({ params }) {
  const event = await getEventBySlug(slug)
  return {
    title: event.title,
    description: event.description?.slice(0, 160),
    openGraph: { title: event.title, images: event.featuredImage ? [event.featuredImage] : [] },
  }
}
```

### 3. `src/components/events/event-registration-form.tsx`
`'use client'` component. Uses `useMutation` from `@tanstack/react-query` + `toast` from `sonner`.

Fields: Full Name (required), Email (required), Phone (optional).
Submit button: "Register" — disabled while pending.

```typescript
const mutation = useMutation({
  mutationFn: (data: RegistrationInput) => registerForEvent(eventId, data),
  onSuccess: (result) => {
    if (result.requiresPayment) {
      router.push(`/events/payment/${result.registrationId}`)
    } else {
      setRegistered(true)
      toast.success('Registration successful! Check your email.')
    }
  },
  onError: (err) => toast.error(err instanceof Error ? err.message : 'Registration failed'),
})
```

If `registered` state is true, show a green success card instead of the form.

### 4. `src/app/actions/event-registration.ts`
New server action file.

```typescript
'use server'
import { db } from '@/lib/db'
import { eventRegistrations, events } from '@/lib/db' // check actual export names
import { auth } from '@/auth'
import { eq, and } from 'drizzle-orm'

export async function registerForEvent(eventId: string, data: {
  name: string
  email: string
  phone?: string
}) {
  // 1. Get event — throw if not found or past
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) })
  if (!event) throw new Error('Event not found')
  if (event.status === 'past' || event.status === 'cancelled') throw new Error('Registration is closed for this event')

  // 2. Check for duplicate registration by email
  const existing = await db.select().from(eventRegistrations)
    .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.email, data.email)))
  if (existing.length > 0) throw new Error('This email is already registered for this event')

  // 3. Check capacity (if maxAttendees is set)
  if (event.maxAttendees) {
    const count = await db.$count(eventRegistrations, eq(eventRegistrations.eventId, eventId))
    if (count >= event.maxAttendees) throw new Error('This event is fully booked')
  }

  // 4. Insert registration
  const isPaid = Number(event.priceGhs) > 0
  const [registration] = await db.insert(eventRegistrations).values({
    eventId,
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    paymentStatus: isPaid ? 'pending' : 'complete',
  }).returning()

  // 5. Return result
  return {
    success: true,
    requiresPayment: isPaid,
    registrationId: registration.id,
    amount: event.priceGhs,
  }
}
```

**Read `drizzle/schema.ts` to get exact column names before writing.** The schema uses camelCase in Drizzle.

## File To Possibly Modify

### `src/components/layout/header.tsx`
Read it first. If "Events" is not already in the nav links array, add it:
```typescript
{ href: '/events', label: 'Events' }
```
Only modify if the link is genuinely missing. Check the existing nav items array.

## Do NOT Touch
- `src/app/sitemap.ts` — Agent 1's domain
- `src/app/robots.ts` — Agent 1's domain
- `src/app/layout.tsx` — Agent 1 modifies this
- `src/app/news/**` — existing, leave unchanged
- `src/app/gallery/**` — existing, leave unchanged
- Any dashboard files
- Any existing server actions in `src/app/actions/`

## Style Guide
- Match the green-800/green-700 brand color palette
- Use existing Shadcn UI components (Button, Badge, Card) from `src/components/ui/`
- Event cards: match `src/components/home/events-preview.tsx` style
- Page headers: match `src/components/shared/page-header.tsx` pattern
- Scroll animations: `framer-motion` with `initial={{ opacity: 0, y: 20 }}` + `whileInView={{ opacity: 1, y: 0 }}`

## Verification
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx tsc --noEmit           # 0 errors
bun dev
# Visit http://localhost:3000/events — list renders
# Click an event — detail page renders
# Submit registration form — success toast appears
```

## When Done
Update `plans/AGENT_CONTEXT.md` AGENT STATUS LOG:
```
| PM2 Phase 5A Agent 2 | Public Events Page + Registration | DONE | <notes> |
```
