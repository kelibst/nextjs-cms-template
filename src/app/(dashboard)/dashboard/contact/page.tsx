import { db } from '@/lib/db'
import { contactSubmissions } from '../../../../../drizzle/schema'
import { desc } from 'drizzle-orm'
import { ContactInbox } from '@/components/dashboard/contact-inbox'

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const messages = await db
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.submittedAt))

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Contact Inbox</h1>
      <ContactInbox messages={messages} />
    </div>
  )
}
