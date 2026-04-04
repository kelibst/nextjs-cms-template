'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface Props {
  pdfUrl?: string | null
}

export function FundCta({ pdfUrl }: Props) {
  return (
    <section className="relative py-16 overflow-hidden bg-primary">
      {/* Subtle animated background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              GAPHTO Welfare Fund
            </h2>
            <p className="text-primary-foreground/80 mt-3 text-lg max-w-2xl mx-auto leading-relaxed">
              Supporting our members through financial assistance, welfare loans, and mutual aid.
              The GAPHTO Welfare Fund exists to strengthen the well-being of every member.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary-deep hover:bg-primary-subtle border-0 h-11 px-6 font-semibold"
            >
              <Link href="/fund">Learn More</Link>
            </Button>
            {pdfUrl && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 h-11 px-6 font-semibold"
              >
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  View Fund Document
                </a>
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 h-11 px-6 font-semibold"
            >
              <Link href="/fund/calculator">Loan Calculator</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
