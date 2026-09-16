import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ingestByCity } from '@/features/ingestion/api/ingestionApi'
import { mosqueKeys } from '@/features/mosques/api/mosqueKeys'
import type { CityIngestRequestDto } from '@/features/ingestion/types'

/** `POST /api/v1/admin/ingest/osm/city`. On a real (non-dry-run) import
 * that actually inserted mosques, invalidates every cached mosque
 * search/nearby result so newly-ingested mosques show up without a manual
 * refresh; a dry run changes nothing server-side, so the cache is left
 * alone. */
export function useIngestCity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CityIngestRequestDto) => ingestByCity(body),
    onSuccess: (summary) => {
      if (!summary.dryRun && summary.mosquesInserted > 0) {
        void queryClient.invalidateQueries({ queryKey: mosqueKeys.all })
      }
    },
    onError: () => {
      toast.error("Couldn't reach OpenStreetMap for this ingest. Please try again.")
    },
  })
}
