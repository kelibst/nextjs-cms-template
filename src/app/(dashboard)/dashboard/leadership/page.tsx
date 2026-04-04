import { db } from '@/lib/db'
import { leadership } from '../../../../../drizzle/schema'
import { asc } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Pencil } from 'lucide-react'
import { LeadershipDeleteButton } from '@/components/dashboard/leadership-delete-button'

export const dynamic = 'force-dynamic'

export default async function LeadershipPage() {
  const leaders = await db.select().from(leadership).orderBy(asc(leadership.sortOrder))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Leadership</h1>
          <p className="text-sm text-muted-foreground">{leaders.length} members</p>
        </div>
        <Link href="/dashboard/leadership/new">
          <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground gap-1.5">
            <Plus className="w-4 h-4" /> Add Member
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground/70 py-12">No leadership members yet.</TableCell>
              </TableRow>
            ) : (
              leaders.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-muted-foreground/70 text-sm">{l.sortOrder}</TableCell>
                  <TableCell>
                    {l.imageUrl ? (
                      <img src={l.imageUrl} alt={l.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground/70">
                        {l.name[0]}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{l.role}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${l.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground/70'}`}>
                      {l.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/leadership/${l.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <LeadershipDeleteButton id={l.id} />
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
