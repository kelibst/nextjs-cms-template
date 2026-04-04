# PM2 Phase 5B — Agent 1: Email Integration (Resend)

## Read First
Read `plans/AGENT_CONTEXT.md` for full project context (Phase 5 section).

## Your Goal
Install Resend, create a typed email helper, wire the contact form API route to save to DB and send emails, and wire the event registration action to send confirmation emails.

## Step 0 — Install Package
```bash
cd /home/kelib/Desktop/moreprojects/gaphto && bun add resend
```

## Files To Create

### 1. `src/lib/email.ts`
Resend client + typed helper functions. Use React Email-style HTML strings (plain HTML is fine — no JSX needed).

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'GAPHTO <noreply@gaphto.org>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@gaphto.org'

// Sent to the person who submitted the contact form
export async function sendContactAcknowledgement(to: string, name: string, subject: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `We received your message: ${subject}`,
    html: `<p>Hi ${name},</p><p>Thank you for contacting GAPHTO. We have received your message and will get back to you shortly.</p><p>— GAPHTO Team</p>`,
  })
}

// Sent to admin so they know a message arrived
export async function sendContactNotification(submission: {
  name: string; email: string; subject: string; message: string
}) {
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New contact form submission: ${submission.subject}`,
    html: `
      <p><strong>From:</strong> ${submission.name} &lt;${submission.email}&gt;</p>
      <p><strong>Subject:</strong> ${submission.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${submission.message.replace(/\n/g, '<br>')}</p>
    `,
  })
}

// Sent to event registrant after successful registration
export async function sendEventRegistrationConfirmation(params: {
  to: string
  name: string
  eventTitle: string
  eventDate: string   // pre-formatted date string
  location: string | null
  isOnline: boolean
  isPaid: boolean
  amount?: number | string | null
}) {
  const locationLine = params.isOnline
    ? 'This is an online event. Login details will be sent closer to the date.'
    : params.location ? `Location: ${params.location}` : ''

  const paymentLine = params.isPaid
    ? `<p>Your registration is <strong>pending payment</strong> of GHS ${params.amount}. Please complete payment to confirm your spot.</p>`
    : `<p>Your registration is <strong>confirmed</strong>. No payment required.</p>`

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Registration confirmed: ${params.eventTitle}`,
    html: `
      <p>Hi ${params.name},</p>
      <p>You have successfully registered for <strong>${params.eventTitle}</strong>.</p>
      <p>Date: ${params.eventDate}</p>
      ${locationLine ? `<p>${locationLine}</p>` : ''}
      ${paymentLine}
      <p>If you have any questions, contact us at info@gaphto.org.</p>
      <p>— GAPHTO Team</p>
    `,
  })
}
```

## Files To Modify

### 2. `src/app/api/contact/route.ts`
Read the file first. It currently logs to console and returns 200 without saving anything.

Replace with:
1. Import `db` from `@/lib/db` and the `contactSubmissions` table
2. Import email helpers from `@/lib/email`
3. In the POST handler:
   a. Parse and validate the request body (name, email, subject, message — all required)
   b. Insert into `contactSubmissions` table
   c. Call `sendContactAcknowledgement` and `sendContactNotification` — wrap BOTH in try/catch, log errors but do NOT return a 500 if email fails
   d. Return `{ success: true, id: submission.id }`

Read `src/lib/db.ts` to get the correct import names for `db` and `contactSubmissions` table.
Read `drizzle/schema.ts` to see exact column names for `contactSubmissions`.

### 3. `src/app/actions/event-registration.ts`
Read the file first (created by Phase 5A Agent 2). After the successful DB insert:
- Import `sendEventRegistrationConfirmation` from `@/lib/email`
- Format the event date as a readable string (e.g. `event.startDate ? format(event.startDate, 'PPP p') : 'TBD'`)
- Call the email helper inside a try/catch — email failure must NOT abort the registration
- You may need `import { format } from 'date-fns'` — check if date-fns is already in package.json; if not, use `new Date(event.startDate).toLocaleDateString('en-GH', { ... })` instead

## Do NOT Touch
- `src/app/events/**` — page/UI files (Agent 2 in Phase 5A built these; only the action file is yours)
- Any dashboard files
- `src/lib/db.ts`, `src/auth.ts`
- `drizzle/schema.ts`
- Any form components
- Member directory files (Phase 5B Agent 2's domain)

## Environment Variables Required
The user must add these to `.env.local` before email works:
```
RESEND_API_KEY=re_...
ADMIN_EMAIL=admin@gaphto.org
```
Document this in a comment at the top of `src/lib/email.ts`.

## Verification
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx tsc --noEmit   # 0 errors
bun run build       # 0 errors
# Manual: submit contact form → check DB contactSubmissions table has row
# Manual: register for event → check DB event_registrations table has row
```

## When Done
Update `plans/AGENT_CONTEXT.md` AGENT STATUS LOG:
```
| PM2 Phase 5B Agent 1 | Email Integration (Resend) | DONE | <notes> |
```
