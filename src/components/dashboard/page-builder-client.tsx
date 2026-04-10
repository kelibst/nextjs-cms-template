'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { reorderBlocks, upsertBlock, republishPage } from '@/app/actions/blocks'
import { BlockEditorShell } from '@/components/dashboard/block-editor'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, ChevronRight, Upload } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type BlockRow = {
  id: string
  page: string
  type: string
  sortOrder: number
  content: string
  isVisible: boolean
  updatedAt: Date
}

interface PageBuilderClientProps {
  blocks: BlockRow[]
  page: string
}

// ─── Page display names ────────────────────────────────────────────────────────

const PAGE_LABELS: Record<string, string> = {
  homepage: 'Homepage',
  about: 'About Page',
  fund: 'GAPHTO Fund',
  'practice-areas': 'Practice Areas',
  news: 'News & Updates',
  blog: 'Blog',
  events: 'Events & CPD',
  gallery: 'Photo Gallery',
  leadership: 'Our Leadership',
  contact: 'Contact Us',
  publications: 'Publications',
}

// ─── Block type catalogue ──────────────────────────────────────────────────────

const BLOCK_TYPE_LABELS: Record<string, { label: string; description: string; icon: string }> = {
  hero: { label: 'Hero', description: 'Full-width hero with title and subtitle', icon: '🏠' },
  stats_bar: { label: 'Stats Bar', description: 'Animated stat counters', icon: '📊' },
  rich_text: { label: 'Rich Text', description: 'Formatted text section', icon: '📝' },
  objectives_list: { label: 'Objectives', description: 'Numbered objectives list', icon: '✅' },
  timeline: { label: 'Timeline', description: 'Chronological history entries', icon: '📅' },
  practice_areas_grid: { label: 'Practice Areas', description: 'Card grid of practice areas', icon: '🗂️' },
  news_preview: { label: 'News Preview', description: 'Latest news section', icon: '📰' },
  events_preview: { label: 'Events', description: 'Upcoming events section', icon: '🗓️' },
  leadership_preview: { label: 'Leadership', description: 'Team member showcase', icon: '👥' },
  gallery_teaser: { label: 'Gallery', description: 'Photo gallery section', icon: '🖼️' },
  fund_cta: { label: 'Fund CTA', description: 'Call to action for the welfare fund', icon: '💰' },
  image_banner: { label: 'Image Banner', description: 'Full-width image', icon: '🖼️' },
}

// ─── Default content for new blocks ───────────────────────────────────────────

const DEFAULT_CONTENT: Record<string, object> = {
  hero: { title: 'New Section', subtitle: '' },
  stats_bar: { items: [{ count: '0', suffix: '', label: 'Stat' }] },
  rich_text: { heading: 'New Section', body: '<p>Enter content here.</p>' },
  objectives_list: { heading: 'Objectives', items: [''] },
  timeline: { heading: 'Timeline', items: [{ year: '', title: '', description: '' }] },
  practice_areas_grid: { heading: 'Practice Areas', items: [{ title: '', description: '' }] },
  news_preview: { heading: 'Latest News', count: 3 },
  events_preview: { heading: 'Events', count: 3 },
  leadership_preview: { heading: 'Leadership', count: 4 },
  gallery_teaser: { heading: 'Gallery' },
  fund_cta: { heading: 'Fund', subtitle: '', buttonText: 'Learn More' },
  image_banner: { imageUrl: '', alt: '', caption: '' },
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function PageBuilderClient({ blocks: initialBlocks, page }: PageBuilderClientProps) {
  const router = useRouter()
  const [blockList, setBlockList] = useState<BlockRow[]>(initialBlocks)

  // Sync local state when server sends fresh blocks after router.refresh()
  useEffect(() => {
    setBlockList(initialBlocks)
  }, [initialBlocks])

  const [, startReorder] = useTransition()
  const [isPendingAdd, startAdd] = useTransition()
  const [isPublishing, setIsPublishing] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const pageLabel = PAGE_LABELS[page] ?? page

  // ── DnD sensors ──────────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // ── Drag end handler ─────────────────────────────────────────────────────────

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = blockList.findIndex(b => b.id === active.id)
    const newIndex = blockList.findIndex(b => b.id === over.id)
    const reordered = arrayMove(blockList, oldIndex, newIndex).map((b, i) => ({
      ...b,
      sortOrder: i,
    }))

    setBlockList(reordered)

    startReorder(async () => {
      try {
        await reorderBlocks(reordered.map(b => ({ id: b.id, sortOrder: b.sortOrder })))
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to reorder blocks')
        setBlockList(blockList) // revert optimistic reorder
      }
    })
  }

  // ── Add block ────────────────────────────────────────────────────────────────

  function handleAddBlock(type: string) {
    const defaultContent = DEFAULT_CONTENT[type] ?? {}
    const nextSortOrder = blockList.length

    startAdd(async () => {
      try {
        await upsertBlock({
          id: null,
          page,
          type,
          content: defaultContent,
          sortOrder: nextSortOrder,
        })
        setAddDialogOpen(false)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to add block')
      }
    })
  }

  async function handlePublish() {
    setIsPublishing(true)
    try {
      await republishPage(page)
      toast.success('Page published successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish page')
    } finally {
      setIsPublishing(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header + breadcrumb */}
      <div>
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/dashboard/content" className="hover:text-foreground transition-colors">
            Content
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{pageLabel}</span>
        </nav>
        <h1 className="text-xl font-bold text-foreground">{pageLabel}</h1>
        <p className="text-sm text-muted-foreground">
          {blockList.length} block{blockList.length !== 1 ? 's' : ''} — drag to reorder, expand to edit.
        </p>
        <div className="mt-3">
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={isPublishing}
            className="gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            {isPublishing ? 'Publishing...' : 'Publish Page'}
          </Button>
        </div>
      </div>

      {/* Block list */}
      <div className="space-y-2">
        {blockList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">No blocks yet. Add your first block below.</p>
          </div>
        ) : (
          <DndContext
            id="page-builder-dnd"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blockList.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {blockList.map((block) => (
                <BlockEditorShell
                  key={block.id}
                  block={block}
                  onDelete={() => {
                    setBlockList(prev => prev.filter(b => b.id !== block.id))
                    router.refresh()
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add Block */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full gap-2 border-dashed"
            disabled={isPendingAdd}
          >
            <Plus className="w-4 h-4" />
            Add Block
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add a Block</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
            {Object.entries(BLOCK_TYPE_LABELS).map(([type, info]) => (
              <button
                key={type}
                onClick={() => handleAddBlock(type)}
                disabled={isPendingAdd}
                className="flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-3 text-left hover:border-primary/60 hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-2xl leading-none">{info.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground leading-tight">{info.label}</p>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                    {info.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
