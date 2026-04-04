# PM2 Phase 5C — Agent 2: GAPHTO Fund Loan Application

## Read First
Read `plans/AGENT_CONTEXT.md` for full project context (Phase 5 section).

## Your Goal
Build a complete loan application flow: public fund info page with loan calculator, gated application form, and a dashboard review page for admins.

## Step 0 — Schema Migration
Add the `fundApplications` table to the Drizzle schema and run a migration.

Read `drizzle/schema.ts` to understand the existing table definitions (use the same pattern).
Read `drizzle/drizzle.config.ts` and check `package.json` scripts for the migration command.

Add to `drizzle/schema.ts`:
```typescript
export const fundApplications = pgTable('fund_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  applicantName: text('applicant_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  region: text('region').notNull(),
  facility: text('facility').notNull(),
  loanAmount: numeric('loan_amount', { precision: 10, scale: 2 }).notNull(),
  loanPurpose: text('loan_purpose').notNull(),
  repaymentPeriodMonths: integer('repayment_period_months').notNull(),
  status: text('status').notNull().default('pending'),  // pending | reviewing | approved | rejected
  reviewNotes: text('review_notes'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
})
```

Then generate and run migration:
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx drizzle-kit generate
bun run drizzle/migrate.ts
# OR check package.json for db:migrate script
```

## Files To Create

### 1. `src/app/fund/page.tsx`
Public fund information page. Check if a fund/gaphto-fund page already exists — if so, read it first and enhance rather than replace.

Content sections:
- Hero: "GAPHTO Member Fund" heading, subtitle "Financial support for our members"
- What is the GAPHTO Fund: brief description
- Loan Details card: amount range (GHS 500 – 10,000), interest rate (10% per annum), repayment (6–24 months)
- Eligibility: must be active GAPHTO member
- Interactive Loan Calculator component `<LoanCalculator />`
- CTA: "Apply Now" button → `/fund/apply` (green, prominent)
- Note: Login required to apply

```typescript
export const metadata = {
  title: 'GAPHTO Member Fund',
  description: 'Financial support for active GAPHTO members. Apply for a loan today.',
}
```

### 2. `src/components/fund/loan-calculator.tsx`
`'use client'` interactive calculator.

```typescript
// Inputs (controlled):
//   Loan Amount: slider or number input (500 – 10,000 GHS, step 100)
//   Repayment Period: select (6, 12, 18, 24 months)
//
// Formula (simple interest):
//   monthly rate = 10% / 12 = 0.8333%
//   total interest = loanAmount × 10% × (months / 12)
//   total repayment = loanAmount + total interest
//   monthly payment = total repayment / months
//
// Display:
//   Monthly Payment: GHS X,XXX.XX (large, green)
//   Total Repayment: GHS X,XXX.XX
//   Total Interest: GHS X,XXX.XX
//
// Update in real-time as inputs change (no submit button)
```

### 3. `src/app/fund/apply/page.tsx`
Protected application form page. If not logged in, redirect to `/login?callbackUrl=/fund/apply`.

```typescript
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function FundApplyPage() {
  const session = await auth()
  if (!session) redirect('/login?callbackUrl=/fund/apply')
  // pass session.user to client form
}
```

Form fields:
- Applicant Name (pre-filled from session.user.name, editable)
- Email (pre-filled from session.user.email, editable)
- Phone (required)
- Region (select — all 16 Ghana regions)
- Facility/Organisation (required)
- Loan Amount: number input (min 500, max 10000)
- Loan Purpose: textarea (required, min 50 chars)
- Repayment Period: select (6, 12, 18, 24 months)
- Inline loan calculator showing monthly payment as user types
- Submit: "Submit Application" button

Create `src/components/fund/fund-application-form.tsx` as a `'use client'` component using `useMutation`:
```typescript
const mutation = useMutation({
  mutationFn: (data: ApplicationInput) => submitLoanApplication(data),
  onSuccess: () => {
    toast.success('Application submitted! We will review it within 5 business days.')
    router.push('/member-centre')
  },
  onError: (err) => toast.error(err instanceof Error ? err.message : 'Submission failed'),
})
```

### 4. `src/app/actions/fund.ts`
Server actions file.

```typescript
'use server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fundApplications } from '@/lib/db'  // or import from schema
import { eq } from 'drizzle-orm'
import { can } from '@/lib/permissions'
import type { Role } from '@/lib/permissions'

export async function submitLoanApplication(data: {
  applicantName: string
  email: string
  phone: string
  region: string
  facility: string
  loanAmount: number
  loanPurpose: string
  repaymentPeriodMonths: number
}) {
  const session = await auth()
  if (!session) throw new Error('You must be logged in to apply')

  // Validate amount range
  if (data.loanAmount < 500 || data.loanAmount > 10000) {
    throw new Error('Loan amount must be between GHS 500 and GHS 10,000')
  }

  const [application] = await db.insert(fundApplications).values({
    userId: session.user.id,
    ...data,
    loanAmount: String(data.loanAmount),
    status: 'pending',
  }).returning()

  return { success: true, id: application.id }
}

export async function reviewApplication(id: string, status: 'reviewing' | 'approved' | 'rejected', notes?: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'members:manage')) throw new Error('Forbidden')

  await db.update(fundApplications).set({
    status,
    reviewNotes: notes ?? null,
    reviewedAt: new Date(),
    reviewedBy: session.user.id,
  }).where(eq(fundApplications.id, id))

  return { success: true }
}
```

### 5. `src/app/(dashboard)/dashboard/fund-applications/page.tsx`
Dashboard admin page. Admin/super_admin only (the dashboard layout already gate-checks roles).

Server Component. Query all fund applications with user info, ordered by `submittedAt DESC`.

Show:
- Page title "Fund Applications"
- Stats: Total, Pending, Approved, Rejected count badges
- Table: Applicant, Amount (GHS), Purpose (truncated), Period, Status badge, Submitted date, View button
- Clicking "View" expands inline or links to a detail view (keep simple — an expandable row or a sheet component)

Create `src/components/dashboard/fund-application-actions.tsx` as a client component with Approve/Reject buttons that call `reviewApplication` via `useMutation`.

Add a "Fund Applications" link to the dashboard sidebar. Read `src/components/dashboard/sidebar.tsx` (or wherever the sidebar nav is defined) and add the entry.

## Style Guide
- Brand: green-800/green-700 primary, white/slate backgrounds
- Match the dashboard table style from `src/app/(dashboard)/dashboard/members/` or posts table
- Fund/loan calculator: large green numbers for monthly payment
- Status badges: pending=yellow, reviewing=blue, approved=green, rejected=red

## Do NOT Touch
- Paystack files (`src/lib/paystack.ts`, payment API routes) — Agent 1's domain
- `src/lib/email.ts`, `src/app/api/contact/route.ts`
- `src/app/events/**` except DO NOT touch at all
- Any existing dashboard pages (only ADD the new fund-applications page)
- `drizzle/schema.ts` after adding fundApplications — only your addition

## Verification
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx tsc --noEmit    # 0 errors
bun run build        # 0 errors
# Manual: visit /fund — calculator works, Apply Now links to /fund/apply
# Manual: /fund/apply as logged-in user — form submits → redirects to member centre
# Manual: /dashboard/fund-applications as admin — table shows submitted applications
```

## When Done
Update `plans/AGENT_CONTEXT.md` AGENT STATUS LOG:
```
| PM2 Phase 5C Agent 2 | Fund Loan Application | DONE | <notes> |
```
