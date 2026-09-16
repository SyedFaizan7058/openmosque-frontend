import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ingestByRadius } from '@/features/ingestion/api/ingestionApi'
import { mosqueKeys } from '@/features/mosques/api/mosqueKeys'
import type { RadiusIngestRequestDto } from '@/features/ingestion/types'

/** `POST /api/v1/admin/ingest/osm/radius` — see `useIngestCity`'s doc
 * comment for the cache-invalidation rationale, identical here. */
export function useIngestRadius() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: RadiusIngestRequestDto) => ingestByRadius(body),
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
