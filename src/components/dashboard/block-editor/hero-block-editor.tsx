'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { HeroContent } from '@/lib/blocks'
import { ImageField } from '@/components/dashboard/media-picker-modal'

interface HeroBlockEditorProps {
  blockId: string
  initialContent: HeroContent
  onSave: (content: HeroContent) => Promise<void>
}

const TEMPLATES = [
  { value: 'carousel', icon: '📰', name: 'News Carousel', desc: 'Gradient background with live news panel on the right' },
  { value: 'centered', icon: '⬛', name: 'Centered', desc: 'Full-screen gradient with centered animated headline' },
  { value: 'split', icon: '◧', name: 'Split', desc: 'Text on left, image or visual panel on right' },
  { value: 'bold', icon: '𝐁', name: 'Bold Statement', desc: 'Dark background with oversized display typography' },
] as const

type TemplateValue = typeof TEMPLATES[number]['value']

export function HeroBlockEditor({ blockId: _blockId, initialContent, onSave }: HeroBlockEditorProps) {
  const [template, setTemplate] = useState<TemplateValue>(initialContent.template ?? 'carousel')
  const [title, setTitle] = useState(initialContent.title ?? '')
  const [subtitle, setSubtitle] = useState(initialContent.subtitle ?? '')
  const [label, setLabel] = useState(initialContent.label ?? '')
  const [heroImage, setHeroImage] = useState(initialContent.heroImage ?? '')
  const [centered, setCentered] = useState(initialContent.centered !== false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      try {
        await onSave({ title, subtitle, label, heroImage: heroImage || undefined, centered, template })
        toast.success('Hero saved')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save block')
      }
    })
  }

  return (
    <div className="p-4 space-y-4">
      {/* Template picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Template</label>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map(({ value, icon, name, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTemplate(value)}
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all',
                template === value
                  ? 'border-primary bg-primary-subtle'
                  : 'border-border hover:border-primary/40'
              )}
            >
              <span className="text-2xl leading-none block">{icon}</span>
              <span className="font-semibold text-sm text-foreground block mt-1">{name}</span>
              <span className="text-xs text-muted-foreground mt-1 block">{desc}</span>
            </button>
          ))}
        </div>
      </div>

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
      <ImageField
        label="Background Image"
        value={heroImage}
        onChange={setHeroImage}
        accept="image"
        pickerTitle="Choose Hero Background Image"
      />
      <p className="text-xs text-muted-foreground -mt-2">
        Optional. When set, the hero displays a full-bleed image with a dark overlay.
      </p>

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
