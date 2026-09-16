import { useState } from 'react'
import { DownloadCloud } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BboxIngestForm } from '@/features/ingestion/components/BboxIngestForm'
import { CityIngestForm } from '@/features/ingestion/components/CityIngestForm'
import { IngestionSummaryCard } from '@/features/ingestion/components/IngestionSummaryCard'
import { RadiusIngestForm } from '@/features/ingestion/components/RadiusIngestForm'
import type { IngestMode, IngestionSummaryDto } from '@/features/ingestion/types'
import { StatusFilterTabs } from '@/features/moderation/components/StatusFilterTabs'

const MODE_LABELS: Record<IngestMode, string> = {
  CITY: 'By city',
  RADIUS: 'By radius',
  BBOX: 'By bounding box',
}

/** Bulk-imports mosques from OpenStreetMap via the Overpass API
 * (`OsmIngestionController`, three modes sharing one result shape). Every
 * mode defaults its form to `dryRun: true` — a moderator previews what
 * would be inserted, then reruns with "Dry run" unchecked to actually
 * write to the database. Switching modes clears the last result rather
 * than leaving a stale summary from a different query on screen. */
export default function OsmIngestionPage() {
  const [mode, setMode] = useState<IngestMode>('CITY')
  const [result, setResult] = useState<IngestionSummaryDto | null>(null)

  function handleModeChange(next: IngestMode | undefined) {
    if (!next) return
    setMode(next)
    setResult(null)
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <DownloadCloud className="size-6 text-primary" aria-hidden="true" />
          OSM Ingestion
        </h1>
        <p className="text-sm text-muted-foreground">
          Bulk-import mosques from OpenStreetMap. A mosque already within 50m — or within 500m with a matching
          name — of an existing listing is skipped as a duplicate automatically.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run an ingest</CardTitle>
          <CardDescription>Choose how to select the area to search.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <StatusFilterTabs
            value={mode}
            onChange={handleModeChange}
            options={(['CITY', 'RADIUS', 'BBOX'] as const).map((m) => ({ value: m, label: MODE_LABELS[m] }))}
          />

          {mode === 'CITY' && <CityIngestForm onResult={setResult} />}
          {mode === 'RADIUS' && <RadiusIngestForm onResult={setResult} />}
          {mode === 'BBOX' && <BboxIngestForm onResult={setResult} />}
        </CardContent>
      </Card>

      {result && <IngestionSummaryCard summary={result} />}
    </div>
  )
}
