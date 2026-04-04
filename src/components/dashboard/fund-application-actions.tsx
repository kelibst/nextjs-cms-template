'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { reviewApplication } from '@/app/actions/fund'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface FundApplicationActionsProps {
  applicationId: string
  currentStatus: string
}

type ReviewStatus = 'reviewing' | 'approved' | 'rejected'

export function FundApplicationActions({
  applicationId,
  currentStatus,
}: FundApplicationActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<ReviewStatus | null>(null)
  const [notes, setNotes] = useState('')

  const mutation = useMutation({
    mutationFn: ({ status, reviewNotes }: { status: ReviewStatus; reviewNotes?: string }) =>
      reviewApplication(applicationId, status, reviewNotes),
    onSuccess: () => {
      toast.success('Application status updated')
      setOpen(false)
      setNotes('')
      router.refresh()
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update status'),
  })

  const openDialog = (status: ReviewStatus) => {
    setPendingStatus(status)
    setNotes('')
    setOpen(true)
  }

  const handleConfirm = () => {
    if (!pendingStatus) return
    mutation.mutate({ status: pendingStatus, reviewNotes: notes || undefined })
  }

  const statusLabel: Record<ReviewStatus, string> = {
    reviewing: 'Mark as Reviewing',
    approved: 'Approve',
    rejected: 'Reject',
  }

  const statusColor: Record<ReviewStatus, string> = {
    reviewing: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    approved: 'bg-primary-subtle text-primary hover:bg-primary-muted',
    rejected: 'bg-red-50 text-red-600 hover:bg-red-100',
  }

  const confirmColor: Record<ReviewStatus, string> = {
    reviewing: 'bg-blue-600 hover:bg-blue-700 text-white',
    approved: 'bg-primary hover:bg-primary-hover text-primary-foreground',
    rejected: 'bg-red-600 hover:bg-red-700 text-white',
  }

  const available: ReviewStatus[] = ['reviewing', 'approved', 'rejected'].filter(
    (s) => s !== currentStatus,
  ) as ReviewStatus[]

  return (
    <>
      <div className="flex items-center gap-1.5">
        {available.map((s) => (
          <button
            key={s}
            onClick={() => openDialog(s)}
            className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${statusColor[s]}`}
          >
            {statusLabel[s]}
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {pendingStatus === 'rejected' ? 'Reject Application' :
               pendingStatus === 'approved' ? 'Approve Application' :
               'Mark as Reviewing'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              {pendingStatus === 'rejected'
                ? 'Please provide a reason for rejection (optional).'
                : pendingStatus === 'approved'
                ? 'Add any notes for the applicant (optional).'
                : 'Add an internal note (optional).'}
            </p>
            <textarea
              rows={3}
              placeholder="Review notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${pendingStatus ? confirmColor[pendingStatus] : ''}`}
            >
              {mutation.isPending ? 'Saving…' : 'Confirm'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
