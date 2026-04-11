'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface InnerPageHeroProps {
  title: string
  subtitle?: string
  label?: string
  breadcrumb?: BreadcrumbItem[]
  heroImage?: string
  centered?: boolean
  template?: string   // 'split' → two-column layout; anything else → banner
  className?: string
}

export function InnerPageHero({
  title,
  subtitle,
  label,
  breadcrumb,
  heroImage,
  centered = true,
  template,
  className,
}: InnerPageHeroProps) {
  // ── Split template: text left, image (or gradient) right ──────────────────
  if (template === 'split') {
    return (
      <section className={cn('flex flex-col lg:flex-row overflow-hidden min-h-100 md:min-h-120', className)}>
        {/* Left: text content on gradient */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex-none lg:w-3/5 bg-linear-to-br from-primary-deep via-primary-hover to-primary flex flex-col justify-center gap-5 px-8 md:px-12 lg:px-16 py-16 lg:py-20 relative overflow-hidden"
        >
          {/* Subtle dot grid */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
          />
          {/* Corner glow */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4">
            {/* Breadcrumb */}
            {breadcrumb && breadcrumb.length > 0 && (
              <nav className="flex items-center gap-2 text-sm text-white/60 flex-wrap">
                {breadcrumb.map((item, index) => (
                  <span key={index} className="flex items-center gap-2">
                    {index > 0 && <span className="text-white/30">/</span>}
                    {item.href ? (
                      <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
                    ) : (
                      <span className="text-white/80">{item.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}

            {/* Label badge */}
            {label && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
                  {label}
                </span>
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
            >
              {title}
            </motion.h1>

            {/* Subtitle */}
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-lg text-base text-white/75 leading-relaxed"
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Right: image or animated gradient panel */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.12 }}
          className="flex-none lg:w-2/5 relative min-h-64 lg:min-h-full ring-4 ring-primary/20"
        >
          {heroImage ? (
            <Image src={heroImage} alt="" fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 40vw" />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-primary via-primary-hover to-primary-deep flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: `radial-gradient(circle, oklch(from var(--primary) l c h / 0.3) 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
              />
              <motion.div
                className="w-56 h-56 rounded-full bg-white/10 blur-2xl"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              />
            </div>
          )}
        </motion.div>
      </section>
    )
  }

  // ── Default banner template ────────────────────────────────────────────────
  const hasImage = !!heroImage
  const alignClass = centered ? 'text-center items-center' : 'text-left items-start'

  return (
    <section
      className={cn(
        'relative overflow-hidden flex items-center min-h-80 md:min-h-100',
        !hasImage && 'bg-linear-to-br from-primary-deep via-primary-hover to-primary',
        className
      )}
    >
      {/* Background image */}
      {hasImage && (
        <>
          <Image
            src={heroImage}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/60" />
        </>
      )}

      {/* Gradient decorations (only when no image) */}
      {!hasImage && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Central radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,255,255,0.07)_0%,transparent_70%)]" />
          {/* Corner blobs */}
          <div className="absolute -left-16 -top-16 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <div className="absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-primary/15 blur-3xl animate-pulse [animation-delay:1.2s]" />
          {/* Grid overlay */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="inner-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#inner-grid)" />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className={cn('flex flex-col gap-4', alignClass)}>
          {/* Breadcrumb */}
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex items-center gap-2 text-sm text-primary-foreground/70 flex-wrap">
              {breadcrumb.map((item, index) => (
                <span key={index} className="flex items-center gap-2">
                  {index > 0 && <span className="text-primary-foreground/40">/</span>}
                  {item.href ? (
                    <Link href={item.href} className="hover:text-primary-foreground transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-primary-foreground/90">{item.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          {/* Label badge */}
          {label && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="inline-flex items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary-foreground/80 backdrop-blur-sm">
                {label}
              </span>
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: label ? 0.1 : 0 }}
            className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl lg:text-6xl"
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: label ? 0.2 : 0.1 }}
              className="max-w-2xl text-lg text-primary-foreground/80 leading-relaxed"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  )
}
