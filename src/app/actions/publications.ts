'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { publications } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { can, type Role } from '@/lib/permissions'

type PublicationInput = {
  title: string
  slug?: string
  description?: string
  fileUrl?: string | null
  fileType?: string | null
  isMemberOnly?: boolean
  publishedAt?: string | null
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function createPublication(data: PublicationInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'publications:manage')) throw new Error('Forbidden')

  await db.insert(publications).values({
    title: data.title,
    slug: data.slug ?? `${slugify(data.title)}-${Date.now()}`,
    description: data.description ?? null,
    fileUrl: data.fileUrl ?? null,
    fileType: data.fileType ?? null,
    isMemberOnly: data.isMemberOnly ?? true,
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
  })

  revalidatePath('/dashboard/publications')
  redirect('/dashboard/publications')
}

export async function updatePublication(id: string, data: PublicationInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'publications:manage')) throw new Error('Forbidden')

  await db.update(publications).set({
    title: data.title,
    description: data.description ?? null,
    fileUrl: data.fileUrl ?? null,
    fileType: data.fileType ?? null,
    isMemberOnly: data.isMemberOnly ?? true,
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
  }).where(eq(publications.id, id))

  revalidatePath('/dashboard/publications')
  redirect('/dashboard/publications')
}

export async function deletePublication(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'publications:manage')) throw new Error('Forbidden')

  await db.delete(publications).where(eq(publications.id, id))
  revalidatePath('/dashboard/publications')
}
