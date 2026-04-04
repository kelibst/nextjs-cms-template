'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { ContactSubmission } from '../../../drizzle/schema'
import { cn } from '@/lib/utils'
import { Mail, ExternalLink } from 'lucide-react'
import { markMessageRead } from '@/app/actions/contact'

interface ContactInboxProps {
  messages: ContactSubmission[]
}

export function ContactInbox({ messages }: ContactInboxProps) {
  const [selected, setSelected] = useState<ContactSubmission | null>(messages[0] ?? null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [localMessages, setLocalMessages] = useState(messages)
  const router = useRouter()

  const filtered = filter === 'unread' ? localMessages.filter((m) => !m.isRead) : localMessages

  const readMutation = useMutation({
    mutationFn: (id: string) => markMessageRead(id),
    onSuccess: (_, id) => {
      setLocalMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m))
    },
    onError: () => {
      toast.error('Failed to mark as read')
      router.refresh()
    },
  })

  const handleSelect = (msg: ContactSubmission) => {
    setSelected(msg)
    if (!msg.isRead) {
      readMutation.mutate(msg.id)
    }
  }

  return (
    <div className="flex bg-card rounded-xl border border-border overflow-hidden h-[calc(100vh-180px)]">
      {/* List panel */}
      <div className="w-80 shrink-0 border-r border-border flex flex-col">
        {/* Filter */}
        <div className="p-3 border-b border-border/50 flex gap-2">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'text-xs font-medium px-3 py-1 rounded-full transition-colors',
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {f === 'all' ? 'All' : 'Unread'}
            </button>
          ))}
        </div>
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground/70 p-4">No messages.</p>
          ) : (
            filtered.map((msg) => (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg)}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors',
                  selected?.id === msg.id && 'bg-primary-subtle',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('text-sm truncate', !msg.isRead ? 'font-semibold text-foreground' : 'text-foreground/80')}>
                    {msg.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!msg.isRead && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                    <span className="text-[10px] text-muted-foreground/70">
                      {new Date(msg.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.subject ?? '(no subject)'}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        {!selected ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <Mail className="w-8 h-8 mr-2" /> Select a message
          </div>
        ) : (
          <div className="max-w-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selected.subject ?? '(no subject)'}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  From: <span className="font-medium text-foreground/80">{selected.name}</span> &lt;{selected.email}&gt;
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {new Date(selected.submittedAt).toLocaleString()}
                </p>
              </div>
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject ?? ''}`}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium"
              >
                <ExternalLink className="w-4 h-4" /> Reply by Email
              </a>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
              {selected.message}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
