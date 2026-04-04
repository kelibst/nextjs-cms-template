import { db } from '@/lib/db'
import { galleryAlbums, galleryImages } from '../../../../../drizzle/schema'
import { eq, count } from 'drizzle-orm'
import { desc } from 'drizzle-orm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Images } from 'lucide-react'
import { AlbumDeleteButton } from '@/components/dashboard/album-delete-button'

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const albums = await db.select().from(galleryAlbums).orderBy(desc(galleryAlbums.createdAt))

  const imageCounts = await db
    .select({ albumId: galleryImages.albumId, count: count() })
    .from(galleryImages)
    .groupBy(galleryImages.albumId)

  const countMap = Object.fromEntries(imageCounts.map((r) => [r.albumId, r.count]))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gallery</h1>
          <p className="text-sm text-muted-foreground">{albums.length} albums</p>
        </div>
        <Link href="/dashboard/gallery/new">
          <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground gap-1.5">
            <Plus className="w-4 h-4" /> New Album
          </Button>
        </Link>
      </div>

      {albums.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground/70">No albums yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {albums.map((album) => (
            <div key={album.id} className="bg-card rounded-xl border border-border overflow-hidden group">
              <div className="h-36 bg-muted relative overflow-hidden">
                {album.coverImage ? (
                  <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Images className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground truncate">{album.title}</h3>
                <p className="text-sm text-muted-foreground/70 mt-0.5">
                  {countMap[album.id] ?? 0} images
                  {album.eventDate && ` · ${new Date(album.eventDate).toLocaleDateString()}`}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Link href={`/dashboard/gallery/${album.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Pencil className="w-3.5 h-3.5" /> Manage
                    </Button>
                  </Link>
                  <AlbumDeleteButton id={album.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
