import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { db } from '@/lib/db'
import { eventRegistrations, events } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { Calendar, MapPin, User, Mail, ArrowLeft, ShieldCheck } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { PaymentButton } from '@/components/events/payment-button'

interface Props {
  params: Promise<{ registrationId: string }>
}

export const metadata: Metadata = {
  title: 'Complete Payment',
  description: 'Complete your event registration payment securely via Paystack.',
}

export default async function PaymentPage({ params }: Props) {
  const { registrationId } = await params

  const registration = await db.query.eventRegistrations.findFirst({
    where: eq(eventRegistrations.id, registrationId),
  })

  if (!registration) notFound()

  const event = await db.query.events.findFirst({
    where: eq(events.id, registration.eventId),
  })

  if (!event) notFound()

  // If already paid, redirect to event page
  if (registration.paymentStatus === 'complete') {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <ShieldCheck className="size-14 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Payment Complete</h1>
          <p className="text-muted-foreground mb-6">
            Your registration for{' '}
            <span className="font-semibold">{event.title}</span> has already been confirmed.
          </p>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
          >
            <ArrowLeft className="size-4" />
            Back to event
          </Link>
        </div>
      </div>
    )
  }

  const amount = Number(event.priceGhs ?? 0)

  const eventDate = event.startDate
    ? new Date(event.startDate).toLocaleDateString('en-GH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Date TBD'

  return (
    <div className="min-h-screen bg-muted/50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground/80 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to event
        </Link>

        <div className="bg-card rounded-2xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-6 py-8 text-primary-foreground">
            <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wide mb-1">
              Complete Your Registration
            </p>
            <h1 className="text-2xl font-bold leading-tight">{event.title}</h1>
          </div>

          <div className="p-6 space-y-6">
            {/* Event details */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Event Details
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-foreground/80">
                  <Calendar className="size-4 text-primary shrink-0" />
                  <span className="text-sm">{eventDate}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-3 text-foreground/80">
                    <MapPin className="size-4 text-primary shrink-0" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Registrant details */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Your Details
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-foreground/80">
                  <User className="size-4 text-primary shrink-0" />
                  <span className="text-sm">{registration.name}</span>
                </div>
                <div className="flex items-center gap-3 text-foreground/80">
                  <Mail className="size-4 text-primary shrink-0" />
                  <span className="text-sm">{registration.email}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Amount */}
            <div className="bg-primary-subtle rounded-xl px-5 py-4 flex items-center justify-between">
              <span className="text-foreground/80 font-medium">Amount Due</span>
              <span className="text-2xl font-bold text-primary">
                GH₵ {amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Payment button */}
            <PaymentButton registrationId={registrationId} amount={amount} />

            {/* Security note */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground/70">
              <ShieldCheck className="size-3.5 shrink-0 mt-0.5" />
              <span>
                Payments are processed securely by Paystack. GAPHTO does not store your card details.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
