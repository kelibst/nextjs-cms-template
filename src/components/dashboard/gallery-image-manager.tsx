'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiRequest } from '@/lib/api'
import { addImageToAlbum, updateImageCaption, updateImageOrder, deleteGalleryImage } from '@/app/actions/gallery'
import type { GalleryImage } from '../../../drizzle/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Upload, ChevronUp, ChevronDown, ImageIcon } from 'lucide-react'
import { MediaPickerModal } from '@/components/dashboard/media-picker-modal'
import { getMediaUrl } from '@/lib/media-url'

interface GalleryImageManagerProps {
  albumId: string
  images: GalleryImage[]
}

export function GalleryImageManager({ albumId, images: initialImages }: GalleryImageManagerProps) {
  const [images, setImages] = useState(initialImages)
  const [editingCaption, setEditingCaption] = useState<string | null>(null)
  const [captionValue, setCaptionValue] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)

  const imagesRef = useRef<typeof images>([])
  useEffect(() => { imagesRef.current = images }, [images])

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('file', file)
      const { url } = await apiRequest<{ url: string }>('/api/upload', { method: 'POST', body: fd })
      return addImageToAlbum(albumId, { url, caption: '', sortOrder: imagesRef.current.length })
    },
    onSuccess: (newImage) => setImages(prev => [...prev, newImage]),
    onError: () => toast.error('Failed to upload image'),
  })

  const captionMutation = useMutation({
    mutationFn: ({ imageId, caption }: { imageId: string; caption: string }) =>
      updateImageCaption(albumId, imageId, caption),
    onSuccess: (_, { imageId, caption }) => {
      setImages(prev => prev.map(img => img.id === imageId ? { ...img, caption } : img))
      setEditingCaption(null)
      toast.success('Caption saved')
    },
    onError: () => toast.error('Failed to save caption'),
  })

  const deleteMutation = useMutation({
    mutationFn: (imageId: string) =>
      deleteGalleryImage(albumId, imageId),
    onSuccess: (_, imageId) => {
      setImages(prev => prev.filter(img => img.id !== imageId))
      toast.success('Image deleted')
    },
    onError: () => toast.error('Failed to delete image'),
  })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    for (const file of files) {
      try {
        await uploadMutation.mutateAsync(file)
      } catch {
        // error already handled by onError
      }
    }

    e.target.value = ''
  }

  const handleReorder = async (imageId: string, direction: 'up' | 'down') => {
    const idx = images.findIndex((img) => img.id === imageId)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === images.length - 1) return

    const newImages = [...images]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newImages[idx], newImages[swapIdx]] = [newImages[swapIdx], newImages[idx]]

    setImages(newImages)

    await Promise.all([
      updateImageOrder(albumId, newImages[idx].id, idx),
      updateImageOrder(albumId, newImages[swapIdx].id, swapIdx),
    ])
  }

  const handlePickerSelect = async (url: string) => {
    try {
      const newImage = await addImageToAlbum(albumId, { url, caption: '', sortOrder: imagesRef.current.length })
      setImages(prev => [...prev, newImage])
      toast.success('Image added from library')
    } catch {
      toast.error('Failed to add image')
    }
  }

  const isUploading = uploadMutation.isPending

  return (
    <div className="space-y-4">
      {/* Upload + Library picker */}
      <div className="flex flex-wrap gap-3">
        <label className={`flex items-center gap-2 w-fit px-4 py-2 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors text-sm text-muted-foreground hover:text-primary ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploading…' : 'Upload Images'}
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPickerOpen(true)}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Choose from Library
        </Button>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickerSelect}
        accept="image"
        title="Choose Image for Album"
      />

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground/70">No images yet. Upload some above.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border bg-muted/30">
              <img src={getMediaUrl(img.url)} alt={img.caption ?? img.altText ?? ''} className="w-full h-32 object-cover" />

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-between p-2">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleReorder(img.id, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded bg-white/80 hover:bg-white disabled:opacity-30"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleReorder(img.id, 'down')}
                    disabled={idx === images.length - 1}
                    className="p-1 rounded bg-white/80 hover:bg-white disabled:opacity-30"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(img.id)}
                  className="p-1 rounded bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Caption */}
              <div className="p-2">
                {editingCaption === img.id ? (
                  <div className="flex gap-1">
                    <Input
                      value={captionValue}
                      onChange={(e) => setCaptionValue(e.target.value)}
                      className="h-6 text-xs px-1"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && captionMutation.mutate({ imageId: img.id, caption: captionValue })}
                    />
                    <Button size="sm" className="h-6 px-2 text-xs bg-primary text-primary-foreground" onClick={() => captionMutation.mutate({ imageId: img.id, caption: captionValue })}>
                      ✓
                    </Button>
                  </div>
                ) : (
                  <p
                    className="text-xs text-muted-foreground truncate cursor-pointer hover:text-primary"
                    onClick={() => { setEditingCaption(img.id); setCaptionValue(img.caption ?? '') }}
                  >
                    {img.caption || <span className="text-muted-foreground/40 italic">Add caption…</span>}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
