'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { upsertBlock, deleteBlock, toggleBlockVisibility } from '@/app/actions/blocks'
import { parseBlockContent } from '@/lib/blocks'
import type {
  HeroContent,
  StatsBarContent,
  RichTextContent,
  ObjectivesContent,
  TimelineContent,
  FeaturesGridContent,
  GalleryTeaserContent,
  AboutPreviewContent,
} from '@/lib/blocks'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ChevronDown, ChevronUp, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react'
import { HeroBlockEditor } from './hero-block-editor'
import { StatsBarBlockEditor } from './stats-bar-block-editor'
import { RichTextBlockEditor } from './rich-text-block-editor'
import { ObjectivesBlockEditor } from './objectives-block-editor'
import { TimelineBlockEditor } from './timeline-block-editor'
import { FeaturesGridBlockEditor } from './features-grid-block-editor'
import { SimpleSectionBlockEditor } from './simple-section-block-editor'
import { GalleryTeaserBlockEditor } from './gallery-teaser-block-editor'
import { ImageBannerBlockEditor } from './image-banner-block-editor'
import { AboutPreviewBlockEditor } from './about-preview-block-editor'

type BlockRow = {
  id: string
  page: string
  type: string
  sortOrder: number
  content: string
  isVisible: boolean
  updatedAt: Date
}

interface BlockEditorShellProps {
  block: BlockRow
  onDelete?: () => void
}

const BLOCK_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero',
  stats_bar: 'Stats Bar',
  rich_text: 'Rich Text',
  objectives_list: 'Objectives',
  timeline: 'Timeline',
  features_grid: 'Features Grid',
  news_preview: 'News Preview',
  events_preview: 'Events Preview',
  leadership_preview: 'Leadership',
  gallery_teaser: 'Gallery',
  cta_section: 'CTA Section',
  image_banner: 'Image Banner',
  about_preview: 'About Preview',
}

// Default fallbacks for each block type
const defaultHero: HeroContent = { title: '', subtitle: '' }
const defaultStatsBar: StatsBarContent = { items: [] }
const defaultRichText: RichTextContent = { heading: '', body: '' }
const defaultObjectives: ObjectivesContent = { heading: '', items: [] }
const defaultTimeline: TimelineContent = { heading: '', items: [] }
const defaultFeaturesGrid: FeaturesGridContent = { heading: '', items: [] }
const defaultSimpleSectionWithCount = { heading: '', count: 3 }
const defaultGalleryTeaser: GalleryTeaserContent = { heading: '', count: 6, selectedAlbumSlugs: [] }
const defaultAboutPreview: AboutPreviewContent = { heading: '', imageUrl: '', imageAlt: '', linkText: 'Learn More About Us', linkHref: '/about' }

function renderEditor(block: BlockRow, onSave: (content: object) => Promise<void>) {
  switch (block.type) {
    case 'hero':
      return (
        <HeroBlockEditor
          blockId={block.id}
          initialContent={parseBlockContent<HeroContent>(block.content, defaultHero)}
          onSave={onSave as (c: HeroContent) => Promise<void>}
        />
      )
    case 'stats_bar':
      return (
        <StatsBarBlockEditor
          blockId={block.id}
          initialContent={parseBlockContent<StatsBarContent>(block.content, defaultStatsBar)}
          onSave={onSave as (c: StatsBarContent) => Promise<void>}
        />
      )
    case 'rich_text':
      return (
        <RichTextBlockEditor
          blockId={block.id}
          initialContent={parseBlockContent<RichTextContent>(block.content, defaultRichText)}
          onSave={onSave as (c: RichTextContent) => Promise<void>}
        />
      )
    case 'objectives_list':
      return (
        <ObjectivesBlockEditor
          blockId={block.id}
          initialContent={parseBlockContent<ObjectivesContent>(block.content, defaultObjectives)}
          onSave={onSave as (c: ObjectivesContent) => Promise<void>}
        />
      )
    case 'timeline':
      return (
        <TimelineBlockEditor
          blockId={block.id}
          initialContent={parseBlockContent<TimelineContent>(block.content, defaultTimeline)}
          onSave={onSave as (c: TimelineContent) => Promise<void>}
        />
      )
    case 'features_grid':
      return (
        <FeaturesGridBlockEditor
          blockId={block.id}
          initialContent={parseBlockContent<FeaturesGridContent>(block.content, defaultFeaturesGrid)}
          onSave={onSave as (c: FeaturesGridContent) => Promise<void>}
        />
      )
    case 'news_preview':
    case 'events_preview':
    case 'leadership_preview':
      return (
        <SimpleSectionBlockEditor
          blockId={block.id}
          initialContent={parseBlockContent(block.content, defaultSimpleSectionWithCount)}
          onSave={onSave as (c: { heading: string; count?: number }) => Promise<void>}
          showCount
        />
      )
    case 'cta_section':
      return (
        <SimpleSectionBlockEditor
          blockId={block.id}
          initialContent={parseBlockContent(block.content, { heading: '' })}
          onSave={onSave as (c: { heading: string }) => Promise<void>}
        />
      )
    case 'gallery_teaser':
      return (
        <GalleryTeaserBlockEditor
          blockId={block.id}
          initialContent={parseBlockContent<GalleryTeaserContent>(block.content, defaultGalleryTeaser)}
          onSave={onSave as (c: GalleryTeaserContent) => Promise<void>}
        />
      )
    case 'image_banner':
      return (
        <ImageBannerBlockEditor
          blockId={block.id}
          initialContent={parseBlockContent(block.content, { imageUrl: '', alt: '', caption: '' })}
          onSave={onSave as (c: { imageUrl: string; alt: string; caption: string }) => Promise<void>}
        />
      )
    case 'about_preview':
      return (
        <AboutPreviewBlockEditor
          blockId={block.id}
          initialContent={parseBlockContent<AboutPreviewContent>(block.content, defaultAboutPreview)}
          onSave={onSave as (c: AboutPreviewContent) => Promise<void>}
        />
      )
    default:
      return (
        <p className="p-4 text-sm text-muted-foreground">
          Unknown block type: {block.type}
        </p>
      )
  }
}

export function BlockEditorShell({ block, onDelete }: BlockEditorShellProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState(block.isVisible)
  const [visibilityPending, startVisibilityTransition] = useTransition()
  const [deletePending, startDeleteTransition] = useTransition()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  const typeLabel = BLOCK_TYPE_LABELS[block.type] ?? block.type

  function handleVisibilityToggle() {
    startVisibilityTransition(async () => {
      try {
        await toggleBlockVisibility(block.id)
        setVisible((v) => !v)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to toggle visibility')
      }
    })
  }

  function handleDelete() {
    if (!window.confirm('Delete this block?')) return
    startDeleteTransition(async () => {
      try {
        await deleteBlock(block.id)
        toast.success('Block deleted')
        onDelete?.()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete block')
      }
    })
  }

  async function handleSave(content: object) {
    await upsertBlock({
      id: block.id,
      page: block.page,
      type: block.type,
      content,
      sortOrder: block.sortOrder,
    })
    toast.success('Block saved')
    router.refresh()
  }

  return (
    <div ref={setNodeRef} style={style} className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header row */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground focus:outline-none"
          style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Type badge */}
        <Badge variant="secondary" className="shrink-0 text-xs">
          {typeLabel}
        </Badge>

        {/* Spacer */}
        <div className="flex-1 min-w-0" />

        {/* Visibility toggle */}
        <div
          className="flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {visible ? (
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <Switch
            checked={visible}
            onCheckedChange={handleVisibilityToggle}
            disabled={visibilityPending}
            aria-label="Toggle block visibility"
          />
        </div>

        {/* Delete */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          disabled={deletePending}
          onClick={(e) => { e.stopPropagation(); handleDelete() }}
          aria-label="Delete block"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        {/* Expand/Collapse chevron */}
        <div className="shrink-0 ml-1">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Collapsible editor area */}
      {expanded && (
        <div className="border-t border-border">
          {renderEditor(block, handleSave)}
        </div>
      )}
    </div>
  )
}
