import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { leadership } from '../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const isAdmin = ['super_admin', 'admin'].includes(session.user.role)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()

  const updates: Partial<typeof leadership.$inferInsert> = {
    name: body.name,
    role: body.role,
    sortOrder: body.sortOrder,
    bio: body.bio ?? null,
    email: body.email ?? null,
    facebookUrl: body.facebookUrl ?? null,
    twitterUrl: body.twitterUrl ?? null,
    imageUrl: body.imageUrl ?? null,
    isActive: body.isActive,
    termStart: body.termStart ? new Date(body.termStart) : null,
    termEnd: body.termEnd ? new Date(body.termEnd) : null,
  }

  const [updated] = await db.update(leadership).set(updates).where(eq(leadership.id, id)).returning()
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const isAdmin = ['super_admin', 'admin'].includes(session.user.role)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await db.delete(leadership).where(eq(leadership.id, id))
  return NextResponse.json({ success: true })
}
