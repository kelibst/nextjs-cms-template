export const GHANA_REGION_CENTROIDS: Record<string, [number, number]> = {
  'Greater Accra':  [5.6037, -0.1870],
  'Ashanti':        [6.7470, -1.5209],
  'Western':        [5.0925, -2.3079],
  'Central':        [5.5557, -1.0700],
  'Eastern':        [6.5744, -0.4614],
  'Northern':       [9.5415, -0.9062],
  'Upper East':     [10.7551, -0.0099],
  'Upper West':     [10.2527, -2.1368],
  'Volta':          [7.0000,  0.5000],
  'Brong-Ahafo':    [7.9408, -1.7680],
  'Bono':           [7.9408, -2.2332],
  'Bono East':      [7.7513, -1.0500],
  'Ahafo':          [7.1951, -2.1968],
  'Savannah':       [8.6705, -1.6167],
  'North East':     [10.4806, -0.4250],
  'Oti':            [7.9000,  0.2000],
  'Western North':  [6.3500, -2.6000],
}

/** Sorted list of all Ghana region names */
export const GHANA_REGIONS: string[] = Object.keys(GHANA_REGION_CENTROIDS).sort()

const GHANA_CENTER: [number, number] = [7.9465, -1.0232]

/**
 * Return the [lat, lng] centroid for a given region name.
 * Fuzzy-matches by trimming and lowercasing.
 * Falls back to Ghana centre if not found.
 */
export function getRegionCentroid(region: string): [number, number] | null {
  if (!region) return null
  const normalised = region.trim().toLowerCase()
  const match = Object.entries(GHANA_REGION_CENTROIDS).find(
    ([key]) => key.trim().toLowerCase() === normalised,
  )
  return match ? match[1] : GHANA_CENTER
}
