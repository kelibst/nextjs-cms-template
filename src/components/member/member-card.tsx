import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building2 } from 'lucide-react'

const SPECIALTY_LABELS: Record<string, string> = {
  'disease-control': 'Disease Control',
  'health-information': 'Health Information Management',
  nutrition: 'Nutrition',
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase()
}

export interface MemberCardProps {
  id: string
  name: string
  specialty: 'disease-control' | 'health-information' | 'nutrition' | null
  region: string | null
  facility: string | null
  membershipStatus: 'active' | 'inactive' | 'suspended'
}

export function MemberCard({
  name,
  specialty,
  region,
  facility,
  membershipStatus,
}: MemberCardProps) {
  const initials = getInitials(name)
  const specialtyLabel = specialty ? SPECIALTY_LABELS[specialty] : null

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header: avatar + name + status */}
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarFallback className="bg-primary-hover text-sm font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{name}</p>
          <div className="mt-1">
            {membershipStatus === 'active' ? (
              <Badge className="border-green-200 bg-green-100 text-xs text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                Active
              </Badge>
            ) : membershipStatus === 'suspended' ? (
              <Badge className="border-red-200 bg-red-100 text-xs text-red-600 hover:bg-red-100">
                Suspended
              </Badge>
            ) : (
              <Badge className="border-border bg-muted text-xs text-muted-foreground hover:bg-muted">
                Inactive
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Specialty badge */}
      {specialtyLabel && (
        <Badge className="w-fit border-green-300 bg-green-50 text-xs text-green-800 hover:bg-green-50 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
          {specialtyLabel}
        </Badge>
      )}

      {/* Region + Facility */}
      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        {region && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate">{region}</span>
          </div>
        )}
        {facility && (
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate text-xs">{facility}</span>
          </div>
        )}
      </div>
    </div>
  )
}
