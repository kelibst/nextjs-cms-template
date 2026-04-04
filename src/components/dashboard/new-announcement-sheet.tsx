'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createAnnouncement } from '@/app/actions/announcements'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function NewAnnouncementSheet() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [visibleTo, setVisibleTo] = useState('public')
  const [isPinned, setIsPinned] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const router = useRouter()

  const reset = () => {
    setTitle(''); setContent(''); setVisibleTo('public'); setIsPinned(false); setExpiresAt('')
  }

  const mutation = useMutation({
    mutationFn: () => createAnnouncement({ title, content, visibleTo, isPinned, expiresAt: expiresAt || null }),
    onSuccess: () => {
      toast.success('Announcement created')
      reset()
      setOpen(false)
      router.refresh()
    },
    onError: () => toast.error('Failed to create announcement'),
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground gap-1.5">
          <Plus className="w-4 h-4" /> New Announcement
        </Button>
      </SheetTrigger>
      <SheetContent className="w-105 sm:w-130 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Announcement</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Content</label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="Announcement body…" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Visible To</label>
            <Select value={visibleTo} onValueChange={setVisibleTo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="members">Members only</SelectItem>
                <SelectItem value="executives">Executives only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Pin this announcement</label>
            <Switch checked={isPinned} onCheckedChange={setIsPinned} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Expiry Date (optional)</label>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
          <Button
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !title || !content}
          >
            {mutation.isPending ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
