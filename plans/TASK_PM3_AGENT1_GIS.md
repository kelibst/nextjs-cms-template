# TASK — Agent 1: GIS Member Map Feature
> PM-assigned task. Read AGENT_CONTEXT.md first for all project rules (middleware, bun, migrations).
> When done, update the STATUS section at the bottom of this file.

---

## GOAL
Add an interactive map to the **dashboard** and **member directory** that plots GAPHTO members by their Ghana region, using clustered pins.

---

## ARCHITECTURE DECISION

**Library:** `react-leaflet` + `leaflet` (open source, no API key, uses OpenStreetMap tiles)
- Install: `bun add react-leaflet leaflet` and `bun add -d @types/leaflet`
- Leaflet requires dynamic import in Next.js (no SSR) — use `next/dynamic` with `ssr: false`
- Leaflet CSS must be imported: `import 'leaflet/dist/leaflet.css'`

**No geocoding API needed.** Use the static Ghana region centroids below. Members already have a `region` field in the `members` table. Group members by region and plot one pin per region with a count badge.

**Ghana Region Centroids (16 regions post-2019):**
```typescript
export const GHANA_REGION_CENTROIDS: Record<string, [number, number]> = {
  'Greater Accra':    [5.6037, -0.1870],
  'Ashanti':          [6.7470, -1.5209],
  'Western':          [5.0925, -2.3079],
  'Central':          [5.5557, -1.0700],
  'Eastern':          [6.5744, -0.4614],
  'Northern':         [9.5415, -0.9062],
  'Upper East':       [10.7551, -0.0099],
  'Upper West':       [10.2527, -2.1368],
  'Volta':            [7.0000,  0.5000],
  'Brong-Ahafo':      [7.9408, -1.7680],
  'Bono':             [7.9408, -2.2332],
  'Bono East':        [7.7513, -1.0500],
  'Ahafo':            [7.1951, -2.1968],
  'Savannah':         [8.6705, -1.6167],
  'North East':       [10.4806,-0.4250],
  'Oti':              [7.9000,  0.2000],
  'Western North':    [6.3500, -2.6000],
}
```

---

## DATABASE CHANGES

**No new table needed.** The `members` table already has the `region` text field.

However, add two optional fields to `members` for facility-level precision (optional, future use):
- `latitude` numeric(10, 6) — nullable
- `longitude` numeric(10, 6) — nullable

### Schema Change (drizzle/schema.ts)
In the `members` table pgTable definition, add after the `facility` field:
```typescript
latitude:  numeric('latitude',  { precision: 10, scale: 6 }),
longitude: numeric('longitude', { precision: 10, scale: 6 }),
```

Run migration after:
```bash
bunx drizzle-kit generate --config=drizzle/drizzle.config.ts
bunx tsx drizzle/migrate.ts
```

---

## FILES TO CREATE

### 1. Ghana Centroids Constant
**`src/lib/ghana-regions.ts`**
- Export `GHANA_REGION_CENTROIDS` record (as above)
- Export `GHANA_REGIONS` string array (sorted list of all 17 region names)
- Export helper: `getRegionCentroid(region: string): [number, number] | null`
  - Fuzzy match: trim, lowercase compare, return null if not found
  - Fallback for unknown regions: Ghana center `[7.9465, -1.0232]`

### 2. Map Component (client-only)
**`src/components/dashboard/members-map.tsx`**
- `'use client'` directive
- Dynamic import of react-leaflet (no SSR)
- Props: `members: { id: string; name: string; region: string | null; specialty: string | null; membershipStatus: string }[]`
- Group members by region → count per region
- Render `<MapContainer>` centered on Ghana `[7.9465, -1.0232]` zoom 7
- TileLayer: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` (attribution required)
- One `<CircleMarker>` per region that has members:
  - Radius scaled by count (min 12, max 30): `Math.min(12 + count * 2, 30)`
  - Color: `#166534` (GAPHTO green) for active majority, `#dc2626` for suspended majority
  - `<Popup>` shows: region name, member count, breakdown by specialty
- If a member has `latitude`/`longitude` set, also plot an individual pin (smaller, `<Marker>`)
- Height: `h-[500px]` wrapper div, full width

### 3. Map Wrapper (handles dynamic import + Leaflet CSS)
**`src/components/dashboard/members-map-wrapper.tsx`**
- `'use client'` directive  
- Dynamically imports `members-map.tsx` with `{ ssr: false }`
- Shows a skeleton loader while loading: `<div className="h-[500px] bg-muted animate-pulse rounded-lg" />`
- This is what dashboard pages import (never import `members-map.tsx` directly)

---

## DASHBOARD INTEGRATION

### Dashboard Members Page
**`src/app/(dashboard)/dashboard/members/page.tsx`** — add a map view tab

Current page lists members in a table. Add a `<Tabs>` component:
- Tab 1: "List" — existing table view (no changes to existing logic)
- Tab 2: "Map" — renders `<MembersMapWrapper members={members} />`

The page already fetches members from the DB. Pass the same data to the map component.

Add to the existing fetch query — also select `latitude` and `longitude` from the members join.

---

## MEMBER DIRECTORY INTEGRATION

### Member Directory Page
**`src/app/(member)/member-centre/directory/page.tsx`**

Add a map toggle button in the top-right of the directory header:
- Two icon buttons: grid icon (List) and map icon (Map) — use Lucide `LayoutGrid` and `Map` icons
- State: `const [view, setView] = useState<'list' | 'map'>('list')`
- When `view === 'map'`: render `<MembersMapWrapper>` (use a client-side wrapper since page is server component)
- Create **`src/components/member/member-directory-client.tsx`** update — this component already exists; add the view toggle + conditional map render to it

---

## PROXY ROUTE UPDATE (src/proxy.ts)
No changes needed — map pages are under existing protected routes.

---

## PACKAGE INSTALL COMMAND
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bun add react-leaflet leaflet
bun add -d @types/leaflet
```

---

## IMPLEMENTATION ORDER
1. Install packages
2. Add lat/lng columns to schema → generate + run migration
3. Create `src/lib/ghana-regions.ts`
4. Create `members-map.tsx` (core map component)
5. Create `members-map-wrapper.tsx` (dynamic import wrapper)
6. Integrate into `/dashboard/members/page.tsx` with Tabs
7. Integrate into member directory client component
8. Verify no SSR errors (Leaflet requires client-only)

---

## IMPORTANT NOTES
- Leaflet uses `window` object — MUST use `next/dynamic` with `ssr: false`. Never import Leaflet in a server component.
- The default Leaflet marker icon has a known issue with Webpack — use `CircleMarker` instead of `Marker` for region clusters (avoids icon path issues)
- If individual member markers are needed, fix icon paths: import `L` and set `L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })` 
- Leaflet CSS must be imported inside the client component: `import 'leaflet/dist/leaflet.css'`
- Test login: `member@gaphto.org / Test1234!`, dev server: `bun dev`
- Working directory: `/home/kelib/Desktop/moreprojects/gaphto`

---

## STATUS
- [x] Packages installed (`react-leaflet@5.0.0`, `leaflet@1.9.4`, `@types/leaflet@1.9.21`)
- [x] Schema updated + migration run (`drizzle/migrations/0004_worried_siren.sql` — adds `latitude` + `longitude` numeric(10,6) to `members`)
- [x] `ghana-regions.ts` created (`src/lib/ghana-regions.ts`)
- [x] Map component created (`src/components/dashboard/members-map.tsx` + wrapper `members-map-wrapper.tsx`)
- [x] Dashboard members page updated — added `src/components/dashboard/members-page-client.tsx` (client wrapper with Tabs: List / Map)
- [x] Member directory updated — `MemberDirectoryClient` now has LayoutGrid / Map icon toggle; map renders `MembersMapWrapper` via `next/dynamic` with `ssr: false`
- [x] Verified no SSR errors — `bun run build` passes cleanly (83 pages, 0 TypeScript errors)
- [x] **Agent notes:**
  - Dashboard members page is a server component so a thin client wrapper (`members-page-client.tsx`) was created to host the `<Tabs>` state; the server component renders the table JSX and passes it as `tableContent` prop (React node). This avoids converting the whole page to a client component.
  - `MembersMapWrapper` is imported via `next/dynamic` inside `member-directory-client.tsx` directly (no extra wrapper file needed for the directory) to avoid double-dynamic-import layering.
  - Leaflet default marker icon webpack issue resolved with `L.Icon.Default.mergeOptions` pattern; `CircleMarker` used for region clusters per task spec.
  - All `h-[500px]` and `min-w-[160px]` arbitrary Tailwind classes replaced with canonical `h-125` / `min-w-40` per IDE linter hints.
