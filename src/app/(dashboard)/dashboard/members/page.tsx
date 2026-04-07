import { db } from '@/lib/db'
import { members, users } from '../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import Link from 'next/link'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { MemberStatusToggle } from '@/components/dashboard/member-status-toggle'
import { MembersPageClient } from '@/components/dashboard/members-page-client'

export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-muted text-muted-foreground',
  suspended: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

export default async function MembersPage() {
  const session = await auth()
  const canManage = ['super_admin', 'admin'].includes(session!.user.role)

  const rows = await db
    .select({
      id: members.id,
      memberNumber: members.memberNumber,
      specialty: members.specialty,
      region: members.region,
      facility: members.facility,
      latitude: members.latitude,
      longitude: members.longitude,
      joinedDate: members.joinedDate,
      membershipStatus: members.membershipStatus,
      name: users.name,
      email: users.email,
    })
    .from(members)
    .leftJoin(users, eq(members.userId, users.id))
    .orderBy(members.memberNumber)

  // Map members data for the map component
  const mapMembers = rows.map((m) => ({
    id: m.id,
    name: m.name ?? null,
    region: m.region ?? null,
    specialty: m.specialty ?? null,
    membershipStatus: m.membershipStatus,
    latitude: m.latitude ?? null,
    longitude: m.longitude ?? null,
  }))

  const tableContent = (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Member #</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            {canManage && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground/70 py-12">
                No members yet.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-mono text-sm">{m.memberNumber}</TableCell>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/members/${m.id}`} className="hover:text-primary hover:underline">
                    {m.name ?? '—'}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{m.email ?? '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.specialty ?? '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.region ?? '—'}</TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[m.membershipStatus]}`}>
                    {m.membershipStatus}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground/70">
                  {m.joinedDate ? new Date(m.joinedDate).toLocaleDateString() : '—'}
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <MemberStatusToggle memberId={m.id} currentStatus={m.membershipStatus} />
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <MembersPageClient
      tableContent={tableContent}
      members={mapMembers}
      totalCount={rows.length}
    />
  )
}
