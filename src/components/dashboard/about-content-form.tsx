'use client'

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { savePageContent } from '@/app/actions/content'
import {
  Bold, Italic, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Plus, Trash2,
} from 'lucide-react'

interface TimelineEntry {
  year: string
  title: string
  description: string
}

interface PracticeArea {
  title: string
  description: string
}

interface AboutContentFormProps {
  content: Record<string, string>
}

export function AboutContentForm({ content }: AboutContentFormProps) {
  const [vision, setVision] = useState(content['about.vision'] ?? '')
  const [mission, setMission] = useState(content['about.mission'] ?? '')

  const [objectives, setObjectives] = useState<string[]>(() => {
    try { return JSON.parse(content['about.objectives'] || '[]') } catch { return [] }
  })

  const [timeline, setTimeline] = useState<TimelineEntry[]>(() => {
    try { return JSON.parse(content['about.timeline'] || '[]') } catch { return [] }
  })

  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>(() => {
    try { return JSON.parse(content['about.practice_areas'] || '[]') } catch { return [] }
  })

  // Rich text editor for about.background
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write the organisation background here…' }),
    ],
    content: content['about.background'] ?? '',
  })

  const mutation = useMutation({
    mutationFn: (data: Record<string, string>) => savePageContent(data),
    onSuccess: () => toast.success('About page content saved'),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to save'),
  })

  const handleSave = () => {
    mutation.mutate({
      'about.background': editor?.getHTML() ?? '',
      'about.vision': vision,
      'about.mission': mission,
      'about.objectives': JSON.stringify(objectives),
      'about.timeline': JSON.stringify(timeline),
      'about.practice_areas': JSON.stringify(practiceAreas),
    })
  }

  // Objectives helpers
  const addObjective = () => setObjectives((prev) => [...prev, ''])
  const updateObjective = (i: number, val: string) =>
    setObjectives((prev) => prev.map((o, idx) => (idx === i ? val : o)))
  const removeObjective = (i: number) =>
    setObjectives((prev) => prev.filter((_, idx) => idx !== i))

  // Timeline helpers
  const addTimeline = () =>
    setTimeline((prev) => [...prev, { year: '', title: '', description: '' }])
  const updateTimeline = (i: number, field: keyof TimelineEntry, val: string) =>
    setTimeline((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: val } : t)))
  const removeTimeline = (i: number) =>
    setTimeline((prev) => prev.filter((_, idx) => idx !== i))

  // Practice areas helpers
  const addPracticeArea = () =>
    setPracticeAreas((prev) => [...prev, { title: '', description: '' }])
  const updatePracticeArea = (i: number, field: keyof PracticeArea, val: string) =>
    setPracticeAreas((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)))
  const removePracticeArea = (i: number) =>
    setPracticeAreas((prev) => prev.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-8">
      {/* Vision */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Vision &amp; Mission</h2>
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Vision</label>
          <Textarea
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            placeholder="Organisation vision statement…"
            rows={3}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Mission</label>
          <Textarea
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder="Organisation mission statement…"
            rows={3}
          />
        </div>
      </div>

      {/* Background — rich text */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Background</h2>
        <p className="text-xs text-muted-foreground">Rich text — supports headings, lists, bold, italic, links</p>
        {/* Toolbar */}
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
          ].map(({ icon: Icon, action, title }) => (
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

      {/* Objectives */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Objectives</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addObjective}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Objective
          </Button>
        </div>
        {objectives.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No objectives yet. Click "Add Objective" to start.</p>
        )}
        <div className="space-y-2">
          {objectives.map((obj, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={obj}
                onChange={(e) => updateObjective(i, e.target.value)}
                placeholder={`Objective ${i + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeObjective(i)}
                className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Timeline</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTimeline}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Timeline Entry
          </Button>
        </div>
        {timeline.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No timeline entries yet. Click "Add Timeline Entry" to start.</p>
        )}
        <div className="space-y-4">
          {timeline.map((entry, i) => (
            <div key={i} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Entry {i + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTimeline(i)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Year</label>
                  <Input
                    value={entry.year}
                    onChange={(e) => updateTimeline(i, 'year', e.target.value)}
                    placeholder="e.g. 2005"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-muted-foreground">Title</label>
                  <Input
                    value={entry.title}
                    onChange={(e) => updateTimeline(i, 'title', e.target.value)}
                    placeholder="Event title"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Description</label>
                <Textarea
                  value={entry.description}
                  onChange={(e) => updateTimeline(i, 'description', e.target.value)}
                  placeholder="Describe this milestone…"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practice Areas */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Practice Areas</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPracticeArea}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Practice Area
          </Button>
        </div>
        {practiceAreas.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No practice areas yet. Click "Add Practice Area" to start.</p>
        )}
        <div className="space-y-4">
          {practiceAreas.map((area, i) => (
            <div key={i} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Area {i + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePracticeArea(i)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </Button>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Title</label>
                <Input
                  value={area.title}
                  onChange={(e) => updatePracticeArea(i, 'title', e.target.value)}
                  placeholder="Practice area name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Description</label>
                <Textarea
                  value={area.description}
                  onChange={(e) => updatePracticeArea(i, 'description', e.target.value)}
                  placeholder="Brief description of this practice area…"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
          onClick={handleSave}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Saving…' : 'Save About Content'}
        </Button>
      </div>
    </div>
  )
}
