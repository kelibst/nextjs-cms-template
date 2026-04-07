'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { contactSubmissions } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { can, type Role } from '@/lib/permissions'
import { sendContactAcknowledgement, sendContactNotification } from '@/lib/email'

export async function markMessageRead(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'contact:view')) throw new Error('Forbidden')

  await db.update(contactSubmissions).set({ isRead: true }).where(eq(contactSubmissions.id, id))
  revalidatePath('/dashboard/contact')
}

export async function submitContactForm(data: {
  name: string
  email: string
  subject?: string
  message: string
}): Promise<{ success: true; id: string } | { success: false; error: string }> {
  if (!data.name?.trim()) return { success: false, error: 'Name is required.' }
  if (!data.email?.includes('@')) return { success: false, error: 'A valid email is required.' }
  if (!data.message?.trim()) return { success: false, error: 'Message is required.' }

  try {
    const [row] = await db
      .insert(contactSubmissions)
      .values({
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject?.trim() ?? null,
        message: data.message.trim(),
      })
      .returning({ id: contactSubmissions.id })

    // Emails — failures must NOT block success
    const subjectText = data.subject?.trim() || '(No subject)'
    sendContactAcknowledgement(data.email.trim(), data.name.trim(), subjectText).catch(console.error)
    sendContactNotification({ name: data.name.trim(), email: data.email.trim(), subject: subjectText, message: data.message.trim() }).catch(console.error)

    return { success: true, id: row.id }
  } catch (err) {
    console.error('[contact] submitContactForm error:', err)
    return { success: false, error: 'Failed to save your message. Please try again.' }
  }
}
