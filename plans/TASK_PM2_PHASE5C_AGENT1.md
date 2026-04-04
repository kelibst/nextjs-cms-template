# PM2 Phase 5C — Agent 1: Paystack Payment Integration

## Read First
Read `plans/AGENT_CONTEXT.md` for full project context (Phase 5 section).

## Your Goal
Add payment processing to event registration using Paystack's REST API (no npm package — use fetch). Free events remain unchanged. Paid events redirect to a payment page, then to Paystack's hosted checkout.

## Step 0 — Schema Migration
Add `paymentReference` column to `eventRegistrations` table.

Read `drizzle/schema.ts` to find the `eventRegistrations` table definition. Add:
```typescript
paymentReference: text('payment_reference'),
```

Then read `drizzle/drizzle.config.ts` and `drizzle/migrate.ts` to understand how migrations work in this project.

Generate and run the migration:
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx drizzle-kit generate
bun run drizzle/migrate.ts
# OR if the project uses: bun run db:migrate
# Check package.json scripts first
```

## Files To Create

### 1. `src/lib/paystack.ts`
Paystack REST API helpers using native fetch.

```typescript
const PAYSTACK_BASE = 'https://api.paystack.co'

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  }
}

export interface PaystackInitResponse {
  authorizationUrl: string
  accessCode: string
  reference: string
}

export async function initializePayment(params: {
  email: string
  amount: number          // in GHS — multiply by 100 for pesewas
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
}): Promise<PaystackInitResponse> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100),   // convert GHS → pesewas
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? 'Paystack initialization failed')
  }
  const data = await res.json() as { data: { authorization_url: string; access_code: string; reference: string } }
  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  }
}

export async function verifyPayment(reference: string): Promise<{
  status: string          // 'success' | 'failed' | 'abandoned'
  amount: number          // in pesewas
  email: string
  metadata: Record<string, unknown>
}> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error('Paystack verification failed')
  const data = await res.json() as { data: { status: string; amount: number; customer: { email: string }; metadata: Record<string, unknown> } }
  return {
    status: data.data.status,
    amount: data.data.amount,
    email: data.data.customer.email,
    metadata: data.data.metadata,
  }
}
```

### 2. `src/app/api/payments/initialize/route.ts`
POST handler. Receives `{ registrationId }`. Looks up registration + event. Calls Paystack. Returns `{ authorizationUrl }`.

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { eventRegistrations, events } from '@/lib/db'  // check actual exports
import { eq } from 'drizzle-orm'
import { initializePayment } from '@/lib/paystack'
import { nanoid } from 'nanoid'   // check if nanoid is installed — if not, use crypto.randomUUID()

export async function POST(req: Request) {
  const session = await auth()
  const { registrationId } = await req.json() as { registrationId: string }

  const registration = await db.query.eventRegistrations.findFirst({
    where: eq(eventRegistrations.id, registrationId),
  })
  if (!registration) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const event = await db.query.events.findFirst({ where: eq(events.id, registration.eventId) })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const reference = `GAPHTO-${registrationId.slice(0, 8)}-${Date.now()}`
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify?reference=${reference}&registrationId=${registrationId}&slug=${event.slug}`

  const result = await initializePayment({
    email: registration.email,
    amount: Number(event.priceGhs),
    reference,
    callbackUrl,
    metadata: { registrationId, eventId: event.id, eventTitle: event.title },
  })

  return NextResponse.json({ authorizationUrl: result.authorizationUrl })
}
```

### 3. `src/app/api/payments/verify/route.ts`
GET handler (Paystack redirects here after payment). Verifies with Paystack, updates DB, redirects user.

```typescript
export async function GET(req: Request) {
  const url = new URL(req.url)
  const reference = url.searchParams.get('reference')
  const registrationId = url.searchParams.get('registrationId')
  const slug = url.searchParams.get('slug')

  if (!reference || !registrationId) {
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/events?payment=failed`)
  }

  try {
    const payment = await verifyPayment(reference)
    if (payment.status === 'success') {
      await db.update(eventRegistrations)
        .set({ paymentStatus: 'complete', paymentReference: reference })
        .where(eq(eventRegistrations.id, registrationId))
      return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/events/${slug}?registered=true`)
    } else {
      return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/events/${slug}?payment=failed`)
    }
  } catch {
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/events?payment=error`)
  }
}
```

### 4. `src/app/events/payment/[registrationId]/page.tsx`
Intermediate payment page shown between registration form submission and Paystack checkout.

Server Component. Fetch the registration + event. Show:
- Event title and date
- Registrant name + email
- Amount in GHS
- "Proceed to Payment" button (client component that POSTs to `/api/payments/initialize` then redirects to `authorizationUrl`)

Create a small `src/components/events/payment-button.tsx` client component:
```typescript
'use client'
// Button that calls /api/payments/initialize then window.location.href = authorizationUrl
```

## Files To Modify

### `src/app/actions/event-registration.ts`
Read the current file (modified by Phase 5B Agent 1). No change to the action itself — the return value already includes `requiresPayment` and `registrationId`. No modification needed IF the action already handles paid vs free correctly.

**Verify only:** confirm it returns `{ requiresPayment: true, registrationId, amount }` for paid events. If it does, no change needed.

### `src/components/events/event-registration-form.tsx`
Read the file. It should already handle `requiresPayment: true` by redirecting to `/events/payment/[registrationId]`. **Verify only** — if that redirect is already there, no change needed.

## Do NOT Touch
- Fund application files (Agent 2's domain)
- `src/lib/email.ts`
- `src/lib/db.ts`
- Member directory files
- Any dashboard files (except adding fund-applications page is Agent 2's job)
- `drizzle/schema.ts` after the migration is added — only add the one column

## Environment Variables Required
```
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Verification
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx tsc --noEmit    # 0 errors
bun run build        # 0 errors
# Manual: register for a paid event → payment page shows → Paystack checkout
# Manual: register for a free event → success message (no payment page)
```

## When Done
Update `plans/AGENT_CONTEXT.md` AGENT STATUS LOG:
```
| PM2 Phase 5C Agent 1 | Paystack Payment Integration | DONE | <notes> |
```
