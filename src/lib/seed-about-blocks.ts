import { config } from 'dotenv'
config({ path: '.env.local' })
config({ path: '.env' })

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { pageBlocks } from '../../drizzle/schema'
import { eq, count } from 'drizzle-orm'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const db = drizzle(pool)

const FEATURES_DEFAULTS = [
  { title: 'Research & Development', description: 'Driving innovation through rigorous research and evidence-based practices.' },
  { title: 'Community Outreach', description: 'Connecting with communities to deliver programmes that create lasting impact.' },
  { title: 'Professional Development', description: 'Empowering members with training, workshops, and continuing education.' },
]

const TIMELINE_DEFAULTS = [
  { year: '2010', title: 'Founded', description: 'Organisation established with a core group of founding members.' },
  { year: '2015', title: 'Growth Phase', description: 'Membership expanded nationally with new regional chapters.' },
  { year: '2020', title: 'Digital Transformation', description: 'Launched online member portal and digital services.' },
  { year: 'Present', title: 'Continuing the Mission', description: 'Continuing to grow and serve members across the country.' },
]

async function seed() {
  const [{ n }] = await db.select({ n: count() }).from(pageBlocks).where(eq(pageBlocks.page, 'about'))
  if (n > 0) { console.log('About blocks already seeded — skipping'); process.exit(0) }

  await db.insert(pageBlocks).values([
    {
      page: 'about',
      type: 'hero',
      sortOrder: 0,
      isVisible: true,
      content: JSON.stringify({ title: 'About Our Organisation', label: 'Our Story', subtitle: 'Learn more about who we are, what we do, and where we are headed.', centered: true }),
    },
    {
      page: 'about',
      type: 'rich_text',
      sortOrder: 1,
      isVisible: true,
      content: JSON.stringify({ variant: 'background', heading: 'Background', body: '<p>Replace this with your organisation\'s background story.</p>' }),
    },
    {
      page: 'about',
      type: 'rich_text',
      sortOrder: 2,
      isVisible: true,
      content: JSON.stringify({ variant: 'vision_mission', heading: 'Vision & Mission', vision: 'A world where every community thrives through professional excellence.', mission: 'To unite, represent, and empower our members to deliver outstanding outcomes.', body: '' }),
    },
    {
      page: 'about',
      type: 'objectives_list',
      sortOrder: 3,
      isVisible: true,
      content: JSON.stringify({ heading: 'Aims & Objectives', items: ['Promote professional development among members', 'Advocate for policy that benefits the sector', 'Foster collaboration with partner organisations'] }),
    },
    {
      page: 'about',
      type: 'features_grid',
      sortOrder: 4,
      isVisible: true,
      content: JSON.stringify({ heading: 'Our Focus Areas', items: FEATURES_DEFAULTS }),
    },
    {
      page: 'about',
      type: 'timeline',
      sortOrder: 5,
      isVisible: true,
      content: JSON.stringify({ heading: 'Our History', items: TIMELINE_DEFAULTS }),
    },
  ])

  console.log('Seeded 6 blocks for about page')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
