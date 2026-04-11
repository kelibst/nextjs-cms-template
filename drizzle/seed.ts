import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

import {
  users,
  leadership,
  posts,
  galleryAlbums,
  galleryImages,
  events,
  siteSettings,
  publications,
} from './schema'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const SCRAPER_OUTPUT = path.resolve(__dirname, '../scraper/output')

function loadJson<T = unknown>(filename: string): T | null {
  const filePath = path.join(SCRAPER_OUTPUT, filename)
  if (!existsSync(filePath)) {
    console.warn(`[seed] WARNING: ${filename} not found — skipping.`)
    return null
  }
  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as T
  } catch (err) {
    console.warn(`[seed] WARNING: Failed to parse ${filename} — skipping.`, err)
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  const db = drizzle(pool)

  const summary: Record<string, number> = {}

  // ── 1. Seed test users ────────────────────────────────────────────────────
  const testUsers = [
    { email: 'superadmin@gaphto.org', name: 'Super Admin', role: 'super_admin' as const },
    { email: 'admin@gaphto.org',      name: 'Admin User',  role: 'admin'       as const },
    { email: 'editor@gaphto.org',     name: 'Editor User', role: 'editor'      as const },
    { email: 'member@gaphto.org',     name: 'Member User', role: 'member'      as const },
  ]

  const BCRYPT_ROUNDS = 12
  const PASSWORD = 'Test1234!'

  let userCount = 0
  for (const u of testUsers) {
    const passwordHash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS)
    await db
      .insert(users)
      .values({ email: u.email, name: u.name, role: u.role, passwordHash })
      .onConflictDoNothing()
    userCount++
  }
  summary['users'] = userCount

  // ── 2. Leadership ─────────────────────────────────────────────────────────
  type LeadershipRecord = {
    name: string
    role: string
    imageUrl?: string | null
    localImage?: string | null
    bio?: string | null
    facebookUrl?: string | null
    twitterUrl?: string | null
    email?: string | null
    sortOrder?: number
  }

  const leadershipData = loadJson<LeadershipRecord[]>('leadership.json')
  if (leadershipData && Array.isArray(leadershipData)) {
    const rows = leadershipData.map((l, idx) => ({
      name: l.name,
      role: l.role,
      imageUrl: l.localImage ?? l.imageUrl ?? null,
      bio: l.bio ?? null,
      facebookUrl: l.facebookUrl ?? null,
      twitterUrl: l.twitterUrl ?? null,
      email: l.email ?? null,
      sortOrder: l.sortOrder ?? idx,
      isActive: true,
    }))
    if (rows.length > 0) {
      await db.insert(leadership).values(rows).onConflictDoNothing()
    }
    summary['leadership'] = rows.length
  }

  // ── 3. Posts helper ───────────────────────────────────────────────────────
  type PostRecord = {
    slug: string
    title: string
    content: string
    excerpt?: string | null
    date?: string | null
    category: 'gaphto-news' | 'health-news' | 'blog' | 'announcement'
    featuredImage?: string | null
    localImage?: string | null
  }

  async function seedPosts(filename: string, category: PostRecord['category']) {
    const data = loadJson<PostRecord[]>(filename)
    if (!data || !Array.isArray(data)) return 0

    const rows = data.map((p) => ({
      slug: p.slug,
      title: p.title,
      content: p.content,
      excerpt: p.excerpt ?? null,
      category,
      // WXR parser sets status to 'published' or 'draft'; REST API always 'published'
      status: ((p as any).status === 'draft' ? 'draft' : 'published') as 'draft' | 'published',
      featuredImage: p.localImage ?? p.featuredImage ?? null,
      publishedAt: p.date ? new Date(p.date) : null,
    }))

    if (rows.length > 0) {
      await db.insert(posts).values(rows).onConflictDoNothing()
    }
    return rows.length
  }

  summary['posts:gaphto-news']  = await seedPosts('news.json',         'gaphto-news')
  summary['posts:health-news']  = await seedPosts('health-news.json',  'health-news')
  summary['posts:blog']         = await seedPosts('blog.json',          'blog')

  // ── 4. Gallery ────────────────────────────────────────────────────────────
  type GalleryImageRecord = {
    url: string
    localPath?: string | null
    caption?: string | null
    sortOrder?: number
  }

  type GalleryAlbumRecord = {
    albumTitle: string
    albumSlug: string
    eventDate?: string | null
    images: GalleryImageRecord[]
  }

  const galleryData = loadJson<GalleryAlbumRecord[]>('gallery.json')
  if (galleryData && Array.isArray(galleryData)) {
    let albumCount = 0
    let imageCount = 0

    for (const album of galleryData) {
      const [inserted] = await db
        .insert(galleryAlbums)
        .values({
          title: album.albumTitle,
          slug: album.albumSlug,
          eventDate: album.eventDate ? new Date(album.eventDate) : null,
        })
        .onConflictDoNothing()
        .returning({ id: galleryAlbums.id })

      if (!inserted) continue
      albumCount++

      const imageRows = (album.images ?? []).map((img, idx) => ({
        albumId: inserted.id,
        url: img.localPath ?? img.url,
        caption: img.caption ?? null,
        sortOrder: img.sortOrder ?? idx,
      }))

      if (imageRows.length > 0) {
        await db.insert(galleryImages).values(imageRows).onConflictDoNothing()
        imageCount += imageRows.length
      }
    }

    summary['gallery_albums'] = albumCount
    summary['gallery_images'] = imageCount
  }

  // ── 5. Events ─────────────────────────────────────────────────────────────
  type EventRecord = {
    title: string
    slug: string
    description?: string | null
    location?: string | null
    isOnline?: boolean
    startDate?: string | null
    endDate?: string | null
    priceGhs?: number | null
    status?: 'upcoming' | 'ongoing' | 'past' | 'cancelled'
    featuredImage?: string | null
  }

  const eventsData = loadJson<EventRecord[]>('events.json')
  if (eventsData && Array.isArray(eventsData)) {
    const rows = eventsData.map((e) => ({
      title: e.title,
      slug: e.slug,
      description: e.description ?? null,
      location: e.location ?? null,
      isOnline: e.isOnline ?? false,
      startDate: e.startDate ? new Date(e.startDate) : null,
      endDate: e.endDate ? new Date(e.endDate) : null,
      priceGhs: e.priceGhs != null ? String(e.priceGhs) : null,
      status: (e.status ?? 'upcoming') as 'upcoming' | 'ongoing' | 'past' | 'cancelled',
      featuredImage: e.featuredImage ?? null,
    }))

    if (rows.length > 0) {
      await db.insert(events).values(rows).onConflictDoNothing()
    }
    summary['events'] = rows.length
  }

  // ── 6. Contact → siteSettings ─────────────────────────────────────────────
  const contactData = loadJson<Record<string, string>>('contact.json')
  if (contactData && typeof contactData === 'object') {
    await db
      .insert(siteSettings)
      .values({ key: 'contact', value: JSON.stringify(contactData) })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: JSON.stringify(contactData), updatedAt: new Date() },
      })
    summary['site_settings:contact'] = 1
  }

  // ── 7. Pages tree → siteSettings ─────────────────────────────────────────
  const pagesData = loadJson<unknown[]>('pages.json')
  if (pagesData && Array.isArray(pagesData)) {
    await db
      .insert(siteSettings)
      .values({ key: 'pages', value: JSON.stringify(pagesData) })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: JSON.stringify(pagesData), updatedAt: new Date() },
      })
    summary['site_settings:pages'] = pagesData.length
  }

  // ── About → siteSettings ──────────────────────────────────────────────────
  const aboutData = loadJson<Record<string, unknown>>('about.json')
  if (aboutData && typeof aboutData === 'object') {
    await db
      .insert(siteSettings)
      .values({ key: 'about', value: JSON.stringify(aboutData) })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: JSON.stringify(aboutData), updatedAt: new Date() },
      })
    summary['site_settings:about'] = 1
  }

  // ── 8. Practice Areas → siteSettings ─────────────────────────────────────
  const practiceAreasData = loadJson<unknown[]>('practice-areas.json')
  if (practiceAreasData && Array.isArray(practiceAreasData)) {
    await db
      .insert(siteSettings)
      .values({ key: 'practice-areas', value: JSON.stringify(practiceAreasData) })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: JSON.stringify(practiceAreasData), updatedAt: new Date() },
      })
    summary['site_settings:practice-areas'] = practiceAreasData.length
  }

  // ── 9. Fund → siteSettings ────────────────────────────────────────────────
  const fundData = loadJson<Record<string, unknown>>('fund.json')
  if (fundData && typeof fundData === 'object') {
    await db
      .insert(siteSettings)
      .values({ key: 'fund', value: JSON.stringify(fundData) })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: JSON.stringify(fundData), updatedAt: new Date() },
      })
    summary['site_settings:fund'] = 1
  }

  // ── 10. Publications ──────────────────────────────────────────────────────
  type PublicationRecord = {
    slug: string
    title: string
    description?: string | null
    fileUrl?: string | null
    type?: string | null
    year?: string | null
    isPublic?: boolean
  }

  const publicationsData = loadJson<PublicationRecord[]>('publications.json')
  if (publicationsData && Array.isArray(publicationsData)) {
    const rows = publicationsData.map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description ?? null,
      fileUrl: p.fileUrl ?? null,
      fileType: p.type ?? null,
      isMemberOnly: p.isPublic === true ? false : true,
      publishedAt: p.year ? new Date(parseInt(p.year), 0, 1) : null,
    }))
    if (rows.length > 0) {
      await db.insert(publications).values(rows).onConflictDoNothing()
    }
    summary['publications'] = rows.length
  }

  // ── 11. Summary ───────────────────────────────────────────────────────────
  console.log('\n========== SEED SUMMARY ==========')
  for (const [key, count] of Object.entries(summary)) {
    console.log(`  ${key.padEnd(28)} ${count}`)
  }
  console.log('===================================\n')

  await pool.end()
}

main().catch((err) => {
  console.error('[seed] Fatal error:', err)
  process.exit(1)
})
