'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import type { FeaturesGridContent } from '@/lib/blocks'

interface FeaturesGridBlockEditorProps {
  blockId: string
  initialContent: FeaturesGridContent
  onSave: (content: FeaturesGridContent) => Promise<void>
}

export function FeaturesGridBlockEditor({ blockId: _blockId, initialContent, onSave }: FeaturesGridBlockEditorProps) {
  const [heading, setHeading] = useState(initialContent.heading ?? '')
  const [items, setItems] = useState(initialContent.items ?? [])
  const [isPending, startTransition] = useTransition()

  function updateItem(index: number, field: 'title' | 'description', value: string) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  function addItem() {
    setItems((prev) => [...prev, { title: '', description: '' }])
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
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Features</label>
        {items.map((item, i) => (
          <div key={i} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Item {i + 1}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeItem(i)}
                aria-label="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input
                value={item.title}
                onChange={(e) => updateItem(i, 'title', e.target.value)}
                placeholder="Feature title"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Textarea
                value={item.description}
                onChange={(e) => updateItem(i, 'description', e.target.value)}
                placeholder="Feature description"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addItem}>
          Add Feature
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
