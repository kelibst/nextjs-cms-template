'use client'

import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { updateMemberStatus } from '@/app/actions/members'

interface MemberStatusToggleProps {
  memberId: string
  currentStatus: string
}

export function MemberStatusToggle({ memberId, currentStatus }: MemberStatusToggleProps) {
  const [status, setStatus] = useState(currentStatus)
  const previousStatusRef = useRef(currentStatus)
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (newStatus: string) => updateMemberStatus(memberId, newStatus),
    onSuccess: () => {
      toast.success('Status updated')
      router.refresh()
    },
    onError: () => {
      setStatus(previousStatusRef.current)
      toast.error('Failed to update status')
    },
  })

  const handleChange = (val: string) => {
    previousStatusRef.current = status
    setStatus(val)
    mutation.mutate(val)
  }

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className="h-7 text-xs w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="inactive">Inactive</SelectItem>
        <SelectItem value="suspended">Suspended</SelectItem>
      </SelectContent>
    </Select>
  )
}
