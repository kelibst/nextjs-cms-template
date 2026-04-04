import { db } from '@/lib/db'
import { publications } from '../../../../../drizzle/schema'
import { desc } from 'drizzle-orm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Lock } from 'lucide-react'
import { PublicationDeleteButton } from '@/components/dashboard/publication-delete-button'

export const dynamic = 'force-dynamic'

const fileTypeBadge: Record<string, string> = {
  pdf: 'bg-red-50 text-red-600',
  doc: 'bg-blue-50 text-blue-600',
  docx: 'bg-blue-50 text-blue-600',
  xlsx: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
}

export default async function PublicationsPage() {
  const pubs = await db.select().from(publications).orderBy(desc(publications.createdAt))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Publications</h1>
          <p className="text-sm text-muted-foreground">{pubs.length} total</p>
        </div>
        <Link href="/dashboard/publications/new">
          <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground gap-1.5">
            <Plus className="w-4 h-4" /> New Publication
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Access</TableHead>
              <TableHead>File</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground/70 py-12">No publications yet.</TableCell>
              </TableRow>
            ) : (
              pubs.map((pub) => (
                <TableRow key={pub.id}>
                  <TableCell className="font-medium max-w-xs truncate">{pub.title}</TableCell>
                  <TableCell>
                    {pub.fileType && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${fileTypeBadge[pub.fileType] ?? 'bg-muted text-muted-foreground'}`}>
                        {pub.fileType}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {pub.publishedAt ? new Date(pub.publishedAt).getFullYear() : '—'}
                  </TableCell>
                  <TableCell>
                    {pub.isMemberOnly ? (
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <Lock className="w-3 h-3" /> Members only
                      </span>
                    ) : (
                      <span className="text-xs text-primary">Public</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {pub.fileUrl && (
                      <a href={pub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                        View file
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/publications/${pub.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <PublicationDeleteButton id={pub.id} />
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
