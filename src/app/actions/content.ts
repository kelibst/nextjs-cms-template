'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { siteSettings } from '../../../drizzle/schema'
import { inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

/**
 * Fetch multiple siteSettings keys at once.
 * Returns a key→value map; missing keys get an empty string.
 * Does NOT require authentication (public read).
 */
export async function getPageContent(keys: string[]): Promise<Record<string, string>> {
  if (keys.length === 0) return {}

  const rows = await db
    .select({ key: siteSettings.key, value: siteSettings.value })
    .from(siteSettings)
    .where(inArray(siteSettings.key, keys))

  const map: Record<string, string> = {}
  // Seed all requested keys with empty string first
  for (const k of keys) map[k] = ''
  // Overwrite with DB values
  for (const row of rows) map[row.key] = row.value

  return map
}

/**
 * Batch upsert siteSettings entries.
 * Requires session.user.role to be 'super_admin' or 'admin'.
 * Throws Error('Forbidden') otherwise.
 */
export async function savePageContent(values: Record<string, string>): Promise<void> {
  const session = await auth()
  if (
    !session ||
    !['super_admin', 'admin'].includes(session.user.role as string)
  ) {
    throw new Error('Forbidden')
  }

  await Promise.all(
    Object.entries(values).map(([key, value]) =>
      db
        .insert(siteSettings)
        .values({ key, value })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value, updatedAt: new Date() },
        })
    )
  )

  revalidatePath('/', 'layout')
  revalidatePath('/about')
}
