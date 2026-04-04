import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { publications } from '../../../../drizzle/schema'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const [created] = await db.insert(publications).values({
    title: body.title,
    slug: body.slug,
    description: body.description ?? null,
    fileUrl: body.fileUrl ?? null,
    fileType: body.fileType ?? null,
    isMemberOnly: body.isMemberOnly ?? true,
    publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
  }).returning()

  return NextResponse.json(created, { status: 201 })
}
