import { config } from 'dotenv'
config({ path: '.env.local' })
config({ path: '.env' })

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { pageBlocks } from '../../drizzle/schema'
import { eq } from 'drizzle-orm'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const db = drizzle(pool)

// ─── Generic feature items for the features_grid block ───────────────────────

const defaultFeatureItems = [
  { title: 'Research & Development', description: 'Driving innovation through rigorous research and evidence-based practices.' },
  { title: 'Community Outreach', description: 'Connecting with communities to deliver programmes that create lasting impact.' },
  { title: 'Professional Development', description: 'Empowering members with training, workshops, and continuing education.' },
]

// ─── Seed Homepage ────────────────────────────────────────────────────────────

async function seedHomepage() {
  const existing = await db.select().from(pageBlocks).where(eq(pageBlocks.page, 'homepage'))
  if (existing.length > 0) {
    console.log('Homepage blocks already seeded, skipping')
    return 0
  }

  const homepageBlocks = [
    {
      page: 'homepage',
      type: 'hero' as const,
      sortOrder: 0,
      content: JSON.stringify({
        title: 'Welcome to My CMS',
        subtitle: 'A modern, full-featured CMS and membership platform for your organisation.',
      }),
    },
    {
      page: 'homepage',
      type: 'stats_bar' as const,
      sortOrder: 1,
      content: JSON.stringify({
        items: [
          { count: '500', suffix: '+', label: 'Members' },
          { count: '10', suffix: '+', label: 'Years Active' },
          { count: '3', suffix: '', label: 'Programmes' },
          { count: '12', suffix: '', label: 'Events Per Year' },
        ],
      }),
    },
    {
      page: 'homepage',
      type: 'news_preview' as const,
      sortOrder: 2,
      content: JSON.stringify({ heading: 'Latest News', count: 3 }),
    },
    {
      page: 'homepage',
      type: 'events_preview' as const,
      sortOrder: 3,
      content: JSON.stringify({ heading: 'Upcoming Events', count: 3 }),
    },
    {
      page: 'homepage',
      type: 'features_grid' as const,
      sortOrder: 4,
      content: JSON.stringify({
        heading: 'What We Do',
        items: defaultFeatureItems,
      }),
    },
    {
      page: 'homepage',
      type: 'leadership_preview' as const,
      sortOrder: 5,
      content: JSON.stringify({ heading: 'Our Leadership', count: 4 }),
    },
    {
      page: 'homepage',
      type: 'gallery_teaser' as const,
      sortOrder: 6,
      content: JSON.stringify({ heading: 'Gallery' }),
    },
    {
      page: 'homepage',
      type: 'about_preview' as const,
      sortOrder: 7,
      content: JSON.stringify({
        heading: 'About Our Organisation',
        imageUrl: '',
        imageAlt: 'Organisation activities',
        linkText: 'Learn More About Us',
        linkHref: '/about',
      }),
    },
    {
      page: 'homepage',
      type: 'cta_section' as const,
      sortOrder: 8,
      content: JSON.stringify({
        heading: 'Join Our Community',
        subtitle: 'Become a member and get access to exclusive resources, events, and professional development opportunities.',
        buttonText: 'Register Now',
        buttonHref: '/register',
      }),
    },
  ]

  await db.insert(pageBlocks).values(homepageBlocks)
  console.log(`Inserted ${homepageBlocks.length} homepage blocks`)
  return homepageBlocks.length
}

// ─── Seed About ───────────────────────────────────────────────────────────────

async function seedAbout() {
  const existing = await db.select().from(pageBlocks).where(eq(pageBlocks.page, 'about'))
  if (existing.length > 0) {
    console.log('About blocks already seeded, skipping')
    return 0
  }

  const aboutBlocks = [
    {
      page: 'about',
      type: 'hero' as const,
      sortOrder: 0,
      content: JSON.stringify({
        title: 'About Our Organisation',
        subtitle: 'Learn more about who we are, what we do, and where we are headed.',
        label: 'Our Story',
      }),
    },
    {
      page: 'about',
      type: 'rich_text' as const,
      sortOrder: 1,
      content: JSON.stringify({
        heading: 'Background',
        body: '<p>Replace this with your organisation\'s background story. Describe your founding, your mandate, and the communities you serve.</p>',
      }),
    },
    {
      page: 'about',
      type: 'rich_text' as const,
      sortOrder: 2,
      content: JSON.stringify({
        heading: 'Vision & Mission',
        variant: 'vision_mission',
        vision: 'A world where every community thrives through access to quality services and professional excellence.',
        mission: 'To unite, represent, and empower our members to deliver outstanding outcomes for the communities we serve.',
        body: '',
      }),
    },
    {
      page: 'about',
      type: 'objectives_list' as const,
      sortOrder: 3,
      content: JSON.stringify({
        heading: 'Aims & Objectives',
        items: [
          'Promote professional development among members',
          'Advocate for policy changes that benefit the sector',
          'Foster collaboration between members and partner organisations',
          'Provide resources and support to members',
        ],
      }),
    },
    {
      page: 'about',
      type: 'features_grid' as const,
      sortOrder: 4,
      content: JSON.stringify({
        heading: 'Our Focus Areas',
        items: defaultFeatureItems,
      }),
    },
    {
      page: 'about',
      type: 'timeline' as const,
      sortOrder: 5,
      content: JSON.stringify({
        heading: 'Our History',
        items: [
          { year: '2010', title: 'Founded', description: 'Organisation established with a core group of founding members.' },
          { year: '2015', title: 'Growth Phase', description: 'Membership expanded nationally with new regional chapters.' },
          { year: '2020', title: 'Digital Transformation', description: 'Launched online member portal and digital services.' },
          { year: 'Present', title: 'Continuing the Mission', description: 'Continuing to grow and serve members across the country.' },
        ],
      }),
    },
  ]

  await db.insert(pageBlocks).values(aboutBlocks)
  console.log(`Inserted ${aboutBlocks.length} about blocks`)
  return aboutBlocks.length
}

// ─── Seed Features Page ───────────────────────────────────────────────────────

async function seedFeaturesPage() {
  const existing = await db.select().from(pageBlocks).where(eq(pageBlocks.page, 'features'))
  if (existing.length > 0) {
    console.log('Features blocks already seeded, skipping')
    return 0
  }

  const featuresBlocks = [
    {
      page: 'features',
      type: 'hero' as const,
      sortOrder: 0,
      content: JSON.stringify({
        title: 'What We Do',
        subtitle: 'Explore the programmes and services our organisation delivers.',
      }),
    },
    {
      page: 'features',
      type: 'features_grid' as const,
      sortOrder: 1,
      content: JSON.stringify({
        heading: 'Our Programmes',
        items: defaultFeatureItems,
      }),
    },
  ]

  await db.insert(pageBlocks).values(featuresBlocks)
  console.log(`Inserted ${featuresBlocks.length} features blocks`)
  return featuresBlocks.length
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function seedBlocks() {
  const homeCount = await seedHomepage()
  const aboutCount = await seedAbout()
  const featuresCount = await seedFeaturesPage()
  console.log(`Block seed complete — homepage: ${homeCount}, about: ${aboutCount}, features: ${featuresCount}`)
}

// Allow running directly: bun src/lib/seed-blocks.ts
if (require.main === module) {
  seedBlocks()
    .then(() => pool.end())
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1) })
}
