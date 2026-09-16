import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/features/notifications/api/notificationsApi'
import { notificationsKeys } from '@/features/notifications/api/notificationsKeys'

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all })
    },
    onError: (err) => {
      console.error('[OpenMosque] Failed to mark notification as read:', err)
      toast.error('Could not mark notification as read.')
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all })
      toast.success(
        count > 0
          ? `Marked ${count} ${count === 1 ? 'notification' : 'notifications'} as read.`
          : 'All notifications are marked as read.',
      )
    },
    onError: (err) => {
      console.error('[OpenMosque] Failed to mark all notifications as read:', err)
      toast.error('Could not mark all notifications as read.')
    },
  })
}
