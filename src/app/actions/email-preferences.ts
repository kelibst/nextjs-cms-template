'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { emailPreferences } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

type PrefsInput = {
  receiveNewsletter: boolean
  receiveEventAlerts: boolean
}

export async function updateEmailPreferences(prefs: PrefsInput) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const userId = session.user.id

  // Upsert — try to update, insert if not exists
  const existing = await db
    .select({ id: emailPreferences.id })
    .from(emailPreferences)
    .where(eq(emailPreferences.userId, userId))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(emailPreferences)
      .set({
        receiveNewsletter: prefs.receiveNewsletter,
        receiveEventAlerts: prefs.receiveEventAlerts,
        updatedAt: new Date(),
      })
      .where(eq(emailPreferences.userId, userId))
  } else {
    await db.insert(emailPreferences).values({
      userId,
      receiveNewsletter: prefs.receiveNewsletter,
      receiveEventAlerts: prefs.receiveEventAlerts,
    })
  }

  revalidatePath('/member-centre/profile')
}
