'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { saveSettings } from '@/app/actions/settings'

interface SettingsFormProps {
  settings: Record<string, string>
}

const FIELDS = [
  { key: 'org_name', label: 'Organisation Name', group: 'Organisation' },
  { key: 'tagline', label: 'Tagline', group: 'Organisation' },
  { key: 'contact_email', label: 'Contact Email', group: 'Contact' },
  { key: 'contact_phone', label: 'Contact Phone', group: 'Contact' },
  { key: 'contact_address', label: 'Address', group: 'Contact' },
  { key: 'social_facebook', label: 'Facebook URL', group: 'Social' },
  { key: 'social_twitter', label: 'Twitter/X URL', group: 'Social' },
  { key: 'social_youtube', label: 'YouTube URL', group: 'Social' },
]

export function SettingsForm({ settings }: SettingsFormProps) {
  const [values, setValues] = useState<Record<string, string>>(settings)

  const mutation = useMutation({
    mutationFn: (data: Record<string, string>) => saveSettings(data),
    onSuccess: () => toast.success('Settings saved'),
    onError: () => toast.error('Failed to save settings'),
  })

  const groups = [...new Set(FIELDS.map((f) => f.group))]

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group} className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">{group}</h2>
          {FIELDS.filter((f) => f.group === group).map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-sm text-muted-foreground">{field.label}</label>
              <Input
                value={values[field.key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                placeholder={field.label}
              />
            </div>
          ))}
        </div>
      ))}

      <div className="flex items-center gap-3">
        <Button
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
          onClick={() => mutation.mutate(values)}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
