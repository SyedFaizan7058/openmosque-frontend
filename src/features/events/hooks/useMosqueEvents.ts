import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getMosqueEvents } from '@/features/events/api/eventsApi'
import { eventsKeys } from '@/features/events/api/eventsKeys'

/** `GET /api/v1/mosques/{idOrSlug}/events`, paginated. */
export function useMosqueEvents(idOrSlug: string | undefined, page: number, size = 10) {
  return useQuery({
    queryKey: eventsKeys.page(idOrSlug ?? '', page, size),
    queryFn: () => getMosqueEvents({ idOrSlug: idOrSlug as string, page, size }),
    enabled: Boolean(idOrSlug),
    placeholderData: keepPreviousData,
  })
}
