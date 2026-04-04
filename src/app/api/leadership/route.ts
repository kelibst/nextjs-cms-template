import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { leadership } from '../../../../drizzle/schema'
import { asc } from 'drizzle-orm'

export async function GET() {
  const rows = await db.select().from(leadership).orderBy(asc(leadership.sortOrder))
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const isAdmin = ['super_admin', 'admin'].includes(session.user.role)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const [created] = await db.insert(leadership).values({
    name: body.name,
    role: body.role,
    sortOrder: body.sortOrder ?? 0,
    bio: body.bio ?? null,
    email: body.email ?? null,
    facebookUrl: body.facebookUrl ?? null,
    twitterUrl: body.twitterUrl ?? null,
    imageUrl: body.imageUrl ?? null,
    isActive: body.isActive ?? true,
    termStart: body.termStart ? new Date(body.termStart) : null,
    termEnd: body.termEnd ? new Date(body.termEnd) : null,
  }).returning()

  return NextResponse.json(created, { status: 201 })
}
