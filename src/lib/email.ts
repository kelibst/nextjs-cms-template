// Required environment variables:
//   RESEND_API_KEY=re_...       — Resend API key (get from resend.com)
//   ADMIN_EMAIL=admin@gaphto.org — email address that receives contact notifications

import { Resend } from 'resend'

// Lazy initialisation — avoids throwing at module-eval time when RESEND_API_KEY
// is absent (e.g. during `next build` in CI without secrets configured).
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM = 'GAPHTO <noreply@gaphto.org>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@gaphto.org'

// Sent to the person who submitted the contact form
export async function sendContactAcknowledgement(
  to: string,
  name: string,
  subject: string
) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `We received your message: ${subject}`,
    html: `<p>Hi ${name},</p><p>Thank you for contacting GAPHTO. We have received your message and will get back to you shortly.</p><p>— GAPHTO Team</p>`,
  })
}

// Sent to admin so they know a new message arrived
export async function sendContactNotification(submission: {
  name: string
  email: string
  subject: string
  message: string
}) {
  await getResend().emails.send({
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

// Sent to user requesting a password reset
export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const r = getResend()
  await r.emails.send({
    from: FROM,
    to,
    subject: 'Reset your GAPHTO password',
    html: `
      <p>Hi ${name},</p>
      <p>Click the link below to reset your password (valid for 1 hour):</p>
      <p><a href="${resetUrl}" style="background:#166534;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">Reset Password</a></p>
      <p>Or copy this link: ${resetUrl}</p>
      <p>If you didn't request this, ignore this email — your password won't change.</p>
      <p>— GAPHTO Team</p>
    `,
  })
}

// Send newsletter to a single recipient (called in batch loop)
export async function sendNewsletterEmail(
  to: string,
  name: string,
  subject: string,
  htmlContent: string,
  unsubscribeUrl: string
) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
        <div style="background:#166534;padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;">GAPHTO Newsletter</h1>
        </div>
        <div style="padding:24px;">
          <p>Dear ${name},</p>
          ${htmlContent}
        </div>
        <div style="padding:16px;text-align:center;font-size:12px;color:#666;border-top:1px solid #eee;">
          <p>You are receiving this because you are a GAPHTO member.<br/>
          <a href="${unsubscribeUrl}">Unsubscribe from newsletters</a></p>
        </div>
      </div>
    `,
  })
}

// Send event announcement to opted-in members (single recipient)
export async function sendEventAlertEmail(
  to: string,
  name: string,
  eventTitle: string,
  eventDate: string,
  eventSlug: string,
  appUrl: string
) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Upcoming GAPHTO Event: ${eventTitle}`,
    html: `
      <p>Hi ${name},</p>
      <p>A new GAPHTO event has been scheduled: <strong>${eventTitle}</strong></p>
      <p>Date: ${eventDate}</p>
      <p><a href="${appUrl}/events/${eventSlug}" style="background:#166534;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">View Event Details</a></p>
      <p>— GAPHTO Team</p>
    `,
  })
}

// Sent to event registrant after successful registration
export async function sendEventRegistrationConfirmation(params: {
  to: string
  name: string
  eventTitle: string
  eventDate: string // pre-formatted date string
  location: string | null
  isOnline: boolean
  isPaid: boolean
  amount?: number | string | null
}) {
  const locationLine = params.isOnline
    ? 'This is an online event. Login details will be sent closer to the date.'
    : params.location
      ? `Location: ${params.location}`
      : ''

  const paymentLine = params.isPaid
    ? `<p>Your registration is <strong>pending payment</strong> of GHS ${params.amount}. Please complete payment to confirm your spot.</p>`
    : `<p>Your registration is <strong>confirmed</strong>. No payment required.</p>`

  await getResend().emails.send({
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
