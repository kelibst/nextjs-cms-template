import { config } from 'dotenv'
config({ path: '.env.local' })
config({ path: '.env' })

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { pageBlocks } from '../../drizzle/schema'
import { eq, count } from 'drizzle-orm'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const db = drizzle(pool)

import aboutData from '../data/about.json'

const PRACTICE_AREAS_DEFAULTS = [
  { title: 'Disease Control & Prevention', description: 'Protecting communities through surveillance, response, and health promotion.' },
  { title: 'Health Information Management', description: 'Providing reliable, timely health data to support decision-making.' },
  { title: 'Nutrition', description: 'Advancing nutritional science and health outcomes across communities.' },
]

const TIMELINE_DEFAULTS = [
  { year: '1984', title: 'Association Founded', description: 'Association founded for Disease Control Officers and Field Technicians.' },
  { year: '2006', title: 'Official Inauguration', description: 'Officially inaugurated at Korle-Bu, Accra as PUHTOG.' },
  { year: '2009', title: 'Renamed GAPHTO', description: 'Re-named Ghana Association of Public Health Technical Officers (GAPHTO) at Cape Coast Conference.' },
  { year: 'Present', title: 'Continuing the Mission', description: 'Continues to advocate for public health professionals across Ghana.' },
]

async function seed() {
  const about = aboutData

  const [{ n }] = await db.select({ n: count() }).from(pageBlocks).where(eq(pageBlocks.page, 'about'))
  if (n > 0) { console.log('About blocks already seeded — skipping'); process.exit(0) }

  await db.insert(pageBlocks).values([
    {
      page: 'about',
      type: 'hero',
      sortOrder: 0,
      isVisible: true,
      content: JSON.stringify({ title: 'About GAPHTO', label: 'Our Story', subtitle: 'Ghana Association of Public Health Technical Officers', centered: true }),
    },
    {
      page: 'about',
      type: 'rich_text',
      sortOrder: 1,
      isVisible: true,
      content: JSON.stringify({ variant: 'background', body: about.background, heading: 'Background' }),
    },
    {
      page: 'about',
      type: 'rich_text',
      sortOrder: 2,
      isVisible: true,
      content: JSON.stringify({ variant: 'vision_mission', vision: about.vision, mission: about.mission, body: '', heading: 'Vision & Mission' }),
    },
    {
      page: 'about',
      type: 'objectives_list',
      sortOrder: 3,
      isVisible: true,
      content: JSON.stringify({ heading: 'Aims & Objectives', items: about.objectives }),
    },
    {
      page: 'about',
      type: 'practice_areas_grid',
      sortOrder: 4,
      isVisible: true,
      content: JSON.stringify({ heading: 'Areas of Practice', items: PRACTICE_AREAS_DEFAULTS }),
    },
    {
      page: 'about',
      type: 'timeline',
      sortOrder: 5,
      isVisible: true,
      content: JSON.stringify({ heading: 'Our History', items: TIMELINE_DEFAULTS }),
    },
  ])

  console.log('✓ Seeded 6 blocks for about page')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
