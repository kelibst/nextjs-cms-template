'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SimpleSectionContent {
  heading: string
  count?: number
}

interface SimpleSectionBlockEditorProps {
  blockId: string
  initialContent: SimpleSectionContent
  onSave: (content: SimpleSectionContent) => Promise<void>
  showCount?: boolean
}

export function SimpleSectionBlockEditor({
  blockId: _blockId,
  initialContent,
  onSave,
  showCount = false,
}: SimpleSectionBlockEditorProps) {
  const [heading, setHeading] = useState(initialContent.heading ?? '')
  const [count, setCount] = useState(initialContent.count ?? 3)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      try {
        const content: SimpleSectionContent = { heading }
        if (showCount) content.count = count
        await onSave(content)
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
          placeholder="Enter section heading"
        />
      </div>
      {showCount && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Max items to show</label>
          <Input
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            min={1}
            max={20}
            className="w-32"
          />
        </div>
      )}
      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </Button>
    </div>
  )
}
