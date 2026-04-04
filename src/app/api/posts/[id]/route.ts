import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { posts } from '../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { can, type Role } from '@/lib/permissions'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const canEditAny = can(session.user.role as Role, 'posts:edit_any')
  const isOwner = post.authorId === session.user.id
  if (!canEditAny && !isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const updates: Partial<typeof posts.$inferInsert> = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.slug !== undefined) updates.slug = body.slug
  if (body.content !== undefined) updates.content = body.content
  if (body.excerpt !== undefined) updates.excerpt = body.excerpt
  if (body.category !== undefined) updates.category = body.category
  if (body.status !== undefined) {
    updates.status = body.status
    if (body.status === 'published' && !post.publishedAt) {
      updates.publishedAt = new Date()
    }
  }
  if (body.featuredImage !== undefined) updates.featuredImage = body.featuredImage
  updates.updatedAt = new Date()

  const [updated] = await db.update(posts).set(updates).where(eq(posts.id, id)).returning()
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!can(session.user.role as Role, 'posts:delete')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await db.delete(posts).where(eq(posts.id, id))
  return NextResponse.json({ success: true })
}
