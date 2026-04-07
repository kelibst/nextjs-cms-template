'use client'

import { useState } from 'react'
import { updateUserProfile } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EditProfileFormProps {
  currentName: string
}

export function EditProfileForm({ currentName }: EditProfileFormProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(currentName)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty.')
      return
    }
    setPending(true)
    setError(null)
    const result = await updateUserProfile({ name: name.trim() })
    setPending(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      setOpen(false)
    }
  }

  const handleCancel = () => {
    setName(currentName)
    setError(null)
    setOpen(false)
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="border border-border bg-card text-foreground hover:bg-muted"
      >
        Edit Profile
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-3 min-w-50">
      <div className="flex flex-col gap-1">
        <Label htmlFor="edit-name" className="text-sm font-medium text-foreground">
          Full Name
        </Label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          disabled={pending}
          className="h-9"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={pending}>
          {pending ? 'Saving…' : 'Save'}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
