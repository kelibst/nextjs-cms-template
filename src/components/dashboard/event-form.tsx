'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiRequest } from '@/lib/api'
import { createEvent, updateEvent } from '@/app/actions/events'
import type { Event } from '../../../drizzle/schema'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

function toDatetimeLocal(d: Date | null | undefined) {
  if (!d) return ''
  return new Date(d).toISOString().slice(0, 16)
}

interface EventFormProps {
  event?: Event
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [location, setLocation] = useState(event?.location ?? '')
  const [isOnline, setIsOnline] = useState(event?.isOnline ?? false)
  const [startDate, setStartDate] = useState(toDatetimeLocal(event?.startDate))
  const [endDate, setEndDate] = useState(toDatetimeLocal(event?.endDate))
  const [regDeadline, setRegDeadline] = useState(
    event?.registrationDeadline ? new Date(event.registrationDeadline).toISOString().split('T')[0] : ''
  )
  const [priceGhs, setPriceGhs] = useState(event?.priceGhs ? String(event.priceGhs) : '0')
  const [maxAttendees, setMaxAttendees] = useState(event?.maxAttendees ? String(event.maxAttendees) : '')
  const [status, setStatus] = useState(event?.status ?? 'upcoming')
  const [featuredImage, setFeaturedImage] = useState(event?.featuredImage ?? '')

  const isEdit = !!event

  const mutation = useMutation({
    mutationFn: async () => {
      const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const body = {
        title,
        slug: event?.slug ?? slugify(title) + '-' + Date.now(),
        description,
        location: isOnline ? null : location,
        isOnline,
        startDate: startDate || null,
        endDate: endDate || null,
        registrationDeadline: regDeadline || null,
        priceGhs: priceGhs || '0',
        maxAttendees: maxAttendees ? Number(maxAttendees) : null,
        status,
        featuredImage: featuredImage || null,
      }
      if (event) {
        return updateEvent(event.id, body)
      } else {
        return createEvent(body)
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Event updated' : 'Event created')
      router.push('/dashboard/events')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const data = await apiRequest<{ url: string }>('/api/upload', { method: 'POST', body: fd })
    setFeaturedImage(data.url)
  }

  const handleSave = () => {
    if (!title) return
    mutation.mutate()
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="space-y-1">
        <label className="text-sm font-medium">Title *</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </div>

      <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
        <label className="text-sm font-medium">Online Event</label>
        <Switch checked={isOnline} onCheckedChange={setIsOnline} />
      </div>

      {!isOnline && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Location</label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue address" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Start Date & Time</label>
          <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">End Date & Time</label>
          <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Registration Deadline</label>
          <Input type="date" value={regDeadline} onChange={(e) => setRegDeadline(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Price (GHS)</label>
          <Input type="number" min="0" step="0.01" value={priceGhs} onChange={(e) => setPriceGhs(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Max Attendees</label>
          <Input type="number" min="1" value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)} placeholder="Unlimited" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Status</label>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="past">Past</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Featured Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
        {featuredImage && (
          <img src={featuredImage} alt="Featured" className="mt-2 h-28 w-full object-cover rounded-lg border" />
        )}
      </div>

      <div className="flex gap-3">
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground" onClick={handleSave} disabled={mutation.isPending || !title}>
          {mutation.isPending ? 'Saving…' : isEdit ? 'Update Event' : 'Create Event'}
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/events')}>Cancel</Button>
      </div>
    </div>
  )
}
