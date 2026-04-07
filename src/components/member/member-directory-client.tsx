'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MemberCard, type MemberCardProps } from '@/components/member/member-card'
import { Search, Users, LayoutGrid, Map } from 'lucide-react'
import dynamic from 'next/dynamic'

const MembersMapWrapper = dynamic(
  () => import('@/components/dashboard/members-map-wrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="h-125 w-full animate-pulse rounded-xl bg-muted" />
    ),
  },
)

const GHANA_REGIONS = [
  'Ahafo',
  'Ashanti',
  'Bono',
  'Bono East',
  'Central',
  'Eastern',
  'Greater Accra',
  'North East',
  'Northern',
  'Oti',
  'Savannah',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
  'Western North',
]

const SPECIALTIES = [
  { value: 'disease-control', label: 'Disease Control' },
  { value: 'health-information', label: 'Health Information Management' },
  { value: 'nutrition', label: 'Nutrition' },
]

interface MemberDirectoryClientProps {
  initialMembers: MemberCardProps[]
  initialQ?: string
  initialSpecialty?: string
  initialRegion?: string
}

type ViewMode = 'list' | 'map'

export function MemberDirectoryClient({
  initialMembers,
  initialQ = '',
  initialSpecialty = '',
  initialRegion = '',
}: MemberDirectoryClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [view, setView] = useState<ViewMode>('list')

  const buildUrl = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      return `${pathname}?${params.toString()}`
    },
    [pathname, searchParams],
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      router.push(buildUrl('q', value))
    }, 300)
  }

  const handleSpecialtyChange = (value: string) => {
    router.push(buildUrl('specialty', value === 'all' ? '' : value))
  }

  const handleRegionChange = (value: string) => {
    router.push(buildUrl('region', value === 'all' ? '' : value))
  }

  // Shape members for the map component
  const mapMembers = initialMembers.map((m) => ({
    id: m.id,
    name: m.name ?? null,
    region: m.region ?? null,
    specialty: m.specialty ?? null,
    membershipStatus: m.membershipStatus,
  }))

  return (
    <div>
      {/* Filters + view toggle */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            type="search"
            placeholder="Search by name..."
            defaultValue={initialQ}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        <Select
          defaultValue={initialSpecialty || 'all'}
          onValueChange={handleSpecialtyChange}
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="All Specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {SPECIALTIES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={initialRegion || 'all'}
          onValueChange={handleRegionChange}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {GHANA_REGIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-muted p-1">
          <button
            type="button"
            onClick={() => setView('list')}
            aria-label="List view"
            className={`rounded-md p-1.5 transition-colors ${
              view === 'list'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setView('map')}
            aria-label="Map view"
            className={`rounded-md p-1.5 transition-colors ${
              view === 'map'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Map className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === 'map' ? (
        <MembersMapWrapper members={mapMembers} />
      ) : (
        <>
          {/* Results count */}
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              Showing <strong className="text-foreground">{initialMembers.length}</strong>{' '}
              {initialMembers.length === 1 ? 'member' : 'members'}
            </span>
          </div>

          {/* Member grid */}
          {initialMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium text-muted-foreground">No members found</p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {initialMembers.map((member) => (
                <MemberCard key={member.id} {...member} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
