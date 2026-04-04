'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { type About } from '@/lib/data'

interface Props {
  about: About
  galleryImageSrc?: string
}

export function AboutSection({ about, galleryImageSrc }: Props) {
  const imgSrc = galleryImageSrc || '/images/placeholder.jpg'

  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                About GAPHTO
              </span>
              <h2 className="text-3xl font-bold text-foreground mt-2 leading-tight">
                Building a Healthier Ghana Together
              </h2>
            </div>

            {about.mission && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Our Mission
                </h3>
                <p className="text-foreground/80 leading-relaxed">{about.mission}</p>
              </div>
            )}

            {about.vision && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Our Vision
                </h3>
                <p className="text-foreground/80 leading-relaxed">{about.vision}</p>
              </div>
            )}

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="inline-flex items-center gap-2 bg-primary-subtle text-primary/90 border border-primary-subtle rounded-full px-4 py-1.5 text-sm font-medium">
                <span className="text-primary">📅</span> Founded 1984
              </span>
              <span className="inline-flex items-center gap-2 bg-primary-subtle text-primary/90 border border-primary-subtle rounded-full px-4 py-1.5 text-sm font-medium">
                <span className="text-primary">🌍</span> Nationwide Presence
              </span>
            </div>

            <Link
              href="/about"
              className="inline-flex items-center gap-1 text-primary font-medium hover:text-primary/80 transition-colors"
            >
              Learn More About Us <span aria-hidden="true">&rarr;</span>
            </Link>
          </motion.div>

          {/* Right: Image with offset block */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Offset color block */}
            <div className="absolute -bottom-4 -right-4 w-full h-full rounded-xl bg-primary-muted z-0" />
            <div className="relative z-10 rounded-xl overflow-hidden aspect-4/3">
              <Image
                src={imgSrc}
                alt="GAPHTO events and activities"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
