'use client'

import { useState, useEffect, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { getGalleryAlbumsSummary } from '@/app/actions/gallery'
import type { GalleryTeaserContent } from '@/lib/blocks'
import { toast } from 'sonner'

interface Props {
  blockId: string
  initialContent: GalleryTeaserContent
  onSave: (content: GalleryTeaserContent) => Promise<void>
}

type AlbumOption = { id: string; title: string; slug: string }

export function GalleryTeaserBlockEditor({ blockId: _blockId, initialContent, onSave }: Props) {
  const [heading, setHeading] = useState(initialContent.heading ?? '')
  const [count, setCount] = useState(initialContent.count ?? 6)
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(
    initialContent.selectedAlbumSlugs ?? []
  )
  const [albums, setAlbums] = useState<AlbumOption[]>([])
  const [loadingAlbums, setLoadingAlbums] = useState(true)
  const [albumError, setAlbumError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    setLoadingAlbums(true)
    setAlbumError(null)
    getGalleryAlbumsSummary()
      .then((data) => {
        if (!cancelled) {
          setAlbums(data)
          setLoadingAlbums(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAlbumError('Failed to load albums')
          setLoadingAlbums(false)
        }
      })
    return () => { cancelled = true }
  }, [])

  function toggleSlug(slug: string, checked: boolean) {
    setSelectedSlugs((prev) =>
      checked ? [...prev, slug] : prev.filter((s) => s !== slug)
    )
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await onSave({ heading, count, selectedAlbumSlugs: selectedSlugs })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save block')
      }
    })
  }

  return (
    <div className="p-4 space-y-4">
      {/* Heading */}
      <div className="space-y-1">
        <Label>Heading</Label>
        <Input
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="e.g. Gallery"
        />
      </div>

      {/* Max Photos */}
      <div className="space-y-1">
        <Label>Max Photos to Show</Label>
        <Input
          type="number"
          min={3}
          max={24}
          step={1}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        />
      </div>

      {/* Album Selection */}
      <div className="space-y-1">
        <p className="text-sm font-medium">Featured Albums</p>
        <p className="text-xs text-muted-foreground mb-2">
          Leave all unchecked to show photos from all albums.
        </p>
        {loadingAlbums ? (
          <p className="text-sm text-muted-foreground py-2">Loading albums...</p>
        ) : albumError ? (
          <p className="text-sm text-destructive py-2">{albumError}</p>
        ) : albums.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No albums found.</p>
        ) : (
          <div className="max-h-52 overflow-y-auto border rounded-md p-2 space-y-1">
            {albums.map((album) => (
              <div key={album.id} className="flex items-center gap-2">
                <Checkbox
                  id={album.id}
                  checked={selectedSlugs.includes(album.slug)}
                  onCheckedChange={(checked) => toggleSlug(album.slug, !!checked)}
                />
                <label htmlFor={album.id} className="text-sm cursor-pointer">
                  {album.title}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </Button>
    </div>
  )
}
