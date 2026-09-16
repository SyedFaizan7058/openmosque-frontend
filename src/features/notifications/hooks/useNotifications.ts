import { useQuery } from '@tanstack/react-query'
import { getNotifications, type GetNotificationsParams } from '@/features/notifications/api/notificationsApi'
import { notificationsKeys } from '@/features/notifications/api/notificationsKeys'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { emptyPage } from '@/lib/apiTypes'
import type { NotificationResponseDto } from '@/features/notifications/types'

export function useNotifications(params: GetNotificationsParams = { page: 0, size: 20 }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: notificationsKeys.list(params),
    queryFn: () => getNotifications(params),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev ?? emptyPage<NotificationResponseDto>(params.size ?? 20),
  })
}
