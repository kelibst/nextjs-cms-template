'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { newsletters, members, users, emailPreferences } from '../../../drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { can, type Role } from '@/lib/permissions'
import { sendNewsletterEmail } from '@/lib/email'

type NewsletterInput = {
  subject: string
  content: string
}

export async function createNewsletter(data: NewsletterInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'newsletter:manage')) throw new Error('Forbidden')

  const [row] = await db.insert(newsletters).values({
    subject: data.subject,
    content: data.content,
    status: 'draft',
    createdBy: session.user.id ?? null,
  }).returning({ id: newsletters.id })

  revalidatePath('/dashboard/newsletter')
  redirect('/dashboard/newsletter')
}

export async function updateNewsletter(id: string, data: NewsletterInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'newsletter:manage')) throw new Error('Forbidden')

  // Only update if draft
  const [existing] = await db.select({ status: newsletters.status }).from(newsletters).where(eq(newsletters.id, id)).limit(1)
  if (!existing || existing.status !== 'draft') throw new Error('Cannot edit a sent newsletter')

  await db.update(newsletters).set({
    subject: data.subject,
    content: data.content,
  }).where(eq(newsletters.id, id))

  revalidatePath('/dashboard/newsletter')
  redirect('/dashboard/newsletter')
}

export async function deleteNewsletter(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'newsletter:manage')) throw new Error('Forbidden')

  const [existing] = await db.select({ status: newsletters.status }).from(newsletters).where(eq(newsletters.id, id)).limit(1)
  if (!existing || existing.status !== 'draft') throw new Error('Cannot delete a sent newsletter')

  await db.delete(newsletters).where(eq(newsletters.id, id))
  revalidatePath('/dashboard/newsletter')
}

export async function sendNewsletter(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'newsletter:manage')) throw new Error('Forbidden')

  // Fetch the newsletter
  const [newsletter] = await db.select().from(newsletters).where(eq(newsletters.id, id)).limit(1)
  if (!newsletter || newsletter.status !== 'draft') throw new Error('Newsletter not found or already sent')

  // Fetch all active members with their user records
  const activeMembers = await db
    .select({
      userId: members.userId,
      email: users.email,
      name: users.name,
    })
    .from(members)
    .leftJoin(users, eq(members.userId, users.id))
    .where(eq(members.membershipStatus, 'active'))

  // Build a map of userId → preferences (only for those who have explicit rows)
  const prefRows = await db.select().from(emailPreferences)
  const prefMap = new Map(prefRows.map((p) => [p.userId, p]))

  // Filter: send only to those where receiveNewsletter is true (or no preference row = default true)
  const recipients = activeMembers.filter((m) => {
    if (!m.email) return false
    const pref = prefMap.get(m.userId)
    if (pref === undefined) return true // default true
    return pref.receiveNewsletter !== false
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gaphto.org'
  let sentCount = 0

  for (const recipient of recipients) {
    if (!recipient.email) continue
    const unsubscribeUrl = `${appUrl}/member-centre/profile#email-preferences`
    try {
      await sendNewsletterEmail(
        recipient.email,
        recipient.name ?? 'Member',
        newsletter.subject,
        newsletter.content,
        unsubscribeUrl
      )
      sentCount++
    } catch (err) {
      console.error(`Failed to send newsletter to ${recipient.email}:`, err)
      // Continue — don't abort the whole send
    }
  }

  // Mark as sent
  await db.update(newsletters).set({
    status: 'sent',
    sentAt: new Date(),
    recipientCount: sentCount,
  }).where(eq(newsletters.id, id))

  revalidatePath('/dashboard/newsletter')
}
