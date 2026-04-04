'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { leadership } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type LeadershipInput = {
  name: string
  role: string
  sortOrder?: number
  bio?: string
  email?: string
  facebookUrl?: string
  twitterUrl?: string
  imageUrl?: string
  isActive?: boolean
  termStart?: string | null
  termEnd?: string | null
}

function requireAdmin(role: string) {
  if (!['super_admin', 'admin'].includes(role)) throw new Error('Forbidden')
}

export async function createLeadership(data: LeadershipInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  requireAdmin(session.user.role)

  await db.insert(leadership).values({
    name: data.name,
    role: data.role,
    sortOrder: data.sortOrder ?? 0,
    bio: data.bio ?? null,
    email: data.email ?? null,
    facebookUrl: data.facebookUrl ?? null,
    twitterUrl: data.twitterUrl ?? null,
    imageUrl: data.imageUrl ?? null,
    isActive: data.isActive ?? true,
    termStart: data.termStart ? new Date(data.termStart) : null,
    termEnd: data.termEnd ? new Date(data.termEnd) : null,
  })

  revalidatePath('/dashboard/leadership')
  redirect('/dashboard/leadership')
}

export async function updateLeadership(id: string, data: LeadershipInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  requireAdmin(session.user.role)

  await db.update(leadership).set({
    name: data.name,
    role: data.role,
    sortOrder: data.sortOrder ?? 0,
    bio: data.bio ?? null,
    email: data.email ?? null,
    facebookUrl: data.facebookUrl ?? null,
    twitterUrl: data.twitterUrl ?? null,
    imageUrl: data.imageUrl ?? null,
    isActive: data.isActive ?? true,
    termStart: data.termStart ? new Date(data.termStart) : null,
    termEnd: data.termEnd ? new Date(data.termEnd) : null,
  }).where(eq(leadership.id, id))

  revalidatePath('/dashboard/leadership')
  redirect('/dashboard/leadership')
}

export async function deleteLeadership(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  requireAdmin(session.user.role)

  await db.delete(leadership).where(eq(leadership.id, id))
  revalidatePath('/dashboard/leadership')
}
