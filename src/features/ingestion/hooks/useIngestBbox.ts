import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ingestByBbox } from '@/features/ingestion/api/ingestionApi'
import { mosqueKeys } from '@/features/mosques/api/mosqueKeys'
import type { BboxIngestRequestDto } from '@/features/ingestion/types'

/** `POST /api/v1/admin/ingest/osm/bbox` — see `useIngestCity`'s doc comment
 * for the cache-invalidation rationale, identical here. */
export function useIngestBbox() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: BboxIngestRequestDto) => ingestByBbox(body),
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
