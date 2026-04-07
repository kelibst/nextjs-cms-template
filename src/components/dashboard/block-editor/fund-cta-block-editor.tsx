'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { FundCtaContent } from '@/lib/blocks'

interface FundCtaBlockEditorProps {
  blockId: string
  initialContent: FundCtaContent
  onSave: (content: FundCtaContent) => Promise<void>
}

export function FundCtaBlockEditor({ blockId: _blockId, initialContent, onSave }: FundCtaBlockEditorProps) {
  const [heading, setHeading] = useState(initialContent.heading ?? '')
  const [subtitle, setSubtitle] = useState(initialContent.subtitle ?? '')
  const [buttonText, setButtonText] = useState(initialContent.buttonText ?? '')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      try {
        await onSave({ heading, subtitle, buttonText })
        toast.success('Block saved')
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
          placeholder="Enter CTA heading"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Subtitle</label>
        <Textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Enter subtitle text"
          rows={3}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Button Text</label>
        <Input
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          placeholder="e.g. Donate Now"
        />
      </div>
      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </Button>
    </div>
  )
}
