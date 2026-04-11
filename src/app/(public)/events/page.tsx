import { Metadata } from 'next'
import { db } from '@/lib/db'
import { events } from '@/lib/db'
import { asc, desc, gte, lt } from 'drizzle-orm'
import { getBlocksForPage } from '@/lib/data'
import { getHeroContent } from '@/lib/blocks'
import { InnerPageHero } from '@/components/shared/inner-page-hero'
import { BlockRenderer, type BlockDataSources } from '@/components/shared/block-renderer'
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

  const contentBlocks = blocks.filter(b => b.type !== 'hero')
  const dataSources: BlockDataSources = { events: [...upcomingEvents, ...pastEvents] }

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

      {contentBlocks.length > 0 && (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
          {contentBlocks.map(block => (
            <BlockRenderer key={block.id} block={block} dataSources={dataSources} pageContext="subpage" />
          ))}
        </div>
      )}

      <EventsListClient upcoming={upcomingEvents} past={pastEvents} />
    </>
  )
}
