'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowDown } from 'lucide-react'

interface Props {
  heroTitle?: string
  heroSubtitle?: string
  heroLabel?: string
  isLoggedIn?: boolean
}

export function HeroBold({ heroTitle, heroSubtitle, heroLabel, isLoggedIn }: Props) {
  const fullTitle = heroTitle || 'Welcome to Our Platform'
  const words = fullTitle.split(' ')
  const lastWord = words.pop() ?? ''
  const restWords = words.join(' ')

  return (
    <section className="bg-primary-deep min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden">

      {/* Dot-grid overlay at low opacity */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, oklch(from var(--primary) l c h / 0.15) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          opacity: 0.15,
        }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 lg:px-12 flex flex-col items-center gap-6">

        {/* Badge label */}
        {heroLabel && (
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-sm font-medium px-4 py-1.5 rounded-full border border-white/20"
          >
            {heroLabel}
          </motion.span>
        )}

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut', delay: 0.1 }}
          className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight"
        >
          {restWords && <>{restWords} </>}
          {/* Last word with animated underline */}
          <span className="relative inline-block">
            {lastWord}
            <motion.div
              className="absolute bottom-0 left-0 h-2 bg-primary-muted rounded-full w-full"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              style={{ originX: 0 }}
              transition={{ duration: 0.7, delay: 0.8, ease: 'easeOut' }}
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.4 }}
          className="text-white/60 text-lg max-w-md mt-4"
        >
          {heroSubtitle || 'Connecting professionals and communities through shared purpose.'}
        </motion.p>

        {/* Single CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.55 }}
        >
          <Link
            href={isLoggedIn ? '/member-centre' : '/about'}
            className="inline-flex items-center justify-center gap-2 bg-white text-primary-deep hover:bg-white/90 font-bold px-8 py-4 rounded-xl transition-colors duration-200"
          >
            {isLoggedIn ? 'Member Portal' : 'Learn More'}
          </Link>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="text-white/40"
        >
          <ArrowDown className="w-6 h-6" />
        </motion.div>
      </div>

    </section>
  )
}
