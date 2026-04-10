import { Metadata } from 'next'
import { db } from '@/lib/db'
import { events } from '@/lib/db'
import { asc, desc, gte, lt } from 'drizzle-orm'
import { getBlocksForPage } from '@/lib/data'
import { getHeroContent } from '@/lib/blocks'
import { InnerPageHero } from '@/components/shared/inner-page-hero'
import { EventsListClient } from './events-list-client'

export const metadata: Metadata = {
  title: 'Events & CPD',
  description: 'Upcoming and past CPD events from GAPHTO.',
}

export default async function EventsPage() {
  const now = new Date()

  const [upcomingEvents, pastEvents, blocks] = await Promise.all([
    db.select().from(events).where(gte(events.startDate, now)).orderBy(asc(events.startDate)),
    db.select().from(events).where(lt(events.startDate, now)).orderBy(desc(events.startDate)),
    getBlocksForPage('events'),
  ])

  const hero = getHeroContent(blocks, {
    title: 'Events & CPD',
    label: 'Professional Development',
    subtitle: 'Continuing Professional Development events, conferences, and training opportunities from GAPHTO.',
  })

  return (
    <>
      <InnerPageHero
        title={hero.title}
        label={hero.label}
        subtitle={hero.subtitle}
        heroImage={hero.heroImage}
        centered={hero.centered !== false}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Events' }]}
      />
      <EventsListClient upcoming={upcomingEvents} past={pastEvents} />
    </>
  )
}
