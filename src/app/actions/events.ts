'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { events } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { can, type Role } from '@/lib/permissions'

type EventInput = {
  title: string
  slug?: string
  description?: string
  location?: string | null
  isOnline?: boolean
  startDate?: string | null
  endDate?: string | null
  registrationDeadline?: string | null
  priceGhs?: string
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

  await db.insert(events).values({
    title: data.title,
    slug: data.slug ?? `${slugify(data.title)}-${Date.now()}`,
    description: data.description ?? null,
    location: data.location ?? null,
    isOnline: data.isOnline ?? false,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
    priceGhs: data.priceGhs ?? '0',
    maxAttendees: data.maxAttendees ?? null,
    status: (data.status ?? 'upcoming') as typeof events.$inferInsert['status'],
    featuredImage: data.featuredImage ?? null,
  })

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
    priceGhs: data.priceGhs ?? '0',
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
