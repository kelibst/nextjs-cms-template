import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { galleryImages } from '../../../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ imageId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { imageId } = await params
  const body = await req.json()
  const updates: Partial<typeof galleryImages.$inferInsert> = {}
  if (body.caption !== undefined) updates.caption = body.caption
  if (body.altText !== undefined) updates.altText = body.altText
  if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder

  const [updated] = await db.update(galleryImages).set(updates).where(eq(galleryImages.id, imageId)).returning()
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ imageId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { imageId } = await params
  await db.delete(galleryImages).where(eq(galleryImages.id, imageId))
  return NextResponse.json({ success: true })
}
