'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Bold, Italic, Heading2, Heading3, List, ListOrdered } from 'lucide-react'
import type { RichTextContent } from '@/lib/blocks'

interface RichTextBlockEditorProps {
  blockId: string
  initialContent: RichTextContent
  onSave: (content: RichTextContent) => Promise<void>
}

export function RichTextBlockEditor({ blockId: _blockId, initialContent, onSave }: RichTextBlockEditorProps) {
  const [heading, setHeading] = useState(initialContent.heading ?? '')
  const [isPending, startTransition] = useTransition()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write block content here…' }),
      CharacterCount,
    ],
    content: initialContent.body ?? '',
  })

  function handleSave() {
    if (!editor) return
    startTransition(async () => {
      try {
        await onSave({ heading: heading || undefined, body: editor.getHTML() })
        toast.success('Block saved')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save block')
      }
    })
  }

  const toolbarButtons = [
    { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), title: 'Bold' },
    { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), title: 'Italic' },
    { icon: Heading2, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), title: 'H2' },
    { icon: Heading3, action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), title: 'H3' },
    { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), title: 'Bullet List' },
    { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), title: 'Ordered List' },
  ]

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Section Heading (optional)</label>
        <Input
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="Enter section heading"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Body</label>
        <div className="flex flex-wrap gap-1 border border-border rounded-t-lg bg-muted/50 p-2">
          {toolbarButtons.map(({ icon: Icon, action, title }) => (
            <button
              key={title}
              type="button"
              title={title}
              onClick={action}
              className="p-1.5 rounded hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
        <div className="border border-t-0 border-border rounded-b-lg p-4 min-h-[200px] prose prose-sm max-w-none focus-within:ring-2 focus-within:ring-primary/20">
          <EditorContent editor={editor} className="outline-none" />
        </div>
      </div>
      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </Button>
    </div>
  )
}
