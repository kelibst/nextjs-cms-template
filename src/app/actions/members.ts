'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { members } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function updateMemberStatus(memberId: string, membershipStatus: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!['super_admin', 'admin'].includes(session.user.role)) throw new Error('Forbidden')

  await db.update(members).set({ membershipStatus: membershipStatus as typeof members.$inferInsert['membershipStatus'] }).where(eq(members.id, memberId))
  revalidatePath('/dashboard/members')
}
