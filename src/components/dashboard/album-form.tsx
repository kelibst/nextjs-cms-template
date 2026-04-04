'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createAlbum, updateAlbum } from '@/app/actions/gallery'
import type { GalleryAlbum } from '../../../drizzle/schema'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface AlbumFormProps {
  album?: GalleryAlbum
}

export function AlbumForm({ album }: AlbumFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(album?.title ?? '')
  const [slug, setSlug] = useState(album?.slug ?? '')
  const [slugEdited, setSlugEdited] = useState(!!album)
  const [description, setDescription] = useState(album?.description ?? '')
  const [eventDate, setEventDate] = useState(
    album?.eventDate ? new Date(album.eventDate).toISOString().split('T')[0] : ''
  )

  const isEdit = !!album

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!slugEdited) setSlug(slugify(val))
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const body = { title, slug: slug || slugify(title), description, eventDate: eventDate || null }
      if (album) {
        return updateAlbum(album.id, body)
      } else {
        return createAlbum(body)
      }
    },
    onSuccess: (data) => {
      toast.success(isEdit ? 'Album updated' : 'Album created')
      router.push(isEdit ? `/dashboard/gallery/${album!.id}` : `/dashboard/gallery/${data.id}`)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    },
  })

  const handleSave = () => {
    if (!title) return
    mutation.mutate()
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="space-y-1">
        <label className="text-sm font-medium">Title *</label>
        <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Album title" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Slug</label>
        <Input
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
          placeholder="url-slug"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Event Date</label>
        <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
      </div>
      <div className="flex gap-3">
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground" onClick={handleSave} disabled={mutation.isPending || !title}>
          {mutation.isPending ? 'Saving…' : isEdit ? 'Update Album' : 'Create Album'}
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/gallery')}>Cancel</Button>
      </div>
    </div>
  )
}
