'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ImageField } from '@/components/dashboard/media-picker-modal'
import type { AboutPreviewContent } from '@/lib/blocks'

interface AboutPreviewBlockEditorProps {
  blockId: string
  initialContent: AboutPreviewContent
  onSave: (content: AboutPreviewContent) => Promise<void>
}

export function AboutPreviewBlockEditor({
  blockId: _blockId,
  initialContent,
  onSave,
}: AboutPreviewBlockEditorProps) {
  const [heading, setHeading] = useState(initialContent.heading ?? '')
  const [imageUrl, setImageUrl] = useState(initialContent.imageUrl ?? '')
  const [imageAlt, setImageAlt] = useState(initialContent.imageAlt ?? '')
  const [linkText, setLinkText] = useState(initialContent.linkText ?? 'Learn More About Us')
  const [linkHref, setLinkHref] = useState(initialContent.linkHref ?? '/about')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      try {
        await onSave({ heading, imageUrl, imageAlt, linkText, linkHref })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save block')
      }
    })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Heading</label>
        <Input
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="Building a Healthier Ghana Together"
        />
      </div>

      <ImageField
        label="Image"
        value={imageUrl}
        onChange={setImageUrl}
        accept="image"
        pickerTitle="Choose About Section Image"
      />
      <p className="text-xs text-muted-foreground -mt-2">
        Leave blank to auto-pick the latest gallery image.
      </p>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Image Alt Text</label>
        <Input
          value={imageAlt}
          onChange={(e) => setImageAlt(e.target.value)}
          placeholder="GAPHTO events and activities"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Link Label</label>
        <Input
          value={linkText}
          onChange={(e) => setLinkText(e.target.value)}
          placeholder="Learn More About Us"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Link Destination</label>
        <Input
          value={linkHref}
          onChange={(e) => setLinkHref(e.target.value)}
          placeholder="/about"
        />
      </div>

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </Button>
    </div>
  )
}
