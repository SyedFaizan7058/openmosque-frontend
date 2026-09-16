import { useQuery } from '@tanstack/react-query'
import { getUnreadCount } from '@/features/notifications/api/notificationsApi'
import { notificationsKeys } from '@/features/notifications/api/notificationsKeys'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

export function useUnreadNotificationCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 60000 : false,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  })
}
