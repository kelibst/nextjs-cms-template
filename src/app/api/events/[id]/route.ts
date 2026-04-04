import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { events } from '../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const [updated] = await db.update(events).set({
    title: body.title,
    description: body.description ?? null,
    location: body.location ?? null,
    isOnline: body.isOnline,
    startDate: body.startDate ? new Date(body.startDate) : null,
    endDate: body.endDate ? new Date(body.endDate) : null,
    registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : null,
    priceGhs: body.priceGhs,
    maxAttendees: body.maxAttendees ?? null,
    status: body.status,
    featuredImage: body.featuredImage ?? null,
  }).where(eq(events.id, id)).returning()

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.delete(events).where(eq(events.id, id))
  return NextResponse.json({ success: true })
}
