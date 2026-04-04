import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { publications } from '../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const [updated] = await db.update(publications).set({
    title: body.title,
    description: body.description ?? null,
    fileUrl: body.fileUrl ?? null,
    fileType: body.fileType ?? null,
    isMemberOnly: body.isMemberOnly,
    publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
  }).where(eq(publications.id, id)).returning()

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.delete(publications).where(eq(publications.id, id))
  return NextResponse.json({ success: true })
}
