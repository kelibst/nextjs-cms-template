'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import {
  getMediaFiles, deleteMediaFile, updateMediaFile,
  bulkDeleteMediaFiles, getMediaCategories
} from '@/app/actions/media'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  FileText, Video, Trash2, Copy, Upload,
  Search, X, Grid2X2, List, Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

type MediaFile = Awaited<ReturnType<typeof getMediaFiles>>[number]
type FilterTab = 'all' | 'images' | 'videos' | 'documents'
type SortOption = 'createdAt-desc' | 'createdAt-asc' | 'originalName-asc' | 'originalName-desc' | 'fileSize-desc' | 'fileSize-asc'
type ViewMode = 'grid' | 'list'

const DATE_PRESETS = [
  { label: 'All time', value: '__all__' },
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
  { label: 'This year', value: 'year' },
] as const

const CATEGORY_OPTIONS = [
  'gallery', 'news', 'events', 'leadership', 'documents', 'videos', 'general'
]

function isImage(mime: string) { return mime.startsWith('image/') }
function isVideo(mime: string) { return mime.startsWith('video/') }

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function getMimeFilter(tab: FilterTab): string | undefined {
  if (tab === 'images') return 'image'
  if (tab === 'videos') return 'video'
  if (tab === 'documents') return 'application'
  return undefined
}

function getDateRange(preset: string): { dateFrom?: string; dateTo?: string } {
  if (!preset || preset === '__all__') return {}
  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const today = fmt(now)
  if (preset === 'today') return { dateFrom: today, dateTo: today }
  if (preset === 'week') {
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    return { dateFrom: fmt(start), dateTo: today }
  }
  if (preset === 'month') return { dateFrom: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, dateTo: today }
  if (preset === 'year') return { dateFrom: `${now.getFullYear()}-01-01`, dateTo: today }
  return {}
}

export function MediaManagerClient() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [uploading, setUploading] = useState<{ current: number; total: number } | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Filters
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [datePreset, setDatePreset] = useState<string>('__all__')
  const [sortOption, setSortOption] = useState<SortOption>('createdAt-desc')
  const [categories, setCategories] = useState<string[]>([])

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [lastClickedIdx, setLastClickedIdx] = useState<number | null>(null)

  // Detail panel
  const [detailFile, setDetailFile] = useState<MediaFile | null>(null)
  const [editAlt, setEditAlt] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [savingField, setSavingField] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load categories on mount
  useEffect(() => {
    getMediaCategories().then(cats => setCategories(cats)).catch(() => {})
  }, [])

  // Close detail panel on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailFile(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const loadFiles = useCallback(async (
    searchVal: string, tab: FilterTab, cat: string,
    dateP: string, sort: SortOption, pageNum: number, append = false
  ) => {
    setLoading(true)
    try {
      const [sortBy, sortDir] = sort.split('-') as [string, string]
      const dateRange = getDateRange(dateP)
      const limit = 40
      const results = await getMediaFiles({
        mimeType: getMimeFilter(tab),
        search: searchVal || undefined,
        category: cat === 'all' ? undefined : cat,
        sortBy: sortBy as 'createdAt' | 'originalName' | 'fileSize',
        sortDir: sortDir as 'asc' | 'desc',
        ...dateRange,
        page: pageNum,
        limit,
      })
      setFiles(prev => append ? [...prev, ...results] : results)
      setHasMore(results.length === limit)
    } catch {
      toast.error('Failed to load files')
    } finally {
      setLoading(false)
    }
  }, [])

  // Reload on filter changes
  useEffect(() => {
    setPage(1)
    loadFiles(search, activeTab, category, datePreset, sortOption, 1, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, category, datePreset, sortOption])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      loadFiles(val, activeTab, category, datePreset, sortOption, 1, false)
    }, 350)
  }

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-primary', 'bg-primary/5')
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-primary', 'bg-primary/5')
  }
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-primary', 'bg-primary/5')
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) await uploadFiles(droppedFiles)
  }

  async function uploadFiles(filesToUpload: File[]) {
    setUploading({ current: 0, total: filesToUpload.length })
    let uploaded = 0
    for (const f of filesToUpload) {
      try {
        const fd = new FormData()
        fd.append('file', f)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Upload failed' }))
          toast.error(`${f.name}: ${(err as { error?: string }).error || 'Upload failed'}`)
        } else {
          uploaded++
          const data = await res.json() as { id?: number; url?: string }
          if (f.type.startsWith('video/') && data.id && data.url) {
            captureVideoDuration(data.url, data.id)
          }
        }
      } catch {
        toast.error(`${f.name}: Upload failed`)
      }
      setUploading({ current: uploaded, total: filesToUpload.length })
    }
    setUploading(null)
    if (uploaded > 0) {
      toast.success(`${uploaded} file${uploaded > 1 ? 's' : ''} uploaded`)
      loadFiles(search, activeTab, category, datePreset, sortOption, 1, false)
      setPage(1)
    }
  }

  function captureVideoDuration(url: string, id: number) {
    const video = document.createElement('video')
    video.src = url
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration)
      if (duration > 0) {
        updateMediaFile(id, { duration }).catch(() => {})
      }
      video.remove()
    }
  }

  function toggleSelect(file: MediaFile, idx: number, e: React.MouseEvent) {
    if (e.shiftKey && lastClickedIdx !== null) {
      const min = Math.min(idx, lastClickedIdx)
      const max = Math.max(idx, lastClickedIdx)
      const rangeIds = files.slice(min, max + 1).map(f => f.id)
      setSelectedIds(prev => {
        const next = new Set(prev)
        rangeIds.forEach(id => next.add(id))
        return next
      })
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev)
        if (next.has(file.id)) next.delete(file.id)
        else next.add(file.id)
        return next
      })
      setLastClickedIdx(idx)
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} file${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`)) return
    try {
      await bulkDeleteMediaFiles(Array.from(selectedIds))
      toast.success(`${selectedIds.size} files deleted`)
      setSelectedIds(new Set())
      if (detailFile && selectedIds.has(detailFile.id)) setDetailFile(null)
      loadFiles(search, activeTab, category, datePreset, sortOption, 1, false)
      setPage(1)
    } catch {
      toast.error('Bulk delete failed')
    }
  }

  function openDetail(file: MediaFile) {
    setDetailFile(file)
    setEditAlt(file.altText ?? '')
    setEditDesc(file.description ?? '')
    setEditCategory(file.category ?? '')
  }

  async function handleFieldBlur(field: 'altText' | 'description' | 'category', value: string) {
    if (!detailFile) return
    setSavingField(field)
    try {
      await updateMediaFile(detailFile.id, { [field]: value || undefined })
      setDetailFile(prev => prev ? { ...prev, [field]: value } : prev)
    } catch {
      toast.error('Failed to save')
    } finally {
      setSavingField(null)
    }
  }

  return (
    <div className="flex h-full">
      {/* Main content area */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">

        {/* Upload drop zone */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary hover:bg-primary/5"
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          {uploading ? (
            <p className="text-sm font-medium">Uploading {uploading.current} / {uploading.total}…</p>
          ) : (
            <>
              <p className="text-sm font-medium">Drop files here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">Images up to 10 MB · Documents up to 20 MB · Videos up to 200 MB</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.xlsx"
            onChange={e => { if (e.target.files?.length) uploadFiles(Array.from(e.target.files)) }}
          />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 items-center">
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as FilterTab)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Category filter */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Date filter */}
          <Select value={datePreset} onValueChange={setDatePreset}>
            <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Date" /></SelectTrigger>
            <SelectContent>
              {DATE_PRESETS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortOption} onValueChange={v => setSortOption(v as SortOption)}>
            <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Newest first</SelectItem>
              <SelectItem value="createdAt-asc">Oldest first</SelectItem>
              <SelectItem value="originalName-asc">Name A–Z</SelectItem>
              <SelectItem value="originalName-desc">Name Z–A</SelectItem>
              <SelectItem value="fileSize-desc">Largest first</SelectItem>
              <SelectItem value="fileSize-asc">Smallest first</SelectItem>
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 h-9" placeholder="Search files…" value={search} onChange={e => handleSearchChange(e.target.value)} />
          </div>

          {/* View toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-2', viewMode === 'grid' ? 'bg-muted' : 'hover:bg-muted/50')}
            ><Grid2X2 className="h-4 w-4" /></button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-2', viewMode === 'list' ? 'bg-muted' : 'hover:bg-muted/50')}
            ><List className="h-4 w-4" /></button>
          </div>
        </div>

        {/* File count */}
        <p className="text-sm text-muted-foreground">{files.length} files{selectedIds.size > 0 ? ` · ${selectedIds.size} selected` : ''}</p>

        {/* Grid view */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {files.map((file, idx) => {
              const selected = selectedIds.has(file.id)
              return (
                <div
                  key={file.id}
                  className={cn(
                    'group relative aspect-square rounded-lg overflow-hidden border cursor-pointer',
                    'hover:border-primary transition-colors',
                    selected && 'ring-2 ring-primary border-primary',
                    detailFile?.id === file.id && 'ring-2 ring-primary/50'
                  )}
                  onClick={e => {
                    if (e.ctrlKey || e.metaKey || e.shiftKey || selectedIds.size > 0) {
                      toggleSelect(file, idx, e)
                    } else {
                      openDetail(file)
                    }
                  }}
                >
                  {/* Thumbnail */}
                  {isImage(file.mimeType) ? (
                    <img src={file.url} alt={file.altText ?? file.originalName} className="w-full h-full object-cover" />
                  ) : isVideo(file.mimeType) ? (
                    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center gap-1">
                      <Video className="h-8 w-8 text-white/70" />
                      {file.duration != null && (
                        <span className="text-xs text-white/60">{formatDuration(file.duration)}</span>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-1 p-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-center text-muted-foreground truncate w-full">{file.originalName}</span>
                    </div>
                  )}

                  {/* Checkbox (hover-visible or always when any selected) */}
                  <div
                    className={cn(
                      'absolute top-1.5 left-1.5 w-5 h-5 rounded border bg-background/80 flex items-center justify-center transition-opacity',
                      selectedIds.size > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                      selected && 'bg-primary border-primary'
                    )}
                    onClick={e => { e.stopPropagation(); toggleSelect(file, idx, e) }}
                  >
                    {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>

                  {/* Category badge */}
                  {file.category && (
                    <span className="absolute bottom-1 right-1 text-xs bg-black/60 text-white px-1 rounded">
                      {file.category}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-8 p-2"></th>
                  <th className="w-10 p-2"></th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Size</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, idx) => {
                  const selected = selectedIds.has(file.id)
                  return (
                    <tr
                      key={file.id}
                      className={cn('border-t hover:bg-muted/30 cursor-pointer', selected && 'bg-primary/5')}
                      onClick={() => openDetail(file)}
                    >
                      <td className="p-2">
                        <div
                          className={cn('w-4 h-4 rounded border flex items-center justify-center', selected && 'bg-primary border-primary')}
                          onClick={e => { e.stopPropagation(); toggleSelect(file, idx, e) }}
                        >
                          {selected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                        </div>
                      </td>
                      <td className="p-2">
                        {isImage(file.mimeType) ? (
                          <img src={file.url} alt="" className="w-8 h-8 rounded object-cover" />
                        ) : isVideo(file.mimeType) ? (
                          <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
                            <Video className="h-4 w-4 text-white/70" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="p-2 max-w-48 truncate">{file.originalName}</td>
                      <td className="p-2 text-muted-foreground">{file.mimeType.split('/')[1]}</td>
                      <td className="p-2 text-muted-foreground">{formatBytes(file.fileSize)}</td>
                      <td className="p-2 text-muted-foreground">{file.category || '—'}</td>
                      <td className="p-2 text-muted-foreground">{new Date(file.createdAt).toLocaleDateString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <Button variant="outline" onClick={() => { const next = page + 1; setPage(next); loadFiles(search, activeTab, category, datePreset, sortOption, next, true) }}>
            Load more
          </Button>
        )}

        {!loading && files.length === 0 && (
          <p className="text-center text-muted-foreground py-16">No files found</p>
        )}
      </div>

      {/* Detail side panel */}
      {detailFile && (
        <div className="w-80 shrink-0 border-l ml-4 pl-4 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">File Details</h3>
            <button onClick={() => setDetailFile(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Preview */}
          {isImage(detailFile.mimeType) ? (
            <img src={detailFile.url} alt={detailFile.altText ?? ''} className="w-full rounded-lg object-cover max-h-48" />
          ) : isVideo(detailFile.mimeType) ? (
            <video src={detailFile.url} controls className="w-full rounded-lg max-h-48" />
          ) : (
            <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="truncate font-medium text-foreground">{detailFile.originalName}</p>
            <p>{detailFile.mimeType} · {formatBytes(detailFile.fileSize)}</p>
            {detailFile.duration != null && <p>Duration: {formatDuration(detailFile.duration)}</p>}
            <p>Uploaded: {new Date(detailFile.createdAt).toLocaleString()}</p>
          </div>

          {/* Editable fields */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Alt Text</label>
              <Input
                value={editAlt}
                onChange={e => setEditAlt(e.target.value)}
                onBlur={() => handleFieldBlur('altText', editAlt)}
                placeholder="Describe the image for accessibility"
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Description</label>
              <Textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                onBlur={() => handleFieldBlur('description', editDesc)}
                placeholder="Optional caption or description"
                rows={2}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Category</label>
              <Select
                value={editCategory || '__none__'}
                onValueChange={v => {
                  const val = v === '__none__' ? '' : v
                  setEditCategory(val)
                  handleFieldBlur('category', val)
                }}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Uncategorised" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Uncategorised</SelectItem>
                  {CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {savingField && <p className="text-xs text-muted-foreground">Saving…</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => { navigator.clipboard.writeText(detailFile.url); toast.success('URL copied') }}
            >
              <Copy className="h-3 w-3 mr-1" /> Copy URL
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (!confirm('Delete this file?')) return
                try {
                  await deleteMediaFile(detailFile.id)
                  setDetailFile(null)
                  setFiles(prev => prev.filter(f => f.id !== detailFile.id))
                  toast.success('File deleted')
                } catch {
                  toast.error('Delete failed')
                }
              }}
            >
              <Trash2 className="h-3 w-3 mr-1" /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* Bulk action floating bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-background border shadow-lg rounded-full px-4 py-2 flex items-center gap-3 z-50">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setSelectedIds(new Set())}>
            Deselect all
          </button>
          <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
            <Trash2 className="h-3 w-3 mr-1" /> Delete {selectedIds.size}
          </Button>
        </div>
      )}
    </div>
  )
}
