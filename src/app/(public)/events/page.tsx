import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { events } from '@/lib/db'
import { asc, desc, gte, lt } from 'drizzle-orm'
import { PageHeader } from '@/components/shared/page-header'
import { EventsListClient } from './events-list-client'

export const metadata: Metadata = {
  title: 'Events & CPD',
  description: 'Upcoming and past CPD events from GAPHTO.',
}

export default async function EventsPage() {
  const now = new Date()

  const [upcomingEvents, pastEvents] = await Promise.all([
    db
      .select()
      .from(events)
      .where(gte(events.startDate, now))
      .orderBy(asc(events.startDate)),
    db
      .select()
      .from(events)
      .where(lt(events.startDate, now))
      .orderBy(desc(events.startDate)),
  ])

  return (
    <>
      <PageHeader
        title="Events &amp; CPD"
        subtitle="Continuing Professional Development events, conferences, and training opportunities from GAPHTO."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Events' }]}
      />
      <EventsListClient upcoming={upcomingEvents} past={pastEvents} />
    </>
  )
}
