'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createPublication, updatePublication } from '@/app/actions/publications'
import type { Publication } from '../../../drizzle/schema'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ImageField } from '@/components/dashboard/media-picker-modal'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface PublicationFormProps {
  publication?: Publication
}

export function PublicationForm({ publication }: PublicationFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(publication?.title ?? '')
  const [description, setDescription] = useState(publication?.description ?? '')
  const [fileUrl, setFileUrl] = useState(publication?.fileUrl ?? '')
  const [fileType, setFileType] = useState(publication?.fileType ?? '')
  const [publishedAt, setPublishedAt] = useState(
    publication?.publishedAt ? new Date(publication.publishedAt).toISOString().split('T')[0] : ''
  )
  const [isMemberOnly, setIsMemberOnly] = useState(publication?.isMemberOnly ?? true)

  const isEdit = !!publication

  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        title,
        slug: publication?.slug ?? slugify(title) + '-' + Date.now(),
        description,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        publishedAt: publishedAt || null,
        isMemberOnly,
      }
      if (publication) {
        return updatePublication(publication.id, body)
      } else {
        return createPublication(body)
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Publication updated' : 'Publication added')
      router.push('/dashboard/publications')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    },
  })

  const handleSave = () => {
    if (!title) return
    mutation.mutate()
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="space-y-1">
        <label className="text-sm font-medium">Title *</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Publication title" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <ImageField
        label="File (PDF / DOC / XLSX)"
        value={fileUrl}
        onChange={(url) => {
          setFileUrl(url)
          if (url) {
            const ext = url.split('.').pop()?.toLowerCase() ?? ''
            setFileType(ext)
          }
        }}
        accept="document"
        pickerTitle="Choose Document"
      />
      <div className="space-y-1">
        <label className="text-sm font-medium">Published Date</label>
        <Input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
      </div>
      <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
        <div>
          <p className="text-sm font-medium">Members Only</p>
          <p className="text-xs text-muted-foreground/70">Restrict download to logged-in members</p>
        </div>
        <Switch checked={isMemberOnly} onCheckedChange={setIsMemberOnly} />
      </div>
      <div className="flex gap-3">
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground" onClick={handleSave} disabled={mutation.isPending || !title}>
          {mutation.isPending ? 'Saving…' : isEdit ? 'Update' : 'Create Publication'}
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/publications')}>Cancel</Button>
      </div>
    </div>
  )
}
