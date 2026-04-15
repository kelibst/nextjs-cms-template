'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Video, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Event } from '@/lib/data'

interface Props {
  events: Event[]
  heading?: string
  count?: number
}

function formatEventDate(dateStr: string | null) {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    return {
      day: d.getDate().toString().padStart(2, '0'),
      month: d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
      year: d.getFullYear(),
    }
  } catch {
    return null
  }
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&#[0-9]+;/g, '').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, '').trim()
}

export function EventsPreview({ events, heading = 'Events & Programs', count }: Props) {
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl font-bold text-foreground">{heading}</h2>
            <p className="text-muted-foreground mt-1">Upcoming CPDs, conferences, and training opportunities</p>
          </div>
          <Link
            href="/events"
            className="text-primary font-medium hover:text-primary/80 transition-colors whitespace-nowrap flex items-center gap-1"
          >
            View All <span aria-hidden="true">&rarr;</span>
          </Link>
        </motion.div>

        {events.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground/70">
            <Calendar className="size-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming events at this time.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 pb-4 md:pb-0 snap-x snap-mandatory md:snap-none">
            {events.slice(0, count ?? 4).map((event, i) => {
              const date = formatEventDate(event.startDate)
              return (
                <motion.div
                  key={event.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="snap-center shrink-0 w-72 md:w-auto"
                >
                  <div className="border border-border rounded-xl p-5 h-full flex flex-col gap-4 hover:border-primary/50 hover:shadow-md transition-all duration-200">
                    {/* Date chip */}
                    {date ? (
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-lg w-12 h-14 shrink-0">
                          <span className="text-xl font-bold leading-none">{date.day}</span>
                          <span className="text-xs font-medium">{date.month}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground/70">{date.year}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            {event.isOnline ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 dark:bg-blue-900/30 dark:text-blue-400">
                                <Video className="size-3" /> Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs bg-primary-subtle text-primary border border-primary-subtle rounded-full px-2 py-0.5">
                                <MapPin className="size-3" /> Physical
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        {event.isOnline ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 dark:bg-blue-900/30 dark:text-blue-400">
                            <Video className="size-3" /> Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-primary-subtle text-primary border border-primary-subtle rounded-full px-2 py-0.5">
                            <MapPin className="size-3" /> Physical
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
                        {event.title}
                      </h3>
                      {event.location && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="size-3" /> {event.location}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground/80">
                        {event.price > 0 ? `$${event.price.toLocaleString()}` : 'Free'}
                      </span>
                      <Button
                        asChild
                        size="sm"
                        className="bg-primary hover:bg-primary-hover text-primary-foreground border-0 h-8 px-3 text-xs"
                      >
                        <Link href={event.sourceUrl} target="_blank" rel="noopener noreferrer">
                          Register
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
