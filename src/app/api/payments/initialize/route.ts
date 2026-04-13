import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { eventRegistrations, events } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { initializePayment } from '@/lib/paystack'
import { auth } from '@/auth'
import { audit } from '@/lib/audit'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { registrationId } = (await req.json()) as { registrationId: string }

  if (!registrationId) {
    return NextResponse.json({ error: 'registrationId is required' }, { status: 400 })
  }

  const registration = await db.query.eventRegistrations.findFirst({
    where: eq(eventRegistrations.id, registrationId),
  })
  if (!registration) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  }

  // Verify ownership: registration must belong to the authenticated user
  if (registration.userId !== session.user.id && registration.email !== session.user.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const event = await db.query.events.findFirst({
    where: eq(events.id, registration.eventId),
  })
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  if (!event.priceGhs || Number(event.priceGhs) <= 0) {
    return NextResponse.json({ error: 'This event does not require payment' }, { status: 400 })
  }

  const reference = `GAPHTO-${registrationId.slice(0, 8)}-${Date.now()}`
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify?reference=${reference}&registrationId=${registrationId}&slug=${event.slug}`

  try {
    const result = await initializePayment({
      email: registration.email,
      amount: Number(event.priceGhs),
      reference,
      callbackUrl,
      metadata: {
        registrationId,
        eventId: event.id,
        eventTitle: event.title,
      },
    })

    void audit({ userId: session.user.id, action: 'payment.initialized', metadata: { registrationId, reference } })
    return NextResponse.json({ authorizationUrl: result.authorizationUrl })
  } catch (err) {
    console.error('[payments/initialize] Paystack error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Payment initialization failed' },
      { status: 502 }
    )
  }
}
