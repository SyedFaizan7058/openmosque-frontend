import type { NearbyMosquesParams, SearchMosquesParams } from '@/features/mosques/api/mosqueApi'

/** Query-key factory for the mosques feature — every hook builds its key
 * through here rather than hand-rolling arrays, so cache invalidation and
 * key shape stay consistent as the feature grows. */
export const mosqueKeys = {
  all: ['mosques'] as const,
  facilities: () => [...mosqueKeys.all, 'facilities'] as const,
  nearby: (params: NearbyMosquesParams) => [...mosqueKeys.all, 'nearby', params] as const,
  search: (params: SearchMosquesParams) => [...mosqueKeys.all, 'search', params] as const,
  detail: (idOrSlug: string) => [...mosqueKeys.all, 'detail', idOrSlug] as const,
}
