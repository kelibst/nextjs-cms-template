'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { type GalleryAlbum } from '@/lib/data'

interface Props {
  albums: GalleryAlbum[]
  heading?: string
  count?: number
  selectedAlbumSlugs?: string[]
}

interface GalleryItem {
  src: string
  caption: string | null
  albumTitle: string
  albumSlug: string
}

function collectImages(albums: GalleryAlbum[], maxCount: number, selectedAlbumSlugs?: string[]): GalleryItem[] {
  const filteredAlbums = (selectedAlbumSlugs && selectedAlbumSlugs.length > 0)
    ? albums.filter(a => selectedAlbumSlugs.includes(a.albumSlug))
    : albums
  const items: GalleryItem[] = []
  for (const album of filteredAlbums) {
    for (const img of album.images) {
      if (items.length >= maxCount) break
      items.push({
        src: img.localPath ? `/images/${img.localPath}` : '/images/placeholder.jpg',
        caption: img.caption,
        albumTitle: album.albumTitle,
        albumSlug: album.albumSlug,
      })
    }
    if (items.length >= maxCount) break
  }
  return items
}

export function GalleryTeaser({ albums, heading = 'Gallery', count, selectedAlbumSlugs }: Props) {
  const images = collectImages(albums, count ?? 6, selectedAlbumSlugs)

  return (
    <section className="py-16 bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl font-bold text-foreground">{heading}</h2>
            <p className="text-muted-foreground mt-1">Moments from our events and conferences</p>
          </div>
          <Link
            href="/gallery"
            className="text-primary font-medium hover:text-primary/80 transition-colors whitespace-nowrap flex items-center gap-1"
          >
            View Full Gallery <span aria-hidden="true">&rarr;</span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="group relative overflow-hidden rounded-lg aspect-4/3 bg-muted"
            >
              <Image
                src={img.src}
                alt={img.caption ?? img.albumTitle}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-end p-3">
                <p className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 line-clamp-2">
                  {img.caption ?? img.albumTitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
