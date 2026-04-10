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
  className?: string
}

export function InnerPageHero({
  title,
  subtitle,
  label,
  breadcrumb,
  heroImage,
  centered = true,
  className,
}: InnerPageHeroProps) {
  const hasImage = !!heroImage
  const alignClass = centered ? 'text-center items-center' : 'text-left items-start'

  return (
    <section
      className={cn(
        'relative overflow-hidden flex items-center min-h-[320px] md:min-h-[400px]',
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
