import 'server-only'
import { getAllPosts, getPostBySlug, type Post, type LeadershipMember } from '@/lib/data'

/**
 * Fetches posts: DB-published posts first, then falls back to JSON scraped data.
 * Only for use in server components / server actions.
 */
export async function getPublicPosts(): Promise<Post[]> {
  try {
    const { db } = await import('@/lib/db')
    const { posts: postsTable, users } = await import('../../drizzle/schema')
    const { eq, desc } = await import('drizzle-orm')

    const dbRows = await db
      .select({
        slug: postsTable.slug,
        title: postsTable.title,
        content: postsTable.content,
        excerpt: postsTable.excerpt,
        category: postsTable.category,
        featuredImage: postsTable.featuredImage,
        publishedAt: postsTable.publishedAt,
        createdAt: postsTable.createdAt,
        authorName: users.name,
      })
      .from(postsTable)
      .leftJoin(users, eq(postsTable.authorId, users.id))
      .where(eq(postsTable.status, 'published'))
      .orderBy(desc(postsTable.publishedAt))

    const mappedDb: Post[] = dbRows.map((p) => ({
      slug: p.slug,
      title: p.title,
      content: p.content,
      excerpt: p.excerpt ?? '',
      date: (p.publishedAt ?? p.createdAt).toISOString().split('T')[0],
      category: p.category as Post['category'],
      author: p.authorName ?? 'GAPHTO',
      featuredImage: p.featuredImage ?? '',
      localImage: '',
      tags: [],
      sourceUrl: '',
    }))

    const dbSlugs = new Set(mappedDb.map((p) => p.slug))
    const jsonPosts = getAllPosts().filter((p) => !dbSlugs.has(p.slug))

    return [...mappedDb, ...jsonPosts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  } catch {
    // DB not available — fall back to JSON data
    return getAllPosts()
  }
}

/**
 * Fetches active leadership members from the DB, ordered by sortOrder.
 * Only for use in server components / server actions.
 */
export async function getLeadershipFromDb(): Promise<LeadershipMember[]> {
  const { db } = await import('@/lib/db')
  const { leadership } = await import('../../drizzle/schema')
  const { asc, eq } = await import('drizzle-orm')
  const rows = await db
    .select()
    .from(leadership)
    .where(eq(leadership.isActive, true))
    .orderBy(asc(leadership.sortOrder))
  return rows.map((r) => ({
    name: r.name,
    role: r.role,
    imageUrl: r.imageUrl ?? '',
    localImage: '',
    bio: r.bio ?? null,
    facebookUrl: r.facebookUrl ?? null,
    sortOrder: r.sortOrder,
  }))
}

/**
 * Slug lookup: DB first (published only), fall back to JSON.
 * Only for use in server components / server actions.
 */
export async function getPublicPostBySlug(slug: string): Promise<Post | null> {
  try {
    const { db } = await import('@/lib/db')
    const { posts: postsTable, users } = await import('../../drizzle/schema')
    const { eq } = await import('drizzle-orm')

    const [dbPost] = await db
      .select({
        slug: postsTable.slug,
        title: postsTable.title,
        content: postsTable.content,
        excerpt: postsTable.excerpt,
        category: postsTable.category,
        status: postsTable.status,
        featuredImage: postsTable.featuredImage,
        publishedAt: postsTable.publishedAt,
        createdAt: postsTable.createdAt,
        authorName: users.name,
      })
      .from(postsTable)
      .leftJoin(users, eq(postsTable.authorId, users.id))
      .where(eq(postsTable.slug, slug))
      .limit(1)

    if (dbPost && dbPost.status === 'published') {
      const featuredImage = dbPost.featuredImage ?? ''
      return {
        slug: dbPost.slug,
        title: dbPost.title,
        content: dbPost.content,
        excerpt: dbPost.excerpt ?? '',
        date: (dbPost.publishedAt ?? dbPost.createdAt).toISOString().split('T')[0],
        category: dbPost.category as Post['category'],
        author: dbPost.authorName ?? 'GAPHTO',
        featuredImage,
        localImage: '',
        tags: [],
        sourceUrl: '',
      }
    }
  } catch {
    // DB not available — fall through to JSON
  }

  return getPostBySlug(slug) ?? null
}
