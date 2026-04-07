'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import type { StatsBarContent } from '@/lib/blocks'

interface StatsBarBlockEditorProps {
  blockId: string
  initialContent: StatsBarContent
  onSave: (content: StatsBarContent) => Promise<void>
}

export function StatsBarBlockEditor({ blockId: _blockId, initialContent, onSave }: StatsBarBlockEditorProps) {
  const [items, setItems] = useState(initialContent.items ?? [])
  const [isPending, startTransition] = useTransition()

  function updateItem(index: number, field: 'count' | 'suffix' | 'label', value: string) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  function addItem() {
    setItems((prev) => [...prev, { count: '', suffix: '', label: '' }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await onSave({ items })
        toast.success('Block saved')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save block')
      }
    })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={item.count}
              onChange={(e) => updateItem(i, 'count', e.target.value)}
              placeholder="Count"
              className="w-24"
            />
            <Input
              value={item.suffix}
              onChange={(e) => updateItem(i, 'suffix', e.target.value)}
              placeholder="Suffix"
              className="w-20"
            />
            <Input
              value={item.label}
              onChange={(e) => updateItem(i, 'label', e.target.value)}
              placeholder="Label"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeItem(i)}
              className="shrink-0"
              aria-label="Remove stat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addItem}>
          Add Stat
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
