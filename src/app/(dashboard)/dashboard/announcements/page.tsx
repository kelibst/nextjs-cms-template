import { db } from '@/lib/db'
import { announcements } from '../../../../../drizzle/schema'
import { desc } from 'drizzle-orm'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { AnnouncementActions } from '@/components/dashboard/announcement-actions'
import { NewAnnouncementSheet } from '@/components/dashboard/new-announcement-sheet'
import { Pin } from 'lucide-react'

export const dynamic = 'force-dynamic'

const visibleColors: Record<string, string> = {
  public: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  members: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  executives: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

export default async function AnnouncementsPage() {
  const all = await db.select().from(announcements).orderBy(desc(announcements.createdAt))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Announcements</h1>
          <p className="text-sm text-muted-foreground">{all.length} total</p>
        </div>
        <NewAnnouncementSheet />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Title</TableHead>
              <TableHead>Visible To</TableHead>
              <TableHead>Pinned</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {all.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground/70 py-12">
                  No announcements yet.
                </TableCell>
              </TableRow>
            ) : (
              all.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${visibleColors[a.visibleTo] ?? 'bg-muted text-muted-foreground'}`}>
                      {a.visibleTo}
                    </span>
                  </TableCell>
                  <TableCell>
                    {a.isPinned && <Pin className="w-4 h-4 text-orange-500" />}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground/70">
                    {a.expiresAt ? new Date(a.expiresAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <AnnouncementActions id={a.id} />
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
