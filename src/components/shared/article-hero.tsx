'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface ArticleHeroProps {
  title: string
  imageSrc: string | null
  category: string
  categoryLabel: string
  categoryColor: string
  date: string
  author?: string
  backHref: string
  backLabel: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function ArticleHero({
  title,
  imageSrc,
  category,
  categoryLabel,
  categoryColor,
  date,
  author,
  backHref,
  backLabel,
}: ArticleHeroProps) {
  if (!imageSrc) {
    // Fallback: gradient hero without image
    return (
      <div className="relative overflow-hidden bg-linear-to-br from-primary-deep via-primary-hover to-primary min-h-[280px] md:min-h-[360px] flex items-end">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,255,255,0.07)_0%,transparent_70%)]" />
        </div>
        {/* Back button */}
        <Link
          href={backHref}
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/50 transition-colors z-10"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
          {backLabel}
        </Link>
        <div className="relative z-10 w-full px-6 md:px-10 pb-10 pt-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${categoryColor}`}>
                {categoryLabel}
              </span>
              <time dateTime={date} className="text-sm text-primary-foreground/70">{formatDate(date)}</time>
              {author && <span className="text-sm text-primary-foreground/70">By {author}</span>}
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold text-white leading-tight"
            >
              {title}
            </motion.h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-80 md:h-[480px] w-full overflow-hidden bg-primary-deep">
      {/* Featured image */}
      <Image
        src={imageSrc}
        alt={title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Gradient overlay — bottom-heavy */}
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/10" />

      {/* Back button */}
      <Link
        href={backHref}
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/50 transition-colors z-10"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
        </svg>
        {backLabel}
      </Link>

      {/* Overlaid content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10">
        <div className="mx-auto max-w-3xl">
          {/* Category + date + author */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${categoryColor}`}>
              {categoryLabel}
            </span>
            <time dateTime={date} className="text-sm text-white/75">{formatDate(date)}</time>
            {author && <span className="text-sm text-white/75">By {author}</span>}
          </div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold text-white leading-tight"
          >
            {title}
          </motion.h1>
        </div>
      </div>
    </div>
  )
}
