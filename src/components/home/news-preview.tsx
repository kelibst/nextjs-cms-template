'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { type Post } from '@/lib/data'

interface Props {
  posts: Post[]
  heading?: string
  count?: number
}

const categoryLabel: Record<string, string> = {
  'news': 'News',
  'blog': 'Blog',
  'announcement': 'Announcement',
}

const categoryColor: Record<string, string> = {
  'news': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  'blog': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  'announcement': 'bg-primary-muted text-primary/90 border-primary-muted',
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&#[0-9]+;/g, '').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, '')
}

export function NewsPreview({ posts, heading = 'Latest News', count }: Props) {
  return (
    <section className="py-16 bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl font-bold text-foreground">{heading}</h2>
            <p className="text-muted-foreground mt-1">Stay informed with the latest news</p>
          </div>
          <Link
            href="/news"
            className="text-primary font-medium hover:text-primary/80 transition-colors whitespace-nowrap flex items-center gap-1"
          >
            View All <span aria-hidden="true">&rarr;</span>
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.slice(0, count ?? 3).map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link href={`/news/${post.slug}`} className="group block h-full">
                <Card className="h-full overflow-hidden p-0 gap-0 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-primary-subtle">
                    <Image
                      src={post.featuredImage || '/images/placeholder.jpg'}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>

                  <CardContent className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${categoryColor[post.category] ?? 'bg-muted text-muted-foreground'}`}>
                        {categoryLabel[post.category] ?? post.category}
                      </span>
                      <span className="text-xs text-muted-foreground/70">{formatDate(post.date)}</span>
                    </div>

                    <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {stripHtml(post.title)}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                      {stripHtml(post.excerpt).slice(0, 160)}
                    </p>

                    <span className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 mt-auto">
                      Read More <span aria-hidden="true">&rarr;</span>
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
