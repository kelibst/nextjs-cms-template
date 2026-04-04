'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
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
import { deleteAlbum } from '@/app/actions/gallery'

export function AlbumDeleteButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: () => deleteAlbum(id),
    onSuccess: () => {
      toast.success('Album deleted')
      setOpen(false)
      router.push('/dashboard/gallery')
    },
    onError: () => toast.error('Failed to delete album'),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete album?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The album and all its images will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
