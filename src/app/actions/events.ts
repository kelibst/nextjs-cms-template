'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { events, members, users, emailPreferences } from '../../../drizzle/schema'
import { eq, and, isNull, or } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { can, type Role } from '@/lib/permissions'
import { sendEventAlertEmail } from '@/lib/email'

type EventInput = {
  title: string
  slug?: string
  description?: string
  location?: string | null
  isOnline?: boolean
  startDate?: string | null
  endDate?: string | null
  registrationDeadline?: string | null
  price?: string
  maxAttendees?: number | null
  status?: string
  featuredImage?: string | null
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function createEvent(data: EventInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'events:manage')) throw new Error('Forbidden')

  const slug = data.slug ?? `${slugify(data.title)}-${Date.now()}`

  await db.insert(events).values({
    title: data.title,
    slug,
    description: data.description ?? null,
    location: data.location ?? null,
    isOnline: data.isOnline ?? false,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
    price: data.price ?? '0',
    maxAttendees: data.maxAttendees ?? null,
    status: (data.status ?? 'upcoming') as typeof events.$inferInsert['status'],
    featuredImage: data.featuredImage ?? null,
  })

  // Fire-and-forget: send event alert emails to opted-in active members
  if (data.status === 'upcoming' || data.status === 'ongoing') {
    try {
      const dateStr = data.startDate
        ? new Date(data.startDate).toLocaleDateString('en-US', { dateStyle: 'long' })
        : 'TBD'

      // Fetch active members with their user info
      const activeMembers = await db
        .select({ email: users.email, name: users.name, userId: users.id })
        .from(members)
        .innerJoin(users, eq(members.userId, users.id))
        .where(eq(members.membershipStatus, 'active'))

      // Fetch email preferences for these users
      const userIds = activeMembers.map((m) => m.userId)
      const prefs = userIds.length > 0
        ? await db
            .select({ userId: emailPreferences.userId, receiveEventAlerts: emailPreferences.receiveEventAlerts })
            .from(emailPreferences)
            .where(
              or(
                ...userIds.map((id) => eq(emailPreferences.userId, id))
              )
            )
        : []
      const prefMap = new Map(prefs.map((p) => [p.userId, p.receiveEventAlerts]))

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

      for (const member of activeMembers) {
        // Default to true if no preference row exists
        const wantsAlerts = prefMap.has(member.userId) ? prefMap.get(member.userId) : true
        if (!wantsAlerts) continue
        await sendEventAlertEmail(member.email, member.name, data.title, dateStr, slug, appUrl)
      }
    } catch (err) {
      console.error('[createEvent] Failed to send event alert emails:', err)
    }
  }

  revalidatePath('/dashboard/events')
  redirect('/dashboard/events')
}

export async function updateEvent(id: string, data: EventInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'events:manage')) throw new Error('Forbidden')

  await db.update(events).set({
    title: data.title,
    description: data.description ?? null,
    location: data.location ?? null,
    isOnline: data.isOnline ?? false,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
    price: data.price ?? '0',
    maxAttendees: data.maxAttendees ?? null,
    status: (data.status ?? 'upcoming') as typeof events.$inferInsert['status'],
    featuredImage: data.featuredImage ?? null,
  }).where(eq(events.id, id))

  revalidatePath('/dashboard/events')
  redirect('/dashboard/events')
}

export async function deleteEvent(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'events:manage')) throw new Error('Forbidden')

  await db.delete(events).where(eq(events.id, id))
  revalidatePath('/dashboard/events')
}
