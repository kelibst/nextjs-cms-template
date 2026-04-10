# Task: Blog/News CMS — Wire Public Pages to DB (Agent 2)

> Reference: `plans/AGENT_CONTEXT.md` for project rules (bun, proxy.ts, etc.)

---

## Goal
The dashboard already has a fully working post management system (create/edit/delete). But the public `/news` pages still read from JSON files. This task wires them to the database so new posts created in the dashboard appear on the public site immediately.

---

## Current State (READ THIS CAREFULLY)

### What already works
- `src/app/(dashboard)/dashboard/posts/page.tsx` — DB-backed list, DONE
- `src/app/(dashboard)/dashboard/posts/new/page.tsx` — uses `<PostEditor />`, DONE
- `src/app/(dashboard)/dashboard/posts/[id]/edit/page.tsx` — DONE
- `src/app/actions/posts.ts` — `createPost`, `updatePost`, `deletePost` — DONE but missing public revalidatePaths

### What's broken
- `src/app/(public)/news/page.tsx` — calls `getAllPosts()` which reads JSON only
- `src/app/(public)/news/[slug]/page.tsx` — calls `getPostBySlug()` which reads JSON only
- New posts created in dashboard are invisible to the public site
- `posts.ts` actions only revalidate `/dashboard/posts`, not `/news`

### Data shape mismatch
JSON Post type (from `src/lib/data.ts`):
```typescript
{ slug, title, content, excerpt, date: string, category, author: string, featuredImage, localImage, tags, sourceUrl }
```
DB Post type (from `drizzle/schema.ts`):
```typescript
{ id, slug, title, content, excerpt, category, status, featuredImage, authorId, publishedAt, createdAt, updatedAt }
// + author name from JOIN with users table
```

---

## Files to Modify

### 1. `src/lib/data.ts` — Add async merged post fetchers

Add these imports at the top (after existing imports):
```typescript
import { db } from '@/lib/db'
import { posts as postsTable, users } from '../../drizzle/schema'
import { eq, desc } from 'drizzle-orm'
```

Add two new async functions AFTER the existing `getAllPosts()`:

```typescript
// Fetch published DB posts merged with JSON posts (DB takes priority by slug)
export async function getPublicPosts(): Promise<Post[]> {
  const dbRows = await db
    .select({
      id: postsTable.id,
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
    category: p.category,
    author: p.authorName ?? 'GAPHTO',
    featuredImage: p.featuredImage ?? '',
    localImage: null,
    tags: [],
    sourceUrl: null,
  }))

  const dbSlugs = new Set(mappedDb.map((p) => p.slug))
  const jsonPosts = getAllPosts().filter((p) => !dbSlugs.has(p.slug))

  return [...mappedDb, ...jsonPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

// Get a single post: check DB first (any status visible to admin, published only for public), fall back to JSON
export async function getPublicPostBySlug(slug: string): Promise<Post | null> {
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
    return {
      slug: dbPost.slug,
      title: dbPost.title,
      content: dbPost.content,
      excerpt: dbPost.excerpt ?? '',
      date: (dbPost.publishedAt ?? dbPost.createdAt).toISOString().split('T')[0],
      category: dbPost.category,
      author: dbPost.authorName ?? 'GAPHTO',
      featuredImage: dbPost.featuredImage ?? '',
      localImage: null,
      tags: [],
      sourceUrl: null,
    }
  }

  // Fall back to JSON
  return getPostBySlug(slug) ?? null
}
```

**IMPORTANT:** The `Post` type is inferred from JSON structure. If TypeScript complains about `localImage: null` or `sourceUrl: null`, look at the `Post` type definition in `data.ts` and make the fields optional or handle the null properly.

---

### 2. `src/app/actions/posts.ts` — Add public page revalidation

In each of the three server actions (`createPost`, `updatePost`, `deletePost`), REPLACE the single revalidatePath call with:

```typescript
revalidatePath('/dashboard/posts')
revalidatePath('/news', 'layout')
```

The `'layout'` variant on `/news` invalidates both `/news` and all `/news/[slug]` child routes.

---

### 3. `src/app/(public)/news/page.tsx` — Read from DB

Replace:
```typescript
export default function NewsPage() {
  const posts = getAllPosts();
```

With:
```typescript
export const dynamic = 'force-dynamic'

// change the function to async:
export default async function NewsPage() {
  const posts = await getPublicPosts();
```

Also update the import to add `getPublicPosts`:
```typescript
import { getPublicPosts } from "@/lib/data";
```
Remove the `getAllPosts` import if it's no longer used in this file.

---

### 4. `src/app/(public)/news/[slug]/page.tsx` — Check DB first

Add at the top (before imports):
```typescript
export const dynamic = 'force-dynamic'
```

Remove the `generateStaticParams` function entirely (not needed with force-dynamic).

Update imports to add `getPublicPostBySlug`:
```typescript
import { getPublicPostBySlug, getRelatedPosts, decodeEntities, postImagePath } from "@/lib/data";
```
Remove `getAllPosts` and `getPostBySlug` from the import.

Update `generateMetadata`:
```typescript
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);
  if (!post) return {};
  // rest unchanged
}
```

Update the page component:
```typescript
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = getRelatedPosts(post, 3);  // still uses JSON-based helper, OK for now
  // rest unchanged
}
```

---

## Post type check
Before writing code, read `src/lib/data.ts` lines 1-50 to see the exact `Post` type/interface. Adjust the `null` fields (`localImage`, `sourceUrl`, `tags`) to match what the type allows. If `Post` has `localImage: string` (not `string | null`), use `''` instead of `null`.

---

## Verification
1. Create a new post in `/dashboard/posts/new` with status "published"
2. Go to `/news` — the new post should appear at the top of the list
3. Click through to `/news/[slug]` — the post content renders correctly
4. Edit the post title in dashboard → save → reload `/news/[slug]` → new title appears
5. Change post status to "draft" → `/news` no longer shows it
6. JSON posts (scraped) still appear for any slug not in DB
