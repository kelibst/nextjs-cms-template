'use client'

import dynamic from 'next/dynamic'
import type { MapMember } from './members-map'

const MembersMap = dynamic(() => import('./members-map'), {
  ssr: false,
  loading: () => (
    <div className="h-125 w-full animate-pulse rounded-xl bg-muted" />
  ),
})

interface MembersMapWrapperProps {
  members: MapMember[]
}

export default function MembersMapWrapper({ members }: MembersMapWrapperProps) {
  return <MembersMap members={members} />
}
