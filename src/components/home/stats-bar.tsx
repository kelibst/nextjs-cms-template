'use client'

import { useRef } from 'react'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface Stat {
  value: number
  suffix: string
  label: string
}

interface Props {
  items?: { count: string; suffix: string; label: string }[]
  membersCount?: string
  membersLabel?: string
  journalsCount?: string
  journalsLabel?: string
  eventsCount?: string
  eventsLabel?: string
  yearsCount?: string
  yearsLabel?: string
}

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { duration: 1500, bounce: 0 })
  const display = useTransform(spring, (v) => Math.round(v).toString())

  if (inView) {
    motionValue.set(value)
  }

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  )
}

function parseStatValue(raw: string): { value: number; suffix: string } {
  const trimmed = raw.trim()
  const match = trimmed.match(/^(\d+)(.*)$/)
  if (match) {
    return { value: parseInt(match[1], 10), suffix: match[2] }
  }
  return { value: 0, suffix: trimmed }
}

export function StatsBar({
  items,
  membersCount = '500+',
  membersLabel = 'Members Nationwide',
  journalsCount = '42+',
  journalsLabel = 'Years Active',
  eventsCount = '3',
  eventsLabel = 'Practice Areas',
  yearsCount = '16',
  yearsLabel = 'Regions Covered',
}: Props) {
  const stats: Stat[] = (items && items.length > 0)
    ? items.map(item => {
        const { value } = parseStatValue(item.count)
        return { value, suffix: item.suffix, label: item.label }
      })
    : [
        { ...parseStatValue(membersCount), label: membersLabel },
        { ...parseStatValue(journalsCount), label: journalsLabel },
        { ...parseStatValue(eventsCount), label: eventsLabel },
        { ...parseStatValue(yearsCount), label: yearsLabel },
      ]

  return (
    <section className="bg-primary-hover text-primary-foreground py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-primary-foreground mb-1">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-primary-foreground/80 uppercase tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
