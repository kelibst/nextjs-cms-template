import { db } from '@/lib/db'
import { events, eventRegistrations } from '../../../../../drizzle/schema'
import { eq, count } from 'drizzle-orm'
import { desc } from 'drizzle-orm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Users } from 'lucide-react'
import { EventDeleteButton } from '@/components/dashboard/event-delete-button'

export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ongoing: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  past: 'bg-muted text-muted-foreground',
  cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

export default async function EventsPage() {
  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      status: events.status,
      startDate: events.startDate,
      price: events.price,
      isOnline: events.isOnline,
      location: events.location,
    })
    .from(events)
    .orderBy(desc(events.startDate))

  const regCounts = await db
    .select({ eventId: eventRegistrations.eventId, count: count() })
    .from(eventRegistrations)
    .groupBy(eventRegistrations.eventId)

  const countMap = Object.fromEntries(regCounts.map((r) => [r.eventId, r.count]))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground">{rows.length} total</p>
        </div>
        <Link href="/dashboard/events/new">
          <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground gap-1.5">
            <Plus className="w-4 h-4" /> New Event
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Registrations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground/70 py-12">No events yet.</TableCell>
              </TableRow>
            ) : (
              rows.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.title}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[e.status]}`}>
                      {e.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {e.startDate ? new Date(e.startDate).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {e.price && Number(e.price) > 0 ? `$${e.price}` : 'Free'}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${e.isOnline ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                      {e.isOnline ? 'Online' : 'Physical'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/events/${e.id}/registrations`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                      <Users className="w-3.5 h-3.5" />
                      {countMap[e.id] ?? 0}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/events/${e.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <EventDeleteButton id={e.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
