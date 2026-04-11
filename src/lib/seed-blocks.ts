import { config } from 'dotenv'
config({ path: '.env.local' })
config({ path: '.env' })

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { pageBlocks } from '../../drizzle/schema'
import { eq } from 'drizzle-orm'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const db = drizzle(pool)

// ─── Data from JSON files ─────────────────────────────────────────────────────

import aboutData from '../data/about.json'
import practiceAreasData from '../data/practice-areas.json'
import fundData from '../data/fund.json'

// ─── Seed helpers ─────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

// Practice areas mapped to {title, description} for blocks
const practiceAreaItems = (practiceAreasData as { slug: string; title: string; content: string; roles: string[] }[]).map((a) => ({
  title: a.title.replace(/&#038;/g, '&'),
  description: stripHtml(a.content).slice(0, 160),
}))

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
        title: 'We are the backbone of Public Health in Ghana',
        subtitle: aboutData.mission,
      }),
    },
    {
      page: 'homepage',
      type: 'stats_bar' as const,
      sortOrder: 1,
      content: JSON.stringify({
        items: [
          { count: '500', suffix: '+', label: 'Members' },
          { count: '42', suffix: '+', label: 'Years Active' },
          { count: '3', suffix: '', label: 'Practice Areas' },
          { count: '16', suffix: '', label: 'Regions' },
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
      content: JSON.stringify({ heading: 'Events & Programs', count: 3 }),
    },
    {
      page: 'homepage',
      type: 'practice_areas_grid' as const,
      sortOrder: 4,
      content: JSON.stringify({
        heading: 'Our Practice Areas',
        items: practiceAreaItems,
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
        heading: 'Building a Healthier Ghana Together',
        imageUrl: '',
        imageAlt: 'GAPHTO events and activities',
        linkText: 'Learn More About Us',
        linkHref: '/about',
      }),
    },
    {
      page: 'homepage',
      type: 'fund_cta' as const,
      sortOrder: 8,
      content: JSON.stringify({
        heading: 'GAPHTO Welfare Fund',
        subtitle: 'Supporting our members through financial assistance, welfare loans, and mutual aid. The GAPHTO Welfare Fund exists to strengthen the well-being of every member.',
        buttonText: 'Apply Now',
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
      type: 'rich_text' as const,
      sortOrder: 0,
      content: JSON.stringify({
        heading: 'Background',
        body: aboutData.background,
      }),
    },
    {
      page: 'about',
      type: 'rich_text' as const,
      sortOrder: 1,
      content: JSON.stringify({
        heading: 'Vision & Mission',
        body: `<p><strong>Vision:</strong> ${aboutData.vision}</p><p><strong>Mission:</strong> ${aboutData.mission}</p>`,
      }),
    },
    {
      page: 'about',
      type: 'objectives_list' as const,
      sortOrder: 2,
      content: JSON.stringify({
        heading: 'Aims & Objectives',
        items: aboutData.objectives,
      }),
    },
    {
      page: 'about',
      type: 'practice_areas_grid' as const,
      sortOrder: 3,
      content: JSON.stringify({
        heading: 'Areas of Practice',
        items: practiceAreaItems,
      }),
    },
    {
      page: 'about',
      type: 'timeline' as const,
      sortOrder: 4,
      content: JSON.stringify({
        heading: 'Our History',
        items: [
          { year: '1984', title: 'Founding', description: 'Association founded for Disease Control Officers and Field Technicians.' },
          { year: '2006', title: 'Official Inauguration', description: 'Officially inaugurated at Korle-Bu, Accra as PUHTOG.' },
          { year: '2009', title: 'Renamed GAPHTO', description: 'Re-named Ghana Association of Public Health Technical Officers (GAPHTO) at Cape Coast Conference.' },
          { year: 'Present', title: 'Continuing the Mission', description: 'Continues to advocate for public health professionals across Ghana.' },
        ],
      }),
    },
  ]

  await db.insert(pageBlocks).values(aboutBlocks)
  console.log(`Inserted ${aboutBlocks.length} about blocks`)
  return aboutBlocks.length
}

// ─── Seed Fund ────────────────────────────────────────────────────────────────

async function seedFund() {
  const existing = await db.select().from(pageBlocks).where(eq(pageBlocks.page, 'fund'))
  if (existing.length > 0) {
    console.log('Fund blocks already seeded, skipping')
    return 0
  }

  const fundBlocks = [
    {
      page: 'fund',
      type: 'hero' as const,
      sortOrder: 0,
      content: JSON.stringify({
        title: 'GAPHTO Welfare Fund',
        subtitle: 'Supporting our members in times of need',
      }),
    },
    {
      page: 'fund',
      type: 'rich_text' as const,
      sortOrder: 1,
      content: JSON.stringify({
        heading: 'About the Fund',
        body: fundData.description ?? '',
      }),
    },
    {
      page: 'fund',
      type: 'fund_cta' as const,
      sortOrder: 2,
      content: JSON.stringify({
        heading: 'Apply for Support',
        subtitle: 'Applications are reviewed by the welfare committee.',
        buttonText: 'Apply Now',
      }),
    },
  ]

  await db.insert(pageBlocks).values(fundBlocks)
  console.log(`Inserted ${fundBlocks.length} fund blocks`)
  return fundBlocks.length
}

// ─── Seed Practice Areas ──────────────────────────────────────────────────────

async function seedPracticeAreas() {
  const existing = await db.select().from(pageBlocks).where(eq(pageBlocks.page, 'practice-areas'))
  if (existing.length > 0) {
    console.log('Practice-areas blocks already seeded, skipping')
    return 0
  }

  const paBlocks = [
    {
      page: 'practice-areas',
      type: 'hero' as const,
      sortOrder: 0,
      content: JSON.stringify({
        title: 'Our Practice Areas',
        subtitle: 'GAPHTO unites three specialist areas of public health.',
      }),
    },
    {
      page: 'practice-areas',
      type: 'practice_areas_grid' as const,
      sortOrder: 1,
      content: JSON.stringify({
        heading: 'Areas of Practice',
        items: practiceAreaItems,
      }),
    },
  ]

  await db.insert(pageBlocks).values(paBlocks)
  console.log(`Inserted ${paBlocks.length} practice-areas blocks`)
  return paBlocks.length
}

// ─── Main ─────────────────────────────────────────────────────────────────────

;(async () => {
  const homeCount = await seedHomepage()
  const aboutCount = await seedAbout()
  const fundCount = await seedFund()
  const paCount = await seedPracticeAreas()
  console.log(`Seed complete — homepage: ${homeCount}, about: ${aboutCount}, fund: ${fundCount}, practice-areas: ${paCount}`)
  await pool.end()
  process.exit(0)
})()
