import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { events } from '../../../../drizzle/schema'
import { can, type Role } from '@/lib/permissions'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!can(session.user.role as Role, 'events:manage')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const [created] = await db.insert(events).values({
    title: body.title,
    slug: body.slug,
    description: body.description ?? null,
    location: body.location ?? null,
    isOnline: body.isOnline ?? false,
    startDate: body.startDate ? new Date(body.startDate) : null,
    endDate: body.endDate ? new Date(body.endDate) : null,
    registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : null,
    priceGhs: body.priceGhs ?? '0',
    maxAttendees: body.maxAttendees ?? null,
    status: body.status ?? 'upcoming',
    featuredImage: body.featuredImage ?? null,
  }).returning()

  return NextResponse.json(created, { status: 201 })
}
