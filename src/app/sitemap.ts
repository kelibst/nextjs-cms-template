import type { MetadataRoute } from 'next'
import { db, posts, events } from '@/lib/db'
import { eq } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gaphto.org'

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/leadership`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/practice-areas`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/publications`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/fund`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/fund/apply`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/member-centre/directory`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
  ]

  // Dynamic: published posts
  let postRoutes: MetadataRoute.Sitemap = []
  try {
    const allPosts = await db
      .select({ slug: posts.slug, updatedAt: posts.updatedAt })
      .from(posts)
      .where(eq(posts.status, 'published'))
    postRoutes = allPosts.map((p) => ({
      url: `${baseUrl}/news/${p.slug}`,
      lastModified: p.updatedAt ?? new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {
    // DB may not be available at build time — skip dynamic routes gracefully
  }

  // Dynamic: events
  let eventRoutes: MetadataRoute.Sitemap = []
  try {
    const allEvents = await db
      .select({ slug: events.slug, createdAt: events.createdAt })
      .from(events)
    eventRoutes = allEvents.map((e) => ({
      url: `${baseUrl}/events/${e.slug}`,
      lastModified: e.createdAt ?? new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // DB may not be available at build time — skip dynamic routes gracefully
  }

  return [...staticRoutes, ...postRoutes, ...eventRoutes]
}
