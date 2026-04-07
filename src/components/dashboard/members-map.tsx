'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from 'react-leaflet'
import L from 'leaflet'
import { GHANA_REGION_CENTROIDS } from '@/lib/ghana-regions'

// Fix default Leaflet marker icon paths broken by Webpack bundling
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
})

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MapMember {
  id: string
  name: string | null
  region: string | null
  specialty: string | null
  membershipStatus: string
  latitude?: string | null
  longitude?: string | null
}

interface RegionGroup {
  centroid: [number, number]
  count: number
  activeCount: number
  suspendedCount: number
  specialtyBreakdown: Record<string, number>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GHANA_CENTER: [number, number] = [7.9465, -1.0232]

function groupByRegion(members: MapMember[]): Record<string, RegionGroup> {
  const groups: Record<string, RegionGroup> = {}

  for (const m of members) {
    const region = m.region?.trim() || 'Unknown'
    const centroid = GHANA_REGION_CENTROIDS[region]
    if (!centroid) continue // skip members with completely unknown regions

    if (!groups[region]) {
      groups[region] = {
        centroid,
        count: 0,
        activeCount: 0,
        suspendedCount: 0,
        specialtyBreakdown: {},
      }
    }

    const g = groups[region]
    g.count += 1
    if (m.membershipStatus === 'active') g.activeCount += 1
    if (m.membershipStatus === 'suspended') g.suspendedCount += 1

    const spec = m.specialty ?? 'Other'
    g.specialtyBreakdown[spec] = (g.specialtyBreakdown[spec] ?? 0) + 1
  }

  return groups
}

const SPECIALTY_LABELS: Record<string, string> = {
  'disease-control':   'Disease Control',
  'health-information': 'Health Information',
  'nutrition':         'Nutrition',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MembersMapProps {
  members: MapMember[]
}

export default function MembersMap({ members }: MembersMapProps) {
  const regionGroups = groupByRegion(members)

  // Members with precise coordinates for individual pins
  const preciseMembers = members.filter(
    (m) => m.latitude && m.longitude,
  )

  return (
    <div className="h-125 w-full overflow-hidden rounded-xl border border-border">
      <MapContainer
        center={GHANA_CENTER}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* One CircleMarker per region */}
        {Object.entries(regionGroups).map(([region, group]) => {
          const radius = Math.min(12 + group.count * 2, 30)
          // Green if active majority; red if suspended majority
          const color =
            group.suspendedCount > group.activeCount ? '#dc2626' : '#166534'

          return (
            <CircleMarker
              key={region}
              center={group.centroid}
              radius={radius}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.75,
                color: '#fff',
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-40">
                  <p className="font-semibold text-sm mb-1">{region}</p>
                  <p className="text-xs text-gray-600 mb-2">
                    {group.count} {group.count === 1 ? 'member' : 'members'}
                  </p>
                  <div className="text-xs space-y-0.5">
                    {Object.entries(group.specialtyBreakdown).map(([spec, cnt]) => (
                      <div key={spec} className="flex justify-between gap-4">
                        <span className="text-gray-500">
                          {SPECIALTY_LABELS[spec] ?? spec}
                        </span>
                        <span className="font-medium">{cnt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}

        {/* Individual precise-location markers */}
        {preciseMembers.map((m) => (
          <Marker
            key={m.id}
            position={[parseFloat(m.latitude!), parseFloat(m.longitude!)]}
          >
            <Popup>
              <p className="font-semibold text-sm">{m.name ?? 'Member'}</p>
              <p className="text-xs text-gray-500">
                {m.specialty ? (SPECIALTY_LABELS[m.specialty] ?? m.specialty) : '—'}
              </p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
