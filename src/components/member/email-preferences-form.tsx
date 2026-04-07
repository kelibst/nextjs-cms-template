'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { updateEmailPreferences } from '@/app/actions/email-preferences'

interface EmailPreferencesFormProps {
  initialNewsletter: boolean
  initialEventAlerts: boolean
}

export function EmailPreferencesForm({ initialNewsletter, initialEventAlerts }: EmailPreferencesFormProps) {
  const [receiveNewsletter, setReceiveNewsletter] = useState(initialNewsletter)
  const [receiveEventAlerts, setReceiveEventAlerts] = useState(initialEventAlerts)

  const mutation = useMutation({
    mutationFn: () => updateEmailPreferences({ receiveNewsletter, receiveEventAlerts }),
    onSuccess: () => toast.success('Email preferences saved'),
    onError: () => toast.error('Failed to save preferences'),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">GAPHTO newsletters</p>
          <p className="text-xs text-muted-foreground">Receive periodic newsletters from GAPHTO</p>
        </div>
        <Switch
          checked={receiveNewsletter}
          onCheckedChange={setReceiveNewsletter}
          aria-label="Receive newsletters"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Event alerts</p>
          <p className="text-xs text-muted-foreground">Get notified when new events are published</p>
        </div>
        <Switch
          checked={receiveEventAlerts}
          onCheckedChange={setReceiveEventAlerts}
          aria-label="Receive event alerts"
        />
      </div>

      <Button
        size="sm"
        className="bg-primary hover:bg-primary-hover text-primary-foreground"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Saving…' : 'Save Preferences'}
      </Button>
    </div>
  )
}
