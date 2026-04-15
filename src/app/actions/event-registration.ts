'use server'

import { db } from '@/lib/db'
import { eventRegistrations, events } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { sendEventRegistrationConfirmation } from '@/lib/email'

export type RegistrationInput = {
  name: string
  email: string
  phone?: string
}

export type RegistrationResult = {
  success: true
  requiresPayment: boolean
  registrationId: string
  amount: string | null
}

export async function registerForEvent(
  eventId: string,
  data: RegistrationInput
): Promise<RegistrationResult> {
  // 1. Get event — throw if not found or closed
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })
  if (!event) throw new Error('Event not found')
  if (event.status === 'past' || event.status === 'cancelled') {
    throw new Error('Registration is closed for this event')
  }

  // 2. Check for duplicate registration by email
  const existing = await db
    .select()
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.email, data.email)
      )
    )
  if (existing.length > 0) {
    throw new Error('This email is already registered for this event')
  }

  // 3. Check capacity (if maxAttendees is set)
  if (event.maxAttendees) {
    const registrations = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId))
    if (registrations.length >= event.maxAttendees) {
      throw new Error('This event is fully booked')
    }
  }

  // 4. Insert registration
  const isPaid = event.price !== null && Number(event.price) > 0
  const [registration] = await db
    .insert(eventRegistrations)
    .values({
      eventId,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      paymentStatus: isPaid ? 'pending' : 'complete',
    })
    .returning()

  // 5. Send confirmation email — failure must NOT abort the registration
  try {
    const eventDate = event.startDate
      ? new Date(event.startDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'TBD'

    await sendEventRegistrationConfirmation({
      to: data.email,
      name: data.name,
      eventTitle: event.title,
      eventDate,
      location: event.location,
      isOnline: event.isOnline,
      isPaid,
      amount: event.price,
    })
  } catch (err) {
    console.error('[event-registration] Confirmation email failed:', err)
  }

  // 6. Return result
  return {
    success: true,
    requiresPayment: isPaid,
    registrationId: registration.id,
    amount: event.price,
  }
}
