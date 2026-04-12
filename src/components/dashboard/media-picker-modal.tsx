'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getMediaFiles } from '@/app/actions/media'
import { getMediaUrl } from '@/lib/media-url'
import { ImageIcon, FileText, Upload, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaPickerModalProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
  accept?: 'image' | 'document' | 'all'
  title?: string
}

type MediaFile = Awaited<ReturnType<typeof getMediaFiles>>[number]

function isImage(mimeType: string) {
  return mimeType.startsWith('image/')
}

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  accept = 'all',
  title = 'Choose Media',
}: MediaPickerModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getMimeFilter = () => {
    if (accept === 'image') return 'image'
    if (accept === 'document') return 'application'
    return undefined
  }

  const loadFiles = useCallback(async (searchVal: string, pageNum: number, append = false) => {
    setLoading(true)
    try {
      const limit = 24
      const results = await getMediaFiles({
        mimeType: getMimeFilter(),
        search: searchVal || undefined,
        page: pageNum,
        limit,
      })
      setFiles(prev => append ? [...prev, ...results] : results)
      setHasMore(results.length === limit)
    } catch {
      toast.error('Failed to load media files')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accept])

  useEffect(() => {
    if (open) {
      setSearch('')
      setPage(1)
      loadFiles('', 1, false)
    }
  }, [open, loadFiles])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      loadFiles(val, 1, false)
    }, 350)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadFiles(search, nextPage, true)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json() as { url: string }
      toast.success('File uploaded')
      onSelect(url)
      onClose()
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSelect = (file: MediaFile) => {
    onSelect(getMediaUrl(file.key))
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={accept === 'image' ? 'image/*' : accept === 'document' ? '.pdf,.doc,.docx,.xlsx' : '*'}
                onChange={handleUpload}
                className="hidden"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                {uploading ? 'Uploading…' : 'Upload New'}
              </Button>
            </div>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search files…"
              className="pl-8 h-8 text-sm"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && files.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
              Loading…
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2">
              <ImageIcon className="w-8 h-8 opacity-30" />
              <span>No files found</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleSelect(file)}
                    className="group relative rounded-lg border border-border bg-muted/30 overflow-hidden hover:border-primary hover:ring-2 hover:ring-primary/30 transition-all text-left"
                  >
                    <div className="aspect-square flex items-center justify-center bg-muted/50 overflow-hidden">
                      {isImage(file.mimeType) ? (
                        <img
                          src={getMediaUrl(file.key)}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-8 h-8 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="px-1.5 py-1.5">
                      <p className="text-[10px] text-muted-foreground truncate leading-tight">
                        {file.originalName}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-4">
                  <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={loading}>
                    {loading ? 'Loading…' : 'Load more'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Reusable image field with picker + upload + preview + clear.
 */
interface ImageFieldProps {
  label?: string
  value: string
  onChange: (url: string) => void
  accept?: 'image' | 'document' | 'all'
  pickerTitle?: string
  /** If true, shows a round avatar preview instead of a wide banner */
  avatar?: boolean
  className?: string
}

export function ImageField({
  label,
  value,
  onChange,
  accept = 'image',
  pickerTitle,
  avatar = false,
  className,
}: ImageFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptAttr = accept === 'image' ? 'image/*' : accept === 'document' ? '.pdf,.doc,.docx,.xlsx' : '*'

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json() as { url: string }
      onChange(url)
      toast.success('Uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <label className="text-sm font-medium text-muted-foreground">{label}</label>}

      {/* Preview */}
      {value && accept !== 'document' && (
        avatar ? (
          <img src={value} alt="Preview" className="w-20 h-20 rounded-full object-cover border" />
        ) : (
          <img src={value} alt="Preview" className="h-32 w-full object-cover rounded-lg border" />
        )
      )}
      {value && accept === 'document' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded px-3 py-2">
          <FileText className="w-4 h-4 shrink-0" />
          <span className="truncate">{value.split('/').pop()}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
          <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
          Choose from Media Library
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          {uploading ? 'Uploading…' : 'Upload New'}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
            Clear
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptAttr}
        onChange={handleUpload}
        className="hidden"
      />

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
        accept={accept}
        title={pickerTitle}
      />
    </div>
  )
}
