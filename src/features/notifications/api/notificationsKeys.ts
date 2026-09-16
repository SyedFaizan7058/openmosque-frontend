import type { GetNotificationsParams } from '@/features/notifications/api/notificationsApi'

export const notificationsKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationsKeys.all, 'list'] as const,
  list: (params: GetNotificationsParams) => [...notificationsKeys.lists(), params] as const,
  unreadCount: () => [...notificationsKeys.all, 'unread-count'] as const,
  devices: () => [...notificationsKeys.all, 'devices'] as const,
}
