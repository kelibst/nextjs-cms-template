'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { HeroContent } from '@/lib/blocks'

interface HeroBlockEditorProps {
  blockId: string
  initialContent: HeroContent
  onSave: (content: HeroContent) => Promise<void>
}

export function HeroBlockEditor({ blockId: _blockId, initialContent, onSave }: HeroBlockEditorProps) {
  const [title, setTitle] = useState(initialContent.title ?? '')
  const [subtitle, setSubtitle] = useState(initialContent.subtitle ?? '')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      try {
        await onSave({ title, subtitle })
        toast.success('Block saved')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save block')
      }
    })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Page Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter page title"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Subtitle / Tagline</label>
        <Textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Enter subtitle or tagline"
          rows={3}
        />
      </div>
      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </Button>
    </div>
  )
}
