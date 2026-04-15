'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Video, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Event } from '@/lib/db'

interface Props {
  upcoming: Event[]
  past: Event[]
}

function formatDate(date: Date | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateChip(date: Date | null) {
  if (!date) return null
  const d = new Date(date)
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    year: d.getFullYear(),
  }
}

function EventCard({
  event,
  index,
  subdued = false,
}: {
  event: Event
  index: number
  subdued?: boolean
}) {
  const chip = formatDateChip(event.startDate)
  const dateStr = formatDate(event.startDate)
  const isPaid = event.price !== null && Number(event.price) > 0

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className={`group flex flex-col rounded-xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        subdued
          ? 'border-border bg-muted/50 opacity-80 hover:opacity-100'
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-primary-subtle shrink-0">
        {event.featuredImage ? (
          <Image
            src={event.featuredImage}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary-muted">
            <Calendar className="size-12 text-primary/40" />
          </div>
        )}
        {/* Status badge overlay */}
        {event.status === 'cancelled' && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-600 text-white border-0">Cancelled</Badge>
          </div>
        )}
        {event.status === 'ongoing' && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-amber-500 text-white border-0">Ongoing</Badge>
          </div>
        )}
        {event.status === 'past' && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-gray-500 text-white border-0">Past</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Date chip + location badge */}
        <div className="flex items-start gap-3">
          {chip ? (
            <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-lg w-12 h-14 shrink-0">
              <span className="text-xl font-bold leading-none">{chip.day}</span>
              <span className="text-xs font-medium">{chip.month}</span>
            </div>
          ) : null}
          <div className="flex-1 min-w-0">
            {dateStr && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="size-3 shrink-0" />
                {dateStr}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {event.isOnline ? (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
                  <Video className="size-3" /> Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                  <MapPin className="size-3" /> In-Person
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {/* Location */}
        {event.location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        )}

        {/* Description excerpt */}
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {event.description.replace(/<[^>]*>/g, '').trim()}
          </p>
        )}

        {/* Price + CTA */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-3">
          <span className={`text-sm font-semibold ${isPaid ? 'text-primary' : 'text-muted-foreground'}`}>
            {isPaid ? `$${Number(event.price).toLocaleString()}` : 'Free'}
          </span>
          <Button
            asChild
            size="sm"
            className="bg-primary hover:bg-primary-hover text-primary-foreground border-0 h-8 px-4 text-xs font-medium"
          >
            <Link href={`/events/${event.slug}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </motion.article>
  )
}

export function EventsListClient({ upcoming, past }: Props) {
  return (
    <main className="min-h-screen bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Upcoming Events */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <span className="inline-block w-1 h-7 bg-primary rounded-full" />
              Upcoming Events
            </h2>
            <p className="text-muted-foreground mt-1 ml-4">
              Register now for our next CPD events and training programmes.
            </p>
          </motion.div>

          {upcoming.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-dashed border-border bg-card py-16 text-center"
            >
              <Calendar className="size-12 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-muted-foreground/70 font-medium">No upcoming events at this time.</p>
              <p className="text-muted-foreground/70 text-sm mt-1">Check back soon for new events.</p>
            </motion.div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Past Events */}
        {past.length > 0 && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-foreground/80 flex items-center gap-3">
                <span className="inline-block w-1 h-7 bg-muted-foreground/60 rounded-full" />
                Past Events
              </h2>
              <p className="text-muted-foreground/70 mt-1 ml-4">
                Previous events and programmes.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} subdued />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
