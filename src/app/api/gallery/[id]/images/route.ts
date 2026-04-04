import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { galleryImages } from '../../../../../../drizzle/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const images = await db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.albumId, id))
    .orderBy(asc(galleryImages.sortOrder))
  return NextResponse.json(images)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { url, caption, altText, sortOrder } = await req.json()
  const [created] = await db.insert(galleryImages).values({
    albumId: id,
    url,
    caption: caption ?? null,
    altText: altText ?? null,
    sortOrder: sortOrder ?? 0,
  }).returning()

  return NextResponse.json(created, { status: 201 })
}
