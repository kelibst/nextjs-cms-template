'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, Calendar, MapPin } from 'lucide-react'

interface Props {
  heroTitle?: string
  heroSubtitle?: string
  heroLabel?: string
  isLoggedIn?: boolean
}

export function HeroCentered({ heroTitle, heroSubtitle, heroLabel, isLoggedIn }: Props) {
  const title = heroTitle || 'We are the backbone of Public Health in Ghana'
  const words = title.split(' ')

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-linear-to-br from-primary-deep via-primary/90 to-primary/60">
      {/* Dot-grid overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, oklch(from var(--primary) l c h / 0.2) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Floating orb — top left */}
      <motion.div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"
        animate={{ y: [0, -20, 0], opacity: [0.6, 0.9, 0.6], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
      />

      {/* Floating orb — bottom right */}
      <motion.div
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-primary-muted/20 blur-3xl pointer-events-none"
        animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5], scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 1.5 }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 lg:px-12 py-24 flex flex-col items-center text-center gap-6">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full border border-white/30">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {heroLabel || "Ghana's Public Health Association"}
          </span>
        </motion.div>

        {/* Headline — staggered word animation */}
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight [text-shadow:0_2px_20px_rgba(0,0,0,0.35)]"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
          }}
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.25em]"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.5 }}
          className="text-lg text-white/80 max-w-xl leading-relaxed"
        >
          {heroSubtitle || 'Uniting Disease Control, Health Information, and Nutrition professionals to build a healthier Ghana.'}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.65 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link
            href="/about"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-primary/40 hover:shadow-primary/60"
          >
            Explore Our Work
          </Link>
          <Link
            href={isLoggedIn ? '/member-centre' : '/login'}
            className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white hover:bg-white/15 font-semibold px-7 py-3.5 rounded-xl transition-colors duration-200"
          >
            {isLoggedIn ? 'Member Portal' : 'Member Login'}
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/65"
        >
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            <strong className="text-white/90">500+</strong> Members
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            <strong className="text-white/90">40+</strong> Years Active
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            <strong className="text-white/90">16</strong> Regions
          </span>
        </motion.div>

      </div>
    </section>
  )
}
