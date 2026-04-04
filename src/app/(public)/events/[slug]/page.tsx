import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { db } from '@/lib/db'
import { events } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { Calendar, MapPin, Video, Clock, Users, Tag, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { EventRegistrationForm } from '@/components/events/event-registration-form'

interface Props {
  params: Promise<{ slug: string }>
}

async function getEvent(slug: string) {
  const event = await db.query.events.findFirst({
    where: eq(events.slug, slug),
  })
  return event ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) return { title: 'Event Not Found' }

  const plainDescription = event.description
    ? event.description.replace(/<[^>]*>/g, '').trim().slice(0, 160)
    : undefined

  return {
    title: event.title,
    description: plainDescription ?? `GAPHTO event: ${event.title}`,
    openGraph: {
      title: event.title,
      description: plainDescription,
      images: event.featuredImage ? [event.featuredImage] : [],
    },
  }
}

function formatDate(date: Date | null, opts?: Intl.DateTimeFormatOptions) {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-GB', opts ?? {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(date: Date | null) {
  if (!date) return null
  return new Date(date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusConfig = {
  upcoming: { label: 'Upcoming', className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
  ongoing: { label: 'Ongoing Now', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  past: { label: 'Past Event', className: 'bg-muted text-muted-foreground border-border' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-600 border-red-200' },
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()

  const isPaid = event.priceGhs !== null && Number(event.priceGhs) > 0
  const canRegister = event.status !== 'past' && event.status !== 'cancelled'
  const status = statusConfig[event.status] ?? statusConfig.upcoming

  return (
    <main className="min-h-screen bg-muted/50">
      {/* Hero */}
      <div className="relative w-full bg-primary-deep overflow-hidden">
        {event.featuredImage ? (
          <>
            <div className="relative w-full h-72 sm:h-96 lg:h-[480px]">
              <Image
                src={event.featuredImage}
                alt={event.title}
                fill
                priority
                className="object-cover opacity-50"
                sizes="100vw"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary-deep via-primary-deep/60 to-transparent" />
          </>
        ) : (
          <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-primary-deep via-primary-hover to-primary" />
        )}

        {/* Overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="mx-auto max-w-7xl">
            {/* Back link */}
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="size-4" />
              All Events
            </Link>

            {/* Status badge */}
            <div className="mb-3">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
              >
                {status.label}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight max-w-4xl">
              {event.title}
            </h1>

            {/* Date + location chips */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {event.startDate && (
                <div className="flex items-center gap-1.5 text-sm text-primary-foreground/80">
                  <Calendar className="size-4 text-primary-foreground/60" />
                  {formatDate(event.startDate)}
                </div>
              )}
              {event.isOnline ? (
                <div className="flex items-center gap-1.5 text-sm text-blue-200">
                  <Video className="size-4" />
                  Online Event
                </div>
              ) : event.location ? (
                <div className="flex items-center gap-1.5 text-sm text-primary-foreground/80">
                  <MapPin className="size-4 text-primary-foreground/60" />
                  {event.location}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {event.description && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">About This Event</h2>
                <div
                  className="prose prose-green max-w-none text-foreground/80 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </section>
            )}

            {/* Registration form (shown inline on mobile too) */}
            {canRegister && (
              <section className="lg:hidden">
                <Separator className="mb-8" />
                <h2 className="text-xl font-semibold text-foreground mb-6">Register for This Event</h2>
                <EventRegistrationForm
                  eventId={event.id}
                  eventTitle={event.title}
                  priceGhs={event.priceGhs}
                />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Info card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
              <h3 className="text-base font-semibold text-foreground">Event Details</h3>
              <Separator />

              <dl className="space-y-4 text-sm">
                {event.startDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="size-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Date
                      </dt>
                      <dd className="text-foreground mt-0.5">{formatDate(event.startDate)}</dd>
                    </div>
                  </div>
                )}

                {event.startDate && formatTime(event.startDate) && (
                  <div className="flex items-start gap-3">
                    <Clock className="size-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Time
                      </dt>
                      <dd className="text-foreground mt-0.5">
                        {formatTime(event.startDate)}
                        {event.endDate && ` – ${formatTime(event.endDate)}`}
                      </dd>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {event.isOnline ? (
                    <Video className="size-4 text-blue-500 mt-0.5 shrink-0" />
                  ) : (
                    <MapPin className="size-4 text-primary mt-0.5 shrink-0" />
                  )}
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Location
                    </dt>
                    <dd className="text-foreground mt-0.5">
                      {event.isOnline ? 'Online (link sent on registration)' : event.location ?? 'TBD'}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="size-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Price
                    </dt>
                    <dd className={`mt-0.5 font-semibold ${isPaid ? 'text-primary' : 'text-muted-foreground'}`}>
                      {isPaid ? `GH₵ ${Number(event.priceGhs).toLocaleString()}` : 'Free'}
                    </dd>
                  </div>
                </div>

                {event.maxAttendees && (
                  <div className="flex items-start gap-3">
                    <Users className="size-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Capacity
                      </dt>
                      <dd className="text-foreground mt-0.5">{event.maxAttendees} attendees</dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>

            {/* Registration form (desktop sidebar) */}
            {canRegister && (
              <div className="hidden lg:block rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-base font-semibold text-foreground mb-5">Register for This Event</h3>
                <EventRegistrationForm
                  eventId={event.id}
                  eventTitle={event.title}
                  priceGhs={event.priceGhs}
                />
              </div>
            )}

            {!canRegister && (
              <div className="rounded-xl border border-dashed border-border bg-muted/50 p-6 text-center">
                <p className="text-sm text-muted-foreground font-medium">
                  {event.status === 'cancelled'
                    ? 'This event has been cancelled.'
                    : 'Registration for this event is closed.'}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}
