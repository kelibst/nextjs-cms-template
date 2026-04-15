import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

import {
  users,
  leadership,
  posts,
  galleryAlbums,
  events,
  siteSettings,
  publications,
  navigationLinks,
} from './schema'

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  const db = drizzle(pool)

  const summary: Record<string, number> = {}

  const BCRYPT_ROUNDS = 12
  const PASSWORD = 'Demo1234!'
  const passwordHash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS)

  // ── 1. Users ──────────────────────────────────────────────────────────────
  const seedUsers = [
    { email: 'superadmin@example.com', name: 'Super Admin', role: 'super_admin' as const },
    { email: 'admin@example.com',      name: 'Admin User',  role: 'admin'       as const },
    { email: 'editor@example.com',     name: 'Editor User', role: 'editor'      as const },
    { email: 'member@example.com',     name: 'Member User', role: 'member'      as const },
  ]

  let userCount = 0
  for (const u of seedUsers) {
    await db
      .insert(users)
      .values({ email: u.email, name: u.name, role: u.role, passwordHash })
      .onConflictDoNothing()
    userCount++
  }
  summary['users'] = userCount

  // ── 2. Leadership ─────────────────────────────────────────────────────────
  const leadershipRows = [
    { name: 'Jane Smith', role: 'President',         sortOrder: 0, isActive: true },
    { name: 'John Doe',   role: 'Secretary General', sortOrder: 1, isActive: true },
  ]
  await db.insert(leadership).values(leadershipRows).onConflictDoNothing()
  summary['leadership'] = leadershipRows.length

  // ── 3. Posts ──────────────────────────────────────────────────────────────
  const now = new Date()
  const postRows = [
    {
      slug: 'welcome-to-our-cms',
      title: 'Welcome to Our CMS',
      content: '<p>Welcome to the CMS platform. This is a demo news post.</p>',
      excerpt: 'Welcome to the CMS platform.',
      category: 'news' as const,
      status: 'published' as const,
      publishedAt: now,
    },
    {
      slug: 'getting-started-with-the-platform',
      title: 'Getting Started with the Platform',
      content: '<p>Here is how to get started with this platform. This is a demo blog post.</p>',
      excerpt: 'Here is how to get started with this platform.',
      category: 'blog' as const,
      status: 'published' as const,
      publishedAt: now,
    },
    {
      slug: 'platform-launch-announcement',
      title: 'Platform Launch Announcement',
      content: '<p>We are excited to announce the launch of the platform. This is a demo announcement.</p>',
      excerpt: 'We are excited to announce the launch of the platform.',
      category: 'announcement' as const,
      status: 'published' as const,
      publishedAt: now,
    },
  ]
  await db.insert(posts).values(postRows).onConflictDoNothing()
  summary['posts'] = postRows.length

  // ── 4. Events ─────────────────────────────────────────────────────────────
  const eventRows = [
    {
      title: 'Annual General Meeting',
      slug: 'annual-general-meeting',
      description: 'The annual general meeting for all members.',
      status: 'upcoming' as const,
      price: '0',
      isOnline: false,
    },
  ]
  await db.insert(events).values(eventRows).onConflictDoNothing()
  summary['events'] = eventRows.length

  // ── 5. Gallery Album ──────────────────────────────────────────────────────
  await db
    .insert(galleryAlbums)
    .values({ title: 'Photo Gallery', slug: 'photo-gallery', description: 'Our photo gallery' })
    .onConflictDoNothing()
  summary['gallery_albums'] = 1

  // ── 6. Publications ───────────────────────────────────────────────────────
  const publicationRows = [
    {
      title: 'Member Handbook',
      slug: 'member-handbook',
      isMemberOnly: false,
      publishedAt: now,
    },
    {
      title: 'Internal Policy Document',
      slug: 'internal-policy-document',
      isMemberOnly: true,
      publishedAt: now,
    },
  ]
  await db.insert(publications).values(publicationRows).onConflictDoNothing()
  summary['publications'] = publicationRows.length

  // ── 7. Site Settings ──────────────────────────────────────────────────────
  const settingsRows = [
    { key: 'site_name',      value: 'My CMS' },
    { key: 'contact_email',  value: 'contact@example.com' },
    { key: 'about_text',     value: 'A modern CMS platform.' },
  ]
  for (const s of settingsRows) {
    await db
      .insert(siteSettings)
      .values(s)
      .onConflictDoUpdate({ target: siteSettings.key, set: { value: s.value, updatedAt: new Date() } })
  }
  summary['site_settings'] = settingsRows.length

  // ── 8. Navigation Links ───────────────────────────────────────────────────
  const navRows = [
    { label: 'Home',  href: '/',      sortOrder: 0, isVisible: true },
    { label: 'About', href: '/about', sortOrder: 1, isVisible: true },
  ]
  await db.insert(navigationLinks).values(navRows).onConflictDoNothing()
  summary['navigation_links'] = navRows.length

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n========== SEED SUMMARY ==========')
  for (const [key, count] of Object.entries(summary)) {
    console.log(`  ${key.padEnd(28)} ${count}`)
  }
  console.log('===================================\n')
  console.log('Note: Run `bun src/lib/seed-blocks.ts` separately to seed page builder blocks.')

  await pool.end()
}

main().catch((err) => {
  console.error('[seed] Fatal error:', err)
  process.exit(1)
})
