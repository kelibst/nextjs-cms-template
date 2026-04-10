'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { posts } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { can, type Role } from '@/lib/permissions'

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

export async function createPost(data: {
  title: string
  content: string
  category: string
  status: string
  excerpt?: string
  featuredImage?: string
}) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'posts:create')) throw new Error('Forbidden')

  let baseSlug = slugify(data.title)
  let slug = baseSlug
  let i = 2
  while (true) {
    const [existing] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1)
    if (!existing) break
    slug = `${baseSlug}-${i++}`
  }

  const [created] = await db.insert(posts).values({
    title: data.title,
    slug,
    content: data.content,
    category: data.category as typeof posts.$inferInsert['category'],
    status: data.status as typeof posts.$inferInsert['status'],
    excerpt: data.excerpt ?? null,
    featuredImage: data.featuredImage ?? null,
    authorId: session.user.id,
    publishedAt: data.status === 'published' ? new Date() : null,
  }).returning()

  revalidatePath('/dashboard/posts')
  revalidatePath('/news', 'layout')
  return created
}

export async function updatePost(id: string, data: Partial<{
  title: string
  slug: string
  content: string
  category: string
  status: string
  excerpt: string
  featuredImage: string
}>) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
  if (!post) throw new Error('Not found')

  const canEditAny = can(session.user.role as Role, 'posts:edit_any')
  const isOwner = post.authorId === session.user.id
  if (!canEditAny && !isOwner) throw new Error('Forbidden')

  type PostInsert = typeof posts.$inferInsert
  const updates: Partial<PostInsert> = {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.slug !== undefined && { slug: data.slug }),
    ...(data.content !== undefined && { content: data.content }),
    ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
    ...(data.featuredImage !== undefined && { featuredImage: data.featuredImage }),
    ...(data.category !== undefined && { category: data.category as PostInsert['category'] }),
    ...(data.status !== undefined && { status: data.status as PostInsert['status'] }),
    updatedAt: new Date(),
  }
  if (data.status === 'published' && !post.publishedAt) updates.publishedAt = new Date()

  const [updated] = await db.update(posts).set(updates).where(eq(posts.id, id)).returning()
  revalidatePath('/dashboard/posts')
  revalidatePath('/news', 'layout')
  return updated
}

export async function deletePost(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'posts:delete')) throw new Error('Forbidden')

  await db.delete(posts).where(eq(posts.id, id))
  revalidatePath('/dashboard/posts')
  revalidatePath('/news', 'layout')
}
