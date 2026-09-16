import { useQuery } from '@tanstack/react-query'
import { getPlatformStats } from '@/features/moderation/api/moderationApi'

/** `GET /api/v1/admin/stats`. A short `staleTime` keeps the moderator
 * dashboard's counts reasonably fresh without refetching on every render. */
export function usePlatformStats() {
  return useQuery({
    queryKey: ['moderation', 'stats'] as const,
    queryFn: getPlatformStats,
    staleTime: 30 * 1000,
  })
}
