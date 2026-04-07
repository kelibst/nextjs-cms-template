import { db } from '@/lib/db'
import { newsletters } from '@/lib/db'
import { desc } from 'drizzle-orm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Eye, Pencil } from 'lucide-react'
import { NewsletterDeleteButton } from '@/components/dashboard/newsletter-delete-button'
import { NewsletterSendButton } from '@/components/dashboard/newsletter-send-button'

export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-green-100 text-green-700',
}

export default async function NewsletterPage() {
  const rows = await db.select().from(newsletters).orderBy(desc(newsletters.createdAt))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Newsletter</h1>
          <p className="text-sm text-muted-foreground">{rows.length} total</p>
        </div>
        <Link href="/dashboard/newsletter/new">
          <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground gap-1.5">
            <Plus className="w-4 h-4" /> Compose Newsletter
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground/70 py-12">
                  No newsletters yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-medium max-w-xs truncate">{n.subject}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[n.status ?? 'draft']}`}>
                      {n.status ?? 'draft'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {n.status === 'sent' ? (n.recipientCount ?? 0) : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {n.sentAt ? new Date(n.sentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {n.status === 'sent' ? (
                        <Link href={`/dashboard/newsletter/${n.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      ) : (
                        <>
                          <NewsletterSendButton id={n.id} subject={n.subject} />
                          <Link href={`/dashboard/newsletter/${n.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <NewsletterDeleteButton id={n.id} />
                        </>
                      )}
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
