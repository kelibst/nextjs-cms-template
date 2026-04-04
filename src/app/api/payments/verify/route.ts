import { db } from '@/lib/db'
import { eventRegistrations } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { verifyPayment } from '@/lib/paystack'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const reference = url.searchParams.get('reference')
  const registrationId = url.searchParams.get('registrationId')
  const slug = url.searchParams.get('slug')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!reference || !registrationId) {
    return Response.redirect(`${appUrl}/events?payment=failed`)
  }

  try {
    const payment = await verifyPayment(reference)

    if (payment.status === 'success') {
      await db
        .update(eventRegistrations)
        .set({ paymentStatus: 'complete', paymentReference: reference })
        .where(eq(eventRegistrations.id, registrationId))

      const destination = slug
        ? `${appUrl}/events/${slug}?registered=true`
        : `${appUrl}/events?registered=true`
      return Response.redirect(destination)
    } else {
      const destination = slug
        ? `${appUrl}/events/${slug}?payment=failed`
        : `${appUrl}/events?payment=failed`
      return Response.redirect(destination)
    }
  } catch (err) {
    console.error('[payments/verify] error:', err)
    return Response.redirect(`${appUrl}/events?payment=error`)
  }
}
