# PM2 Phase 5A — Agent 1: SEO & Sitemap

## Read First
Read `plans/AGENT_CONTEXT.md` for full project context.

## Your Goal
Add dynamic sitemap, robots.txt, and Open Graph metadata to improve SEO. No new packages needed — Next.js 16 has built-in sitemap support.

## Files To Create

### 1. `src/app/sitemap.ts`
Next.js built-in sitemap route. Must export a default async function returning `MetadataRoute.Sitemap`.

```typescript
import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { posts, events, galleryAlbums } from '@/lib/db' // check actual exports

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
    { url: `${baseUrl}/fund`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  // Dynamic: posts
  const allPosts = await db.select({ slug: posts.slug, updatedAt: posts.updatedAt }).from(posts).where(/* status = published */)
  const postRoutes = allPosts.map(p => ({
    url: `${baseUrl}/news/${p.slug}`,
    lastModified: p.updatedAt ?? new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Dynamic: events
  const allEvents = await db.select({ slug: events.slug, createdAt: events.createdAt }).from(events)
  const eventRoutes = allEvents.map(e => ({
    url: `${baseUrl}/events/${e.slug}`,
    lastModified: e.createdAt ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...postRoutes, ...eventRoutes]
}
```

**Important:** Read `src/lib/db.ts` to understand actual export names before writing. Adjust table/column names to match. The `posts` table has a `status` column — filter for `status = 'published'`.

### 2. `src/app/robots.ts`
```typescript
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gaphto.org'
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard/', '/api/'] },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

## Files To Modify

### 3. `src/app/layout.tsx`
Read the file first. Add a default `metadata` export at the top level (before the RootLayout function). Keep all existing imports, Providers, and Toaster unchanged.

```typescript
export const metadata: Metadata = {
  title: { default: 'GAPHTO — Ghana Association of Public Health Technical Officers', template: '%s | GAPHTO' },
  description: 'Ghana Association of Public Health Technical Officers — Public Health, Our Concern. Serving since 1984.',
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: 'https://gaphto.org',
    siteName: 'GAPHTO',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630, alt: 'GAPHTO' }],
  },
  twitter: { card: 'summary_large_image' },
}
```

Note: Use `/images/placeholder.jpg` as the OG image if `/images/og-default.jpg` doesn't exist — check `public/images/` first.

### 4. `src/app/news/[slug]/page.tsx`
Read the file first. Add a `generateMetadata` function. Pattern:

```typescript
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  // fetch post by slug from DB (same query pattern as the page itself)
  const post = await db.query.posts.findFirst({ where: eq(posts.slug, slug) })
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt ?? post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.featuredImage ? [post.featuredImage] : [],
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
    },
  }
}
```

### 5. `src/app/gallery/page.tsx`
Add basic metadata export (static is fine):
```typescript
export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photo gallery from GAPHTO events and activities.',
}
```

## Do NOT Touch
- Any file under `src/app/(dashboard)/`
- Any file under `src/app/actions/`
- Any file under `src/app/api/`
- `src/app/events/**` — Agent 2 owns these
- `src/components/dashboard/**`
- `src/lib/db.ts`, `src/auth.ts`

## Verification
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx tsc --noEmit           # 0 errors
bun dev                     # start dev server
curl http://localhost:3000/sitemap.xml   # valid XML with URLs
curl http://localhost:3000/robots.txt    # contains Sitemap: line
```

## When Done
Update `plans/AGENT_CONTEXT.md` AGENT STATUS LOG:
```
| PM2 Phase 5A Agent 1 | SEO + Sitemap | DONE | <notes> |
```
