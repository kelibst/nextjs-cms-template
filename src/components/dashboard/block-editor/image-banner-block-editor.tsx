'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ImageField } from '@/components/dashboard/media-picker-modal'

interface ImageBannerContent {
  imageUrl: string
  alt: string
  caption: string
}

interface ImageBannerBlockEditorProps {
  blockId: string
  initialContent: ImageBannerContent
  onSave: (content: ImageBannerContent) => Promise<void>
}

export function ImageBannerBlockEditor({ blockId: _blockId, initialContent, onSave }: ImageBannerBlockEditorProps) {
  const [imageUrl, setImageUrl] = useState(initialContent.imageUrl ?? '')
  const [alt, setAlt] = useState(initialContent.alt ?? '')
  const [caption, setCaption] = useState(initialContent.caption ?? '')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      try {
        await onSave({ imageUrl, alt, caption })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save block')
      }
    })
  }

  return (
    <div className="p-4 space-y-4">
      <ImageField
        label="Image"
        value={imageUrl}
        onChange={setImageUrl}
        accept="image"
        pickerTitle="Choose Banner Image"
      />
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Alt Text</label>
        <Input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Describe the image for accessibility"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Caption (optional)</label>
        <Input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Image caption"
        />
      </div>
      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </Button>
    </div>
  )
}
