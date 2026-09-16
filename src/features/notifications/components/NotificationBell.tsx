import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUnreadNotificationCount } from '@/features/notifications/hooks/useUnreadCount'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { useMarkAllNotificationsAsRead } from '@/features/notifications/hooks/useNotificationMutations'
import { NotificationItem } from '@/features/notifications/components/NotificationItem'

export function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { data: unreadData } = useUnreadNotificationCount()
  const { data: notificationsPage, isLoading } = useNotifications({ page: 0, size: 5 })
  const markAllAsRead = useMarkAllNotificationsAsRead()

  const unreadCount = unreadData?.unreadCount ?? 0
  const notifications = notificationsPage?.content ?? []

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
          className="relative"
        >
          <Bell className="size-5" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground shadow-sm animate-in zoom-in-50">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {unreadCount} new
              </span>
            ) : null}
          </div>

          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          ) : null}
        </DropdownMenuLabel>

        <div className="max-h-[380px] overflow-y-auto p-2 space-y-2">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
              <Bell className="size-8 stroke-1 text-muted-foreground/50 mb-2" />
              <p className="font-medium">No notifications yet</p>
              <p className="text-xs text-muted-foreground/70">
                Updates regarding prayer times, claims, and submissions will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <NotificationItem
                key={item.id}
                notification={item}
                onSelect={() => setOpen(false)}
              />
            ))
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem
          className="flex items-center justify-center py-2.5 text-center text-xs font-medium text-primary hover:text-primary cursor-pointer"
          onClick={() => {
            setOpen(false)
            navigate('/notifications')
          }}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
