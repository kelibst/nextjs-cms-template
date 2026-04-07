'use client'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { LayoutList, Map } from 'lucide-react'
import MembersMapWrapper from '@/components/dashboard/members-map-wrapper'
import type { MapMember } from '@/components/dashboard/members-map'

interface MembersPageClientProps {
  tableContent: React.ReactNode
  members: MapMember[]
  totalCount: number
}

export function MembersPageClient({
  tableContent,
  members,
  totalCount,
}: MembersPageClientProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground">{totalCount} registered</p>
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list" className="flex items-center gap-1.5">
            <LayoutList className="h-3.5 w-3.5" />
            List
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-1.5">
            <Map className="h-3.5 w-3.5" />
            Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {tableContent}
        </TabsContent>

        <TabsContent value="map">
          <MembersMapWrapper members={members} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
