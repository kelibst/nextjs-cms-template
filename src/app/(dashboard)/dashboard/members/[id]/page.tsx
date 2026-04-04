import { db } from '@/lib/db'
import { members, users } from '../../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MemberStatusToggle } from '@/components/dashboard/member-status-toggle'

export const dynamic = 'force-dynamic'

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const canManage = ['super_admin', 'admin'].includes(session!.user.role)

  const [row] = await db
    .select({
      member: members,
      user: users,
    })
    .from(members)
    .leftJoin(users, eq(members.userId, users.id))
    .where(eq(members.id, id))
    .limit(1)

  if (!row) notFound()

  const { member, user } = row

  const fields = [
    ['Member Number', member.memberNumber],
    ['Specialty', member.specialty ?? '—'],
    ['Region', member.region ?? '—'],
    ['Facility', member.facility ?? '—'],
    ['Joined Date', member.joinedDate ? new Date(member.joinedDate).toLocaleDateString() : '—'],
    ['Dues Paid Until', member.duesPaidUntil ? new Date(member.duesPaidUntil).toLocaleDateString() : '—'],
  ]

  const userFields = [
    ['Email', user?.email ?? '—'],
    ['Role', user?.role ?? '—'],
    ['Account Created', user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'],
  ]

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/members" className="text-muted-foreground/70 hover:text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">{user?.name ?? 'Member'}</h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Membership</h2>
        {fields.map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
          </div>
        ))}
        {canManage && (
          <div className="flex justify-between text-sm items-center pt-2 border-t">
            <span className="text-muted-foreground">Status</span>
            <MemberStatusToggle memberId={member.id} currentStatus={member.membershipStatus} />
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Account</h2>
        {userFields.map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
