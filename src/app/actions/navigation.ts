'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { navigationLinks } from '@/lib/db'
import { asc, eq, max } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { can } from '@/lib/permissions'

// ─── Public — no auth needed ──────────────────────────────────────────────────

export async function getNavLinks() {
  return db
    .select()
    .from(navigationLinks)
    .where(eq(navigationLinks.isVisible, true))
    .orderBy(asc(navigationLinks.sortOrder))
}

// ─── Admin — requires navigation:manage permission ────────────────────────────

export async function getAllNavLinks() {
  const session = await auth()
  if (!session?.user || !can(session.user.role as any, 'navigation:manage')) {
    throw new Error('Unauthorized')
  }
  return db.select().from(navigationLinks).orderBy(asc(navigationLinks.sortOrder))
}

export async function createNavLink(data: {
  label: string
  href: string
  openInNewTab?: boolean
}) {
  const session = await auth()
  if (!session?.user || !can(session.user.role as any, 'navigation:manage')) {
    throw new Error('Unauthorized')
  }

  // sortOrder = max existing + 1
  const [result] = await db.select({ maxOrder: max(navigationLinks.sortOrder) }).from(navigationLinks)
  const nextOrder = (result?.maxOrder ?? -1) + 1

  await db.insert(navigationLinks).values({
    label: data.label,
    href: data.href,
    openInNewTab: data.openInNewTab ?? false,
    sortOrder: nextOrder,
  })

  revalidatePath('/', 'layout')
}

export async function updateNavLink(
  id: string,
  data: { label?: string; href?: string; openInNewTab?: boolean }
) {
  const session = await auth()
  if (!session?.user || !can(session.user.role as any, 'navigation:manage')) {
    throw new Error('Unauthorized')
  }

  await db
    .update(navigationLinks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(navigationLinks.id, id))

  revalidatePath('/', 'layout')
}

export async function deleteNavLink(id: string) {
  const session = await auth()
  if (!session?.user || !can(session.user.role as any, 'navigation:manage')) {
    throw new Error('Unauthorized')
  }

  await db.delete(navigationLinks).where(eq(navigationLinks.id, id))

  revalidatePath('/', 'layout')
}

export async function toggleNavVisibility(id: string) {
  const session = await auth()
  if (!session?.user || !can(session.user.role as any, 'navigation:manage')) {
    throw new Error('Unauthorized')
  }

  const [link] = await db.select().from(navigationLinks).where(eq(navigationLinks.id, id))
  if (!link) throw new Error('Not found')

  await db
    .update(navigationLinks)
    .set({ isVisible: !link.isVisible, updatedAt: new Date() })
    .where(eq(navigationLinks.id, id))

  revalidatePath('/', 'layout')
}

export async function reorderNavLinks(links: { id: string; sortOrder: number }[]) {
  const session = await auth()
  if (!session?.user || !can(session.user.role as any, 'navigation:manage')) {
    throw new Error('Unauthorized')
  }

  await Promise.all(
    links.map(({ id, sortOrder }) =>
      db
        .update(navigationLinks)
        .set({ sortOrder, updatedAt: new Date() })
        .where(eq(navigationLinks.id, id))
    )
  )

  revalidatePath('/', 'layout')
}
