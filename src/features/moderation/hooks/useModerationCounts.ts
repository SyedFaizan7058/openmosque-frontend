import { useQuery } from '@tanstack/react-query'
import { getModerationCounts } from '@/features/moderation/api/moderationApi'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { ROLES } from '@/lib/constants'

export function useModerationCounts() {
  const role = useAuthStore((s) => s.user?.role)
  const isModOrAdmin = role === ROLES.MODERATOR || role === ROLES.SUPER_ADMIN

  return useQuery({
    queryKey: ['moderation', 'counts'] as const,
    queryFn: getModerationCounts,
    enabled: isModOrAdmin,
    refetchInterval: isModOrAdmin ? 30000 : false,
    refetchOnWindowFocus: true,
    staleTime: 15000,
  })
}
