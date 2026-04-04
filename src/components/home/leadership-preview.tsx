'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { type LeadershipMember } from '@/lib/data'

interface Props {
  leaders: LeadershipMember[]
}

export function LeadershipPreview({ leaders }: Props) {
  const featured = leaders.slice(0, 6)

  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground">Our Leadership</h2>
          <p className="text-muted-foreground mt-2">
            The executives steering GAPHTO&apos;s mission forward
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {featured.map((leader, i) => (
            <motion.div
              key={leader.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="group flex flex-col items-center text-center gap-3"
            >
              <div className="relative w-20 h-20 transition-transform duration-300 group-hover:scale-105">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary-subtle group-hover:border-primary transition-colors duration-300">
                  <Image
                    src={`/images/${leader.localImage || 'placeholder.jpg'}`}
                    alt={leader.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">{leader.name}</p>
                <p className="text-xs text-primary mt-0.5">{leader.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-10"
        >
          <Link
            href="/leadership"
            className="text-primary font-medium hover:text-primary/80 transition-colors flex items-center gap-1 justify-center"
          >
            Meet the Full Team <span aria-hidden="true">&rarr;</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
