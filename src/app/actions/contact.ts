'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { contactSubmissions } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { can, type Role } from '@/lib/permissions'

export async function markMessageRead(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'contact:view')) throw new Error('Forbidden')

  await db.update(contactSubmissions).set({ isRead: true }).where(eq(contactSubmissions.id, id))
  revalidatePath('/dashboard/contact')
}
