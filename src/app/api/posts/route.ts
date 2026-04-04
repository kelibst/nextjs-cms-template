import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { posts } from '../../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { can, type Role } from '@/lib/permissions'

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!can(session.user.role as Role, 'posts:create')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, content, category, status, excerpt, featuredImage } = await req.json()
  if (!title || !category) return NextResponse.json({ error: 'title and category required' }, { status: 400 })

  let baseSlug = slugify(title)
  let slug = baseSlug
  let i = 2
  while (true) {
    const [existing] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1)
    if (!existing) break
    slug = `${baseSlug}-${i++}`
  }

  const [created] = await db.insert(posts).values({
    title,
    slug,
    content: content ?? '',
    category,
    status: status ?? 'draft',
    excerpt: excerpt ?? null,
    featuredImage: featuredImage ?? null,
    authorId: session.user.id,
    publishedAt: status === 'published' ? new Date() : null,
  }).returning()

  return NextResponse.json(created, { status: 201 })
}
