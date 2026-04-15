'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Users, Calendar, MapPin } from 'lucide-react'

interface Props {
  heroTitle?: string
  heroSubtitle?: string
  heroLabel?: string
  heroImage?: string
  isLoggedIn?: boolean
}

export function HeroSplit({ heroTitle, heroSubtitle, heroLabel, heroImage, isLoggedIn }: Props) {
  return (
    <section className="flex flex-col lg:flex-row min-h-screen bg-background overflow-hidden">

      {/* ── Left column ───────────────────────────────────────── */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        className="flex-none lg:w-3/5 flex flex-col justify-center gap-6 px-8 md:px-12 lg:px-16 py-20 lg:py-0"
      >
        {/* Badge */}
        <span className="inline-flex items-center gap-2 bg-primary-subtle text-primary text-sm font-medium px-4 py-1.5 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {heroLabel || (process.env.NEXT_PUBLIC_SITE_NAME ?? 'My CMS')}
        </span>

        {/* Headline */}
        <h1 className="text-4xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.05]">
          {heroTitle || 'Welcome to Our Platform'}
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
          {heroSubtitle || 'Connecting professionals and communities through shared purpose.'}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/about"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-primary/30"
          >
            Explore Our Work
          </Link>
          <Link
            href={isLoggedIn ? '/member-centre' : '/login'}
            className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary/5 font-semibold px-7 py-3.5 rounded-xl transition-colors duration-200"
          >
            {isLoggedIn ? 'Member Portal' : 'Member Login'}
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            <strong className="text-foreground">500+</strong> Members
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            <strong className="text-foreground">40+</strong> Years Active
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            <strong className="text-foreground">Local</strong> Presence
          </span>
        </div>
      </motion.div>

      {/* ── Right column ──────────────────────────────────────── */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: 'easeOut', delay: 0.15 }}
        className="flex-none lg:w-2/5 relative min-h-64 lg:min-h-screen ring-4 ring-primary/20"
      >
        {heroImage ? (
          <Image
            src={heroImage}
            alt="Hero visual"
            fill
            className="object-cover"
            priority
          />
        ) : (
          /* Gradient panel with animated shape */
          <div className="absolute inset-0 bg-linear-to-br from-primary via-primary-hover to-primary-deep flex items-center justify-center overflow-hidden">
            {/* Decorative angled overlay */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle, oklch(from var(--primary) l c h / 0.3) 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />
            {/* Pulsing circle */}
            <motion.div
              className="w-64 h-64 rounded-full bg-white/10 blur-2xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            />
            {/* Second inner circle */}
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-white/20"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.5 }}
            />
          </div>
        )}
      </motion.div>

    </section>
  )
}
