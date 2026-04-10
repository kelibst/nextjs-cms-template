'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import type { HeroContent } from '@/lib/blocks'

interface HeroBlockEditorProps {
  blockId: string
  initialContent: HeroContent
  onSave: (content: HeroContent) => Promise<void>
}

export function HeroBlockEditor({ blockId: _blockId, initialContent, onSave }: HeroBlockEditorProps) {
  const [title, setTitle] = useState(initialContent.title ?? '')
  const [subtitle, setSubtitle] = useState(initialContent.subtitle ?? '')
  const [label, setLabel] = useState(initialContent.label ?? '')
  const [heroImage, setHeroImage] = useState(initialContent.heroImage ?? '')
  const [centered, setCentered] = useState(initialContent.centered !== false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      try {
        await onSave({ title, subtitle, label, heroImage: heroImage || undefined, centered })
        toast.success('Hero saved')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save block')
      }
    })
  }

  return (
    <div className="p-4 space-y-4">
      {/* Title */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Page Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter page title"
        />
      </div>

      {/* Badge label */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Label Badge</label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Our Story, Stay Informed, Visual Stories"
        />
        <p className="text-xs text-muted-foreground">
          Small badge displayed above the title. Leave blank to hide.
        </p>
      </div>

      {/* Subtitle */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Subtitle / Tagline</label>
        <Textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Enter subtitle or tagline"
          rows={3}
        />
      </div>

      {/* Background image */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Background Image URL</label>
        <Input
          value={heroImage}
          onChange={(e) => setHeroImage(e.target.value)}
          placeholder="https://... or /images/..."
        />
        <p className="text-xs text-muted-foreground">
          Optional. When set, the hero displays a full-bleed image with a dark overlay.
        </p>
      </div>

      {/* Centered toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div>
          <p className="text-sm font-medium text-foreground">Centered Layout</p>
          <p className="text-xs text-muted-foreground">Center-align title and subtitle (default). Turn off for left-aligned.</p>
        </div>
        <Switch
          checked={centered}
          onCheckedChange={setCentered}
          aria-label="Toggle centered layout"
        />
      </div>

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </Button>
    </div>
  )
}
