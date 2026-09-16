/** Mirrors `CityIngestRequestDto` (backend-api-contract.md §4, "ingestion
 * module"). Request-only, built by us, so plain optional fields are fine
 * (the `Nullable<T>` convention is for response fields the backend might
 * omit, not for bodies we construct ourselves). */
export interface CityIngestRequestDto {
  city: string
  country?: string
  dryRun: boolean
}

/** Mirrors `RadiusIngestRequestDto`. */
export interface RadiusIngestRequestDto {
  latitude: number
  longitude: number
  radiusMeters: number
  defaultCity?: string
  defaultCountry?: string
  dryRun: boolean
}

/** Mirrors `BboxIngestRequestDto`. */
export interface BboxIngestRequestDto {
  south: number
  west: number
  north: number
  east: number
  defaultCity?: string
  defaultCountry?: string
  dryRun: boolean
}

/** Mirrors `IngestionSummaryDto` — the shared response shape for all three
 * `/admin/ingest/osm/*` endpoints. */
export interface IngestionSummaryDto {
  totalElementsFetched: number
  mosquesInserted: number
  duplicatesSkipped: number
  facilitiesAttached: number
  dryRun: boolean
  insertedMosqueNames: string[]
  durationMs: number
}

export type IngestMode = 'CITY' | 'RADIUS' | 'BBOX'
