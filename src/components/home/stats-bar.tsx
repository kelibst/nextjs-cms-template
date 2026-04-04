'use client'

import { useRef } from 'react'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface Stat {
  value: number
  suffix: string
  label: string
}

const stats: Stat[] = [
  { value: 500, suffix: '+', label: 'Members Nationwide' },
  { value: 42, suffix: '+', label: 'Years Active' },
  { value: 3, suffix: '', label: 'Practice Areas' },
  { value: 16, suffix: '', label: 'Regions Covered' },
]

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

export function StatsBar() {
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
