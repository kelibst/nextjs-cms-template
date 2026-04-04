'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { siteSettings } from '../../../drizzle/schema'
import { revalidatePath } from 'next/cache'

export async function saveSettings(values: Record<string, string>) {
  const session = await auth()
  if (!session || session.user.role !== 'super_admin') throw new Error('Forbidden')

  await Promise.all(
    Object.entries(values).map(([key, value]) =>
      db.insert(siteSettings)
        .values({ key, value })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } })
    )
  )

  revalidatePath('/dashboard/settings')
}
