'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createLesson, updateLesson } from '@/app/actions/learning'
import type { Lesson } from '../../../drizzle/schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TipTapLink from '@tiptap/extension-link'
import TipTapImage from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Heading2, Heading3,
  List, ListOrdered, Quote, Code,
} from 'lucide-react'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface LessonFormProps {
  courseId: string
  lesson?: Lesson
}

export function LessonForm({ courseId, lesson }: LessonFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(lesson?.title ?? '')
  const [slug, setSlug] = useState(lesson?.slug ?? '')
  const [slugEdited, setSlugEdited] = useState(!!lesson)
  const [durationMin, setDurationMin] = useState<string>(lesson?.durationMin != null ? String(lesson.durationMin) : '')
  const [sortOrder, setSortOrder] = useState<string>(lesson?.sortOrder != null ? String(lesson.sortOrder) : '0')
  const [status, setStatus] = useState<'draft' | 'published'>(lesson?.status ?? 'draft')

  const isEdit = !!lesson

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TipTapImage,
      TipTapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your lesson content here…' }),
    ],
    content: lesson?.content ?? '',
  })

  const mutation = useMutation({
    mutationFn: async () => {
      if (!editor) throw new Error('Editor not ready')
      const body = {
        title,
        slug,
        content: editor.getHTML(),
        sortOrder: parseInt(sortOrder) || 0,
        durationMin: durationMin ? parseInt(durationMin) : null,
        status,
      }
      if (isEdit) {
        return updateLesson(lesson.id, courseId, body)
      } else {
        return createLesson(courseId, body)
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Lesson updated' : 'Lesson created')
      router.push(`/dashboard/learning/${courseId}/lessons`)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    },
  })

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!slugEdited) setSlug(slugify(val))
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="space-y-1">
        <label className="text-sm font-medium">Title *</label>
        <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Lesson title" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-muted-foreground">Slug</label>
        <Input
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
          placeholder="lesson-slug"
          className="font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Status</label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Duration (minutes)</label>
          <Input
            type="number"
            min="1"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            placeholder="15"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Sort Order</label>
          <Input
            type="number"
            min="0"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      {/* Content Editor */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Content</label>
        <div className="flex flex-wrap gap-1 border border-border rounded-t-lg bg-muted/50 p-2">
          {[
            { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), title: 'Bold' },
            { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), title: 'Italic' },
            { icon: Heading2, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), title: 'H2' },
            { icon: Heading3, action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), title: 'H3' },
            { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), title: 'Bullet List' },
            { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), title: 'Ordered List' },
            { icon: Quote, action: () => editor?.chain().focus().toggleBlockquote().run(), title: 'Blockquote' },
            { icon: Code, action: () => editor?.chain().focus().toggleCodeBlock().run(), title: 'Code' },
          ].map(({ icon: Icon, action, title: toolTitle }) => (
            <button
              key={toolTitle}
              type="button"
              title={toolTitle}
              onClick={action}
              className="p-1.5 rounded hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
        <div className="border border-t-0 border-border rounded-b-lg p-4 min-h-[300px] prose prose-sm max-w-none focus-within:ring-2 focus-within:ring-primary/20">
          <EditorContent editor={editor} className="outline-none" />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !title}
        >
          {mutation.isPending ? 'Saving…' : isEdit ? 'Update Lesson' : 'Create Lesson'}
        </Button>
        <Button variant="outline" onClick={() => router.push(`/dashboard/learning/${courseId}/lessons`)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
