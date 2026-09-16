import { AlertTriangle, Building2, CheckCircle2, Copy, Timer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { IngestionSummaryDto } from '@/features/ingestion/types'

interface IngestionSummaryCardProps {
  summary: IngestionSummaryDto
}

/** Renders an `IngestionSummaryDto` — the shared result shape for all
 * three OSM ingest endpoints. A `dryRun: true` result gets a clear "preview
 * only, nothing was saved" banner so a moderator never mistakes a preview
 * for a completed import. */
export function IngestionSummaryCard({ summary }: IngestionSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          {summary.dryRun ? (
            <>
              <AlertTriangle className="size-5 text-accent" aria-hidden="true" />
              Preview only — nothing was saved
            </>
          ) : (
            <>
              <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
              Import complete
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="text-2xl font-bold text-foreground">{summary.totalElementsFetched}</div>
            <div className="text-xs text-muted-foreground">Fetched from OSM</div>
          </div>
          <div className="rounded-lg border border-border bg-primary/5 p-3">
            <div className="text-2xl font-bold text-primary">{summary.mosquesInserted}</div>
            <div className="text-xs text-muted-foreground">{summary.dryRun ? 'Would insert' : 'Mosques inserted'}</div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="flex items-center gap-1.5 text-2xl font-bold text-foreground">
              <Copy className="size-4 text-muted-foreground" aria-hidden="true" />
              {summary.duplicatesSkipped}
            </div>
            <div className="text-xs text-muted-foreground">Duplicates skipped</div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="text-2xl font-bold text-foreground">{summary.facilitiesAttached}</div>
            <div className="text-xs text-muted-foreground">Facilities attached</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Timer className="size-3.5" aria-hidden="true" />
          Took {(summary.durationMs / 1000).toFixed(1)}s
        </div>

        {summary.insertedMosqueNames.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Building2 className="size-4" aria-hidden="true" />
              {summary.dryRun ? 'Would insert these mosques' : 'Inserted mosques'}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {summary.insertedMosqueNames.map((name, i) => (
                <Badge key={`${name}-${i}`} variant="outline">
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
