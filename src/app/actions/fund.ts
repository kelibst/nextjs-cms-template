'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fundApplications } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { can } from '@/lib/permissions'
import type { Role } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'

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

  if (data.loanAmount < 500 || data.loanAmount > 10000) {
    throw new Error('Loan amount must be between GHS 500 and GHS 10,000')
  }

  if (!data.loanPurpose || data.loanPurpose.trim().length < 50) {
    throw new Error('Loan purpose must be at least 50 characters')
  }

  const [application] = await db
    .insert(fundApplications)
    .values({
      userId: session.user.id,
      applicantName: data.applicantName,
      email: data.email,
      phone: data.phone,
      region: data.region,
      facility: data.facility,
      loanAmount: String(data.loanAmount),
      loanPurpose: data.loanPurpose,
      repaymentPeriodMonths: data.repaymentPeriodMonths,
      status: 'pending',
    })
    .returning()

  revalidatePath('/dashboard/fund-applications')
  return { success: true, id: application.id }
}

export async function reviewApplication(
  id: string,
  status: 'reviewing' | 'approved' | 'rejected',
  notes?: string,
) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'members:manage')) throw new Error('Forbidden')

  await db
    .update(fundApplications)
    .set({
      status,
      reviewNotes: notes ?? null,
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
    })
    .where(eq(fundApplications.id, id))

  revalidatePath('/dashboard/fund-applications')
  return { success: true }
}
