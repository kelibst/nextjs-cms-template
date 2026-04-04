'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Calendar, MapPin } from 'lucide-react'
import {
  getAllPosts,
  getEvents,
  decodeEntities,
  type Post,
} from '@/lib/data'

interface Props {
  posts?: Post[]
}

const CATEGORY_CONFIG: Record<string, { label: string; badge: string }> = {
  'gaphto-news': { label: 'GAPHTO News',  badge: 'bg-primary-muted text-primary/90' },
  'health-news': { label: 'Health News',  badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  'blog':        { label: 'Blog',         badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
}

function postImageSrc(post: Post): string {
  return post.featuredImage || '/images/placeholder.jpg'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function cleanExcerpt(raw: string, max = 180): string {
  const text = decodeEntities(raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim())
  return text.length > max ? text.slice(0, max) + '…' : text
}

export function HeroCarousel(_props: Props) {
  const posts = getAllPosts()
  const events = getEvents()

  const heroNews = posts.slice(0, 3)
  const nextEvent = events[0]

  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const eventTitle = nextEvent
    ? decodeEntities(nextEvent.title).slice(0, 50) +
      (nextEvent.title.length > 50 ? '…' : '')
    : null

  useEffect(() => {
    if (isHovered || heroNews.length === 0) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroNews.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isHovered, heroNews.length])

  const active = heroNews[activeIndex]
  const catCfg = active ? (CATEGORY_CONFIG[active.category] ?? CATEGORY_CONFIG['gaphto-news']) : null

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden flex items-center"
      style={{
        background:
          'radial-gradient(ellipse at 70% 50%, var(--primary-subtle) 0%, var(--background) 40%, var(--background) 75%)',
      }}
    >
      {/* Dot-grid overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, oklch(from var(--primary) l c h / 0.2) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Soft glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-150 h-150 bg-primary-muted rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-0 min-h-screen flex items-center">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8 w-full">

          {/* ── Left column ─────────────────────────────────────── */}
          <div className="flex-55 flex flex-col gap-5 lg:gap-7 max-w-xl w-full">

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <span className="inline-flex items-center gap-2 bg-primary-muted text-primary/90 text-sm font-medium px-4 py-1.5 rounded-full border border-primary-muted">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Ghana&apos;s Public Health Association
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
              className="text-5xl lg:text-6xl font-bold text-foreground leading-[1.08] tracking-tight"
            >
              We are the{' '}
              <span className="text-primary">backbone</span>
              {' '}of Public Health in Ghana
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-md leading-relaxed"
            >
              Uniting Disease Control, Health Information, and Nutrition professionals
              to build a healthier Ghana.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-7 py-3.5 rounded-xl transition-colors duration-200 shadow-md shadow-primary/20"
              >
                Explore Our Work
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary-subtle font-semibold px-7 py-3.5 rounded-xl transition-colors duration-200"
              >
                Join GAPHTO
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                <strong className="text-foreground/80">500+</strong> Members
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                <strong className="text-foreground/80">40+</strong> Years Active
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                <strong className="text-foreground/80">16</strong> Regions
              </span>
            </motion.div>
          </div>

          {/* ── Right panel: latest news carousel ───────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.35 }}
            className="flex-45 w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">

              {/* Panel header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/50">
                <div>
                  <h2 className="text-sm font-bold text-foreground">Latest News</h2>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                    Stay informed with the latest from GAPHTO
                  </p>
                </div>
                <Link
                  href="/news"
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 shrink-0"
                >
                  View All <span>→</span>
                </Link>
              </div>

              {/* Tab thumbnails + content */}
              <div className="flex flex-row gap-0">

                {/* Thumbnail tab sidebar */}
                <div className="flex flex-col gap-0 border-r border-border/50 shrink-0">
                  {heroNews.map((post, i) => {
                    const imgSrc = postImageSrc(post)
                    const isActive = activeIndex === i
                    return (
                      <button
                        key={post.slug}
                        onClick={() => setActiveIndex(i)}
                        className={`relative w-18 h-20 overflow-hidden cursor-pointer transition-all duration-200 ${
                          isActive ? 'opacity-100' : 'opacity-50 hover:opacity-80'
                        }`}
                        aria-label={decodeEntities(post.title)}
                      >
                        <Image
                          src={imgSrc}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="72px"
                        />
                        {/* Active indicator bar */}
                        {isActive && (
                          <div className="absolute inset-0 border-l-3 border-primary pointer-events-none" />
                        )}
                        {/* Progress bar */}
                        {isActive && (
                          <motion.div
                            key={`prog-${activeIndex}`}
                            className="absolute bottom-0 left-0 h-0.5 bg-primary"
                            initial={{ width: '0%' }}
                            animate={{ width: isHovered ? '0%' : '100%' }}
                            transition={{ duration: 5, ease: 'linear' }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Content area */}
                <div className="flex-1 min-w-0 p-4 min-h-60">
                  <AnimatePresence mode="wait">
                    {active && catCfg && (
                      <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="flex flex-col gap-2.5 h-full"
                      >
                        {/* Category + date */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${catCfg.badge}`}>
                            {catCfg.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70">
                            {formatDate(active.date)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
                          {decodeEntities(active.title)}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4 flex-1">
                          {cleanExcerpt(active.excerpt)}
                        </p>

                        {/* Read More */}
                        <Link
                          href={`/news/${active.slug}`}
                          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors self-start"
                        >
                          Read More →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* Upcoming event footer */}
              {eventTitle && (
                <div className="flex items-center gap-2 px-5 py-3 border-t border-border/50 bg-amber-50/50 dark:bg-amber-950/20 min-w-0">
                  <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-[11px] text-muted-foreground/70 font-medium shrink-0">Next event:</span>
                  <Link
                    href="/events"
                    className="text-[11px] font-semibold text-foreground/80 hover:text-primary transition-colors truncate"
                  >
                    {eventTitle}
                  </Link>
                </div>
              )}

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
