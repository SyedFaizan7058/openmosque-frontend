import { axiosInstance } from '@/lib/axiosInstance'
import type {
  BboxIngestRequestDto,
  CityIngestRequestDto,
  IngestionSummaryDto,
  RadiusIngestRequestDto,
} from '@/features/ingestion/types'

/** OSM ingestion API — `OsmIngestionController`, all three endpoints
 * MODERATOR|SUPER_ADMIN (backend-api-contract.md §5). `dryRun: true`
 * parses and returns the summary without writing to the database, per the
 * "OSM ingestion specifics" note in §6 — used here as a mandatory
 * "preview before import" step (see `schemas.ts`). */

/** `POST /api/v1/admin/ingest/osm/city`. */
export async function ingestByCity(body: CityIngestRequestDto): Promise<IngestionSummaryDto> {
  const result = await axiosInstance.post('/admin/ingest/osm/city', body)
  return result as unknown as IngestionSummaryDto
}

/** `POST /api/v1/admin/ingest/osm/radius`. */
export async function ingestByRadius(body: RadiusIngestRequestDto): Promise<IngestionSummaryDto> {
  const result = await axiosInstance.post('/admin/ingest/osm/radius', body)
  return result as unknown as IngestionSummaryDto
}

/** `POST /api/v1/admin/ingest/osm/bbox`. */
export async function ingestByBbox(body: BboxIngestRequestDto): Promise<IngestionSummaryDto> {
  const result = await axiosInstance.post('/admin/ingest/osm/bbox', body)
  return result as unknown as IngestionSummaryDto
}
