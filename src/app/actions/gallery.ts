'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { galleryAlbums, galleryImages } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { can, type Role } from '@/lib/permissions'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ── Albums ────────────────────────────────────────────────────────────────────

export async function createAlbum(data: {
  title: string
  slug?: string
  description?: string
  eventDate?: string | null
}) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'gallery:manage')) throw new Error('Forbidden')

  const [created] = await db.insert(galleryAlbums).values({
    title: data.title,
    slug: data.slug ?? slugify(data.title),
    description: data.description ?? null,
    eventDate: data.eventDate ? new Date(data.eventDate) : null,
  }).returning()

  revalidatePath('/dashboard/gallery')
  return created
}

export async function updateAlbum(id: string, data: {
  title: string
  slug: string
  description?: string
  eventDate?: string | null
}) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'gallery:manage')) throw new Error('Forbidden')

  const [updated] = await db.update(galleryAlbums).set({
    title: data.title,
    slug: data.slug,
    description: data.description ?? null,
    eventDate: data.eventDate ? new Date(data.eventDate) : null,
  }).where(eq(galleryAlbums.id, id)).returning()

  revalidatePath('/dashboard/gallery')
  revalidatePath(`/dashboard/gallery/${id}`)
  return updated
}

export async function deleteAlbum(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'gallery:manage')) throw new Error('Forbidden')

  await db.delete(galleryAlbums).where(eq(galleryAlbums.id, id))
  revalidatePath('/dashboard/gallery')
}

// ── Images ────────────────────────────────────────────────────────────────────

export async function addImageToAlbum(albumId: string, data: {
  url: string
  caption?: string
  altText?: string
  sortOrder?: number
}) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'gallery:manage')) throw new Error('Forbidden')

  const [created] = await db.insert(galleryImages).values({
    albumId,
    url: data.url,
    caption: data.caption ?? null,
    altText: data.altText ?? null,
    sortOrder: data.sortOrder ?? 0,
  }).returning()

  revalidatePath(`/dashboard/gallery/${albumId}`)
  return created
}

export async function updateImageCaption(albumId: string, imageId: string, caption: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'gallery:manage')) throw new Error('Forbidden')

  await db.update(galleryImages).set({ caption }).where(eq(galleryImages.id, imageId))
  revalidatePath(`/dashboard/gallery/${albumId}`)
}

export async function updateImageOrder(albumId: string, imageId: string, sortOrder: number) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'gallery:manage')) throw new Error('Forbidden')

  await db.update(galleryImages).set({ sortOrder }).where(eq(galleryImages.id, imageId))
  revalidatePath(`/dashboard/gallery/${albumId}`)
}

export async function deleteGalleryImage(albumId: string, imageId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'gallery:manage')) throw new Error('Forbidden')

  await db.delete(galleryImages).where(eq(galleryImages.id, imageId))
  revalidatePath(`/dashboard/gallery/${albumId}`)
}
