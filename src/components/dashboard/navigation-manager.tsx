'use client'

import { useState, useTransition } from 'react'
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
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  createNavLink,
  updateNavLink,
  deleteNavLink,
  toggleNavVisibility,
  reorderNavLinks,
} from '@/app/actions/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { GripVertical, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'

type NavLink = {
  id: string
  label: string
  href: string
  sortOrder: number
  isVisible: boolean
  openInNewTab: boolean
  createdAt: Date
  updatedAt: Date
}

interface NavigationManagerProps {
  initialLinks: NavLink[]
}

// ─── Sortable Row ─────────────────────────────────────────────────────────────

function SortableRow({
  link,
  index,
  onEdit,
  onDelete,
  onToggleVisibility,
  isTogglingId,
}: {
  link: NavLink
  index: number
  onEdit: (link: NavLink) => void
  onDelete: (link: NavLink) => void
  onToggleVisibility: (id: string) => void
  isTogglingId: string | null
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-8">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </TableCell>
      <TableCell className="w-10 text-muted-foreground text-sm">{index + 1}</TableCell>
      <TableCell className="font-medium">{link.label}</TableCell>
      <TableCell className="text-muted-foreground text-sm font-mono">{link.href}</TableCell>
      <TableCell>
        {link.openInNewTab ? (
          <Badge variant="secondary" className="text-xs">New tab</Badge>
        ) : (
          <span className="text-muted-foreground text-xs">Same tab</span>
        )}
      </TableCell>
      <TableCell>
        <Switch
          checked={link.isVisible}
          disabled={isTogglingId === link.id}
          onCheckedChange={() => onToggleVisibility(link.id)}
          aria-label={link.isVisible ? 'Visible — click to hide' : 'Hidden — click to show'}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(link)}
            aria-label="Edit"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(link)}
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NavigationManager({ initialLinks }: NavigationManagerProps) {
  const [links, setLinks] = useState<NavLink[]>(initialLinks)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<NavLink | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<NavLink | null>(null)
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null)

  // Form state
  const [formLabel, setFormLabel] = useState('')
  const [formHref, setFormHref] = useState('')
  const [formOpenInNewTab, setFormOpenInNewTab] = useState(false)
  const [isSaving, startSave] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const [, startReorder] = useTransition()

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function openCreate() {
    setEditTarget(null)
    setFormLabel('')
    setFormHref('')
    setFormOpenInNewTab(false)
    setDialogOpen(true)
  }

  function openEdit(link: NavLink) {
    setEditTarget(link)
    setFormLabel(link.label)
    setFormHref(link.href)
    setFormOpenInNewTab(link.openInNewTab)
    setDialogOpen(true)
  }

  function handleSave() {
    if (!formLabel.trim() || !formHref.trim()) {
      toast.error('Label and URL are required')
      return
    }

    startSave(async () => {
      try {
        if (editTarget) {
          await updateNavLink(editTarget.id, {
            label: formLabel.trim(),
            href: formHref.trim(),
            openInNewTab: formOpenInNewTab,
          })
          setLinks((prev) =>
            prev.map((l) =>
              l.id === editTarget.id
                ? { ...l, label: formLabel.trim(), href: formHref.trim(), openInNewTab: formOpenInNewTab }
                : l
            )
          )
          toast.success('Link updated')
        } else {
          await createNavLink({
            label: formLabel.trim(),
            href: formHref.trim(),
            openInNewTab: formOpenInNewTab,
          })
          toast.success('Link added')
          // Reload from server isn't needed here — next page load fetches fresh; optimistic update enough
          // Add optimistic entry at the end
          const newLink: NavLink = {
            id: crypto.randomUUID(),
            label: formLabel.trim(),
            href: formHref.trim(),
            openInNewTab: formOpenInNewTab,
            sortOrder: links.length,
            isVisible: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          setLinks((prev) => [...prev, newLink])
        }
        setDialogOpen(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save')
      }
    })
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    const target = deleteTarget
    startDelete(async () => {
      try {
        await deleteNavLink(target.id)
        setLinks((prev) => prev.filter((l) => l.id !== target.id))
        toast.success('Link deleted')
        setDeleteTarget(null)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete')
      }
    })
  }

  async function handleToggleVisibility(id: string) {
    setIsTogglingId(id)
    try {
      await toggleNavVisibility(id)
      setLinks((prev) =>
        prev.map((l) => (l.id === id ? { ...l, isVisible: !l.isVisible } : l))
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle visibility')
    } finally {
      setIsTogglingId(null)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = links.findIndex((l) => l.id === active.id)
    const newIndex = links.findIndex((l) => l.id === over.id)
    const reordered = arrayMove(links, oldIndex, newIndex).map((l, i) => ({
      ...l,
      sortOrder: i,
    }))

    setLinks(reordered)

    startReorder(async () => {
      try {
        await reorderNavLinks(reordered.map((l) => ({ id: l.id, sortOrder: l.sortOrder })))
        toast.success('Order saved')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to reorder')
        setLinks(links) // revert
      }
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{links.length} link{links.length !== 1 ? 's' : ''}</CardTitle>
          <Button onClick={openCreate} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Link
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={links.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Tab</TableHead>
                    <TableHead>Visible</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No navigation links yet. Add your first link above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    links.map((link, index) => (
                      <SortableRow
                        key={link.id}
                        link={link}
                        index={index}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                        onToggleVisibility={handleToggleVisibility}
                        isTogglingId={isTogglingId}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Link' : 'Add Link'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nav-label">Label</Label>
              <Input
                id="nav-label"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="e.g. About Us"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nav-href">URL</Label>
              <Input
                id="nav-href"
                value={formHref}
                onChange={(e) => setFormHref(e.target.value)}
                placeholder="e.g. /about"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="nav-new-tab" className="cursor-pointer">
                Open in new tab
              </Label>
              <Switch
                id="nav-new-tab"
                checked={formOpenInNewTab}
                onCheckedChange={setFormOpenInNewTab}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete link?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove{' '}
            <span className="font-medium text-foreground">{deleteTarget?.label}</span> from the
            navigation. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
