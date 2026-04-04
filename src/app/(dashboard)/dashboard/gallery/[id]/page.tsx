import { db } from '@/lib/db'
import { galleryAlbums, galleryImages } from '../../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { asc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AlbumForm } from '@/components/dashboard/album-form'
import { GalleryImageManager } from '@/components/dashboard/gallery-image-manager'

export const dynamic = 'force-dynamic'

export default async function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [album] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, id)).limit(1)
  if (!album) notFound()

  const images = await db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.albumId, id))
    .orderBy(asc(galleryImages.sortOrder))

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/gallery" className="text-muted-foreground/70 hover:text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">{album.title}</h1>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Album Details</h2>
        <AlbumForm album={album} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Images</h2>
        <GalleryImageManager albumId={id} images={images} />
      </div>
    </div>
  )
}
