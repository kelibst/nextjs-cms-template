import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { galleryAlbums } from '../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const [updated] = await db.update(galleryAlbums).set({
    title: body.title,
    slug: body.slug,
    description: body.description ?? null,
    eventDate: body.eventDate ? new Date(body.eventDate) : null,
  }).where(eq(galleryAlbums.id, id)).returning()

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.delete(galleryAlbums).where(eq(galleryAlbums.id, id))
  return NextResponse.json({ success: true })
}
