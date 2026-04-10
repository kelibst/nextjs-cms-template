'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import type { ObjectivesContent } from '@/lib/blocks'

interface ObjectivesBlockEditorProps {
  blockId: string
  initialContent: ObjectivesContent
  onSave: (content: ObjectivesContent) => Promise<void>
}

export function ObjectivesBlockEditor({ blockId: _blockId, initialContent, onSave }: ObjectivesBlockEditorProps) {
  const [heading, setHeading] = useState(initialContent.heading ?? '')
  const [items, setItems] = useState<string[]>(initialContent.items ?? [])
  const [isPending, startTransition] = useTransition()

  function updateItem(index: number, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  function addItem() {
    setItems((prev) => [...prev, ''])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await onSave({ heading, items })
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
          placeholder="Enter heading"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Objectives</label>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={`Objective ${i + 1}`}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeItem(i)}
              className="shrink-0"
              aria-label="Remove objective"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addItem}>
          Add Objective
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
