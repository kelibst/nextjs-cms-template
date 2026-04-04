'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiRequest } from '@/lib/api'
import { createLeadership, updateLeadership } from '@/app/actions/leadership'
import type { Leadership } from '../../../drizzle/schema'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

interface LeadershipFormProps {
  leader?: Leadership
}

export function LeadershipForm({ leader }: LeadershipFormProps) {
  const router = useRouter()
  const [name, setName] = useState(leader?.name ?? '')
  const [role, setRole] = useState(leader?.role ?? '')
  const [sortOrder, setSortOrder] = useState(leader?.sortOrder ?? 0)
  const [bio, setBio] = useState(leader?.bio ?? '')
  const [email, setEmail] = useState(leader?.email ?? '')
  const [facebookUrl, setFacebookUrl] = useState(leader?.facebookUrl ?? '')
  const [twitterUrl, setTwitterUrl] = useState(leader?.twitterUrl ?? '')
  const [imageUrl, setImageUrl] = useState(leader?.imageUrl ?? '')
  const [isActive, setIsActive] = useState(leader?.isActive ?? true)
  const [termStart, setTermStart] = useState(
    leader?.termStart ? new Date(leader.termStart).toISOString().split('T')[0] : ''
  )
  const [termEnd, setTermEnd] = useState(
    leader?.termEnd ? new Date(leader.termEnd).toISOString().split('T')[0] : ''
  )

  const isEdit = !!leader

  const mutation = useMutation({
    mutationFn: async () => {
      const body = { name, role, sortOrder, bio, email, facebookUrl, twitterUrl, imageUrl, isActive, termStart: termStart || null, termEnd: termEnd || null }
      if (leader) {
        return updateLeadership(leader.id, body)
      } else {
        return createLeadership(body)
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Member updated' : 'Member added')
      router.push('/dashboard/leadership')
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
    setImageUrl(data.url)
  }

  const handleSave = () => {
    if (!name || !role) return
    mutation.mutate()
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Name *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Title / Role *</label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. President" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Sort Order</label>
          <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Photo</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
        {imageUrl && (
          <img src={imageUrl} alt="Preview" className="mt-2 w-20 h-20 rounded-full object-cover border" />
        )}
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Bio</label>
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Short biography…" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Facebook URL</label>
          <Input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/…" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Twitter/X URL</label>
          <Input value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://x.com/…" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Term Start</label>
          <Input type="date" value={termStart} onChange={(e) => setTermStart(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Term End</label>
          <Input type="date" value={termEnd} onChange={(e) => setTermEnd(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
        <label className="text-sm font-medium">Active</label>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>
      <div className="flex gap-3">
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground" onClick={handleSave} disabled={mutation.isPending || !name || !role}>
          {mutation.isPending ? 'Saving…' : isEdit ? 'Update' : 'Add Member'}
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/leadership')}>Cancel</Button>
      </div>
    </div>
  )
}
