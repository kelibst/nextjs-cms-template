'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, BarChart3, Apple } from 'lucide-react'
import { type PracticeArea } from '@/lib/data'

interface Props {
  areas: PracticeArea[]
  heading?: string
}

const icons: Record<string, React.ElementType> = {
  'disease-control-prevention': Shield,
  'health-information-management': BarChart3,
  'nutrition': Apple,
}

function stripHtml(html: string, maxLen = 160) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLen)
}

export function PracticeAreas({ areas, heading = 'Our Areas of Practice' }: Props) {
  return (
    <section className="py-16 bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground">{heading}</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            GAPHTO members serve Ghana across three core public health disciplines
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {areas.map((area, i) => {
            const Icon = icons[area.slug] ?? Shield
            return (
              <motion.div
                key={area.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="group relative bg-card rounded-xl p-6 h-full flex flex-col gap-4 shadow-sm border border-transparent hover:border-primary/50 hover:shadow-md transition-all duration-300">
                  {/* Accent border animation */}
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-b-xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                  <div className="size-12 rounded-lg bg-primary-subtle text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="size-6" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {area.title.replace(/&#038;/g, '&').replace(/&amp;/g, '&')}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {stripHtml(area.content)}...
                    </p>
                  </div>

                  <Link
                    href={`/practice-areas/${area.slug}`}
                    className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 mt-auto"
                  >
                    Learn More <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
