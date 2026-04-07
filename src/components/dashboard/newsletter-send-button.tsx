'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { sendNewsletter } from '@/app/actions/newsletter'

interface Props {
  id: string
  subject: string
}

export function NewsletterSendButton({ id, subject }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: () => sendNewsletter(id),
    onSuccess: () => {
      toast.success('Newsletter sent!')
      setOpen(false)
      router.refresh()
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to send')
      setOpen(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-primary hover:text-primary hover:bg-primary-subtle">
          <Send className="w-3.5 h-3.5" /> Send
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send newsletter?</DialogTitle>
          <DialogDescription>
            <strong>{subject}</strong> will be sent to all opted-in active members. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            className="bg-primary hover:bg-primary-hover text-primary-foreground gap-1.5"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            <Send className="w-4 h-4" />
            {mutation.isPending ? 'Sending…' : 'Send to All Members'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
