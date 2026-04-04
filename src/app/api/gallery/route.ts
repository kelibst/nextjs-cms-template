import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { galleryAlbums } from '../../../../drizzle/schema'

export async function GET() {
  const albums = await db.select().from(galleryAlbums)
  return NextResponse.json(albums)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, slug, description, eventDate } = await req.json()
  const [created] = await db.insert(galleryAlbums).values({
    title,
    slug,
    description: description ?? null,
    eventDate: eventDate ? new Date(eventDate) : null,
  }).returning()

  return NextResponse.json(created, { status: 201 })
}
