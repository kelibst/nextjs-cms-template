import { config } from 'dotenv'
config({ path: '.env.local' })

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { navigationLinks } from '../../drizzle/schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const db = drizzle(pool)

const defaultLinks = [
  { label: 'Home', href: '/', sortOrder: 0 },
  { label: 'About', href: '/about', sortOrder: 1 },
  { label: 'News', href: '/news', sortOrder: 2 },
  { label: 'Blog', href: '/blog', sortOrder: 3 },
  { label: 'Leadership', href: '/leadership', sortOrder: 4 },
  { label: 'Gallery', href: '/gallery', sortOrder: 5 },
  { label: 'Events', href: '/events', sortOrder: 6 },
  { label: 'Contact', href: '/contact', sortOrder: 7 },
]

async function seed() {
  const existing = await db.select().from(navigationLinks)
  if (existing.length > 0) {
    console.log('Navigation links already seeded')
    process.exit(0)
  }
  await db.insert(navigationLinks).values(defaultLinks)
  console.log('Seeded 8 navigation links')
  process.exit(0)
}
seed().catch(console.error)
