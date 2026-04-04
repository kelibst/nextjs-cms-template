'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { announcements } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { can, type Role } from '@/lib/permissions'

export async function createAnnouncement(data: {
  title: string
  content: string
  visibleTo?: string
  isPinned?: boolean
  expiresAt?: string | null
}) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'posts:create')) throw new Error('Forbidden')

  const [created] = await db.insert(announcements).values({
    title: data.title,
    content: data.content,
    visibleTo: data.visibleTo ?? 'public',
    isPinned: data.isPinned ?? false,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
  }).returning()

  revalidatePath('/dashboard/announcements')
  return created
}

export async function deleteAnnouncement(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'posts:delete')) throw new Error('Forbidden')

  await db.delete(announcements).where(eq(announcements.id, id))
  revalidatePath('/dashboard/announcements')
}
