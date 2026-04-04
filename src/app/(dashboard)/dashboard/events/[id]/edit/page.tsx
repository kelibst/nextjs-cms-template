import { db, events } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { EventForm } from '@/components/dashboard/event-form'

export const dynamic = 'force-dynamic'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1)
  if (!event) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Edit Event</h1>
      <EventForm event={event} />
    </div>
  )
}
