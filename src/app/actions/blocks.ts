'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { pageBlocks } from '../../../drizzle/schema'
import { eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

function requireAdmin(role: string) {
  if (!['super_admin', 'admin'].includes(role)) throw new Error('Forbidden')
}

// Public — no auth needed
export async function getPageBlocks(page: string) {
  return db
    .select()
    .from(pageBlocks)
    .where(eq(pageBlocks.page, page))
    .orderBy(asc(pageBlocks.sortOrder))
}

// Auth required for all below
export async function upsertBlock(params: {
  id?: string | null
  page: string
  type: string
  content: object
  sortOrder: number
  isVisible?: boolean
}) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  requireAdmin(session.user.role)

  const contentJson = JSON.stringify(params.content)

  if (params.id) {
    await db
      .update(pageBlocks)
      .set({ content: contentJson, sortOrder: params.sortOrder, updatedAt: new Date() })
      .where(eq(pageBlocks.id, params.id))
  } else {
    await db.insert(pageBlocks).values({
      page: params.page,
      type: params.type as any,
      sortOrder: params.sortOrder,
      content: contentJson,
      isVisible: params.isVisible ?? true,
    })
  }

  revalidatePath('/', 'layout')
  revalidatePath('/about')
  revalidatePath('/fund')
  revalidatePath('/practice-areas')
}

export async function deleteBlock(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  requireAdmin(session.user.role)

  await db.delete(pageBlocks).where(eq(pageBlocks.id, id))
  revalidatePath('/', 'layout')
  revalidatePath('/about')
  revalidatePath('/fund')
  revalidatePath('/practice-areas')
}

export async function reorderBlocks(blocks: { id: string; sortOrder: number }[]) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  requireAdmin(session.user.role)

  await Promise.all(
    blocks.map(({ id, sortOrder }) =>
      db.update(pageBlocks).set({ sortOrder, updatedAt: new Date() }).where(eq(pageBlocks.id, id))
    )
  )

  revalidatePath('/', 'layout')
  revalidatePath('/about')
  revalidatePath('/fund')
  revalidatePath('/practice-areas')
}

export async function toggleBlockVisibility(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  requireAdmin(session.user.role)

  const [block] = await db.select().from(pageBlocks).where(eq(pageBlocks.id, id))
  if (!block) throw new Error('Block not found')

  await db
    .update(pageBlocks)
    .set({ isVisible: !block.isVisible, updatedAt: new Date() })
    .where(eq(pageBlocks.id, id))

  revalidatePath('/', 'layout')
  revalidatePath('/about')
  revalidatePath('/fund')
  revalidatePath('/practice-areas')
}

export async function republishPage(page: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  requireAdmin(session.user.role)

  const pathMap: Record<string, string> = {
    homepage: '/',
    about: '/about',
    fund: '/fund',
    'practice-areas': '/practice-areas',
  }

  const publicPath = pathMap[page]
  if (publicPath) {
    revalidatePath(publicPath, 'layout')
  }
  revalidatePath('/news', 'layout')
  revalidatePath('/dashboard/content')
}
