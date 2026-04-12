'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { getMediaFiles, deleteMediaFile } from '@/app/actions/media'
import { getMediaUrl } from '@/lib/media-url'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ImageIcon,
  FileText,
  Trash2,
  Copy,
  Upload,
  Search,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type MediaFile = Awaited<ReturnType<typeof getMediaFiles>>[number]

type FilterTab = 'all' | 'images' | 'documents'

function isImage(mimeType: string) {
  return mimeType.startsWith('image/')
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaManagerClient() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [detailFile, setDetailFile] = useState<MediaFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getMimeFilter = (tab: FilterTab) => {
    if (tab === 'images') return 'image'
    if (tab === 'documents') return 'application'
    return undefined
  }

  const loadFiles = useCallback(async (searchVal: string, tab: FilterTab, pageNum: number, append = false) => {
    setLoading(true)
    try {
      const limit = 40
      const results = await getMediaFiles({
        mimeType: getMimeFilter(tab),
        search: searchVal || undefined,
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

  useEffect(() => {
    loadFiles(search, activeTab, 1, false)
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      loadFiles(val, activeTab, 1, false)
    }, 350)
  }

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    loadFiles(search, activeTab, next, true)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    if (!picked.length) return
    setUploading(true)
    let succeeded = 0
    for (const file of picked) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) throw new Error('Upload failed')
        succeeded++
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    if (succeeded > 0) {
      toast.success(`${succeeded} file${succeeded > 1 ? 's' : ''} uploaded`)
      setPage(1)
      loadFiles(search, activeTab, 1, false)
    }
    setUploading(false)
    e.target.value = ''
  }

  const handleCopyUrl = async (file: MediaFile) => {
    const url = getMediaUrl(file.key)
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URL copied to clipboard')
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Delete "${file.originalName}"? This cannot be undone.`)) return
    setDeletingId(file.id)
    try {
      await deleteMediaFile(file.id)
      setFiles(prev => prev.filter(f => f.id !== file.id))
      toast.success('File deleted')
      if (detailFile?.id === file.id) setDetailFile(null)
    } catch {
      toast.error('Failed to delete file')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage uploaded files and images</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search files…"
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading && files.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          Loading…
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <ImageIcon className="w-12 h-12 opacity-20" />
          <p className="text-sm">{search ? 'No files match your search.' : 'No files uploaded yet.'}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="group relative rounded-xl border border-border bg-muted/30 overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                onClick={() => setDetailFile(file)}
              >
                {/* Thumbnail */}
                <div className="aspect-square flex items-center justify-center bg-muted/50 overflow-hidden">
                  {isImage(file.mimeType) ? (
                    <img
                      src={getMediaUrl(file.key)}
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-muted-foreground/40" />
                  )}
                </div>

                {/* Name */}
                <div className="px-2 py-2">
                  <p className="text-xs text-muted-foreground truncate">{file.originalName}</p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    title="Copy URL"
                    onClick={(e) => { e.stopPropagation(); handleCopyUrl(file) }}
                    className="p-2 rounded-lg bg-white/90 hover:bg-white text-foreground transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); handleDelete(file) }}
                    disabled={deletingId === file.id}
                    className={cn(
                      'p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors',
                      deletingId === file.id && 'opacity-50 pointer-events-none'
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
                {loading ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}

      {/* File detail dialog */}
      <Dialog open={!!detailFile} onOpenChange={(v) => !v && setDetailFile(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="truncate text-sm font-semibold">
              {detailFile?.originalName}
            </DialogTitle>
          </DialogHeader>
          {detailFile && (
            <div className="space-y-4">
              {isImage(detailFile.mimeType) ? (
                <img
                  src={getMediaUrl(detailFile.key)}
                  alt={detailFile.originalName}
                  className="w-full max-h-72 object-contain rounded-lg border bg-muted/30"
                />
              ) : (
                <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg border">
                  <FileText className="w-12 h-12 text-muted-foreground/40" />
                </div>
              )}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">File name</dt>
                <dd className="font-medium truncate">{detailFile.originalName}</dd>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">{detailFile.mimeType}</dd>
                <dt className="text-muted-foreground">Size</dt>
                <dd className="font-medium">{formatBytes(detailFile.fileSize)}</dd>
                <dt className="text-muted-foreground">Uploaded</dt>
                <dd className="font-medium">
                  {detailFile.createdAt
                    ? new Date(detailFile.createdAt).toLocaleDateString()
                    : '—'}
                </dd>
              </dl>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(detailFile)}
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy URL
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(detailFile)}
                  disabled={deletingId === detailFile.id}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
