import { db } from '@/lib/db'
import { fundApplications, users } from '../../../../../drizzle/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@/auth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FundApplicationActions } from '@/components/dashboard/fund-application-actions'

export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  reviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  approved:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected:  'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

function truncate(text: string, max = 60) {
  return text.length > max ? text.slice(0, max) + '…' : text
}

function formatGHS(amount: string | number) {
  return new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount))
}

export default async function FundApplicationsPage() {
  const session = await auth()
  const canManage = ['super_admin', 'admin'].includes(session!.user.role)

  const rows = await db
    .select({
      id: fundApplications.id,
      applicantName: fundApplications.applicantName,
      email: fundApplications.email,
      phone: fundApplications.phone,
      region: fundApplications.region,
      facility: fundApplications.facility,
      loanAmount: fundApplications.loanAmount,
      loanPurpose: fundApplications.loanPurpose,
      repaymentPeriodMonths: fundApplications.repaymentPeriodMonths,
      status: fundApplications.status,
      reviewNotes: fundApplications.reviewNotes,
      submittedAt: fundApplications.submittedAt,
      reviewedAt: fundApplications.reviewedAt,
      reviewerName: users.name,
    })
    .from(fundApplications)
    .leftJoin(users, eq(fundApplications.reviewedBy, users.id))
    .orderBy(desc(fundApplications.submittedAt))

  const counts = {
    total:     rows.length,
    pending:   rows.filter((r) => r.status === 'pending').length,
    reviewing: rows.filter((r) => r.status === 'reviewing').length,
    approved:  rows.filter((r) => r.status === 'approved').length,
    rejected:  rows.filter((r) => r.status === 'rejected').length,
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Fund Applications</h1>
          <p className="text-sm text-muted-foreground">GAPHTO Member Loan Requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total',     value: counts.total,     color: 'bg-muted text-foreground' },
          { label: 'Pending',   value: counts.pending,   color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
          { label: 'Reviewing', value: counts.reviewing, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
          { label: 'Approved',  value: counts.approved,  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
          { label: 'Rejected',  value: counts.rejected,  color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl px-4 py-3 text-center ${stat.color}`}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Applicant</TableHead>
              <TableHead>Amount (GHS)</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              {canManage && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground/70 py-12">
                  No fund applications yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{row.applicantName}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                      <p className="text-xs text-muted-foreground/70">{row.region} — {row.facility}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {formatGHS(row.loanAmount)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">
                    {truncate(row.loanPurpose)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {row.repaymentPeriodMonths} months
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[row.status] ?? 'bg-muted text-muted-foreground'}`}
                    >
                      {row.status}
                    </span>
                    {row.reviewNotes && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5 max-w-[160px] truncate" title={row.reviewNotes}>
                        {row.reviewNotes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground/70 whitespace-nowrap">
                    {row.submittedAt
                      ? new Date(row.submittedAt).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <FundApplicationActions
                        applicationId={row.id}
                        currentStatus={row.status}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
