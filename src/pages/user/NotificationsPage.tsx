import { useState } from 'react'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { useUnreadNotificationCount } from '@/features/notifications/hooks/useUnreadCount'
import { useMarkAllNotificationsAsRead } from '@/features/notifications/hooks/useNotificationMutations'
import { NotificationItem } from '@/features/notifications/components/NotificationItem'
import { Pagination } from '@/components/shared/Pagination'

export default function NotificationsPage() {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const { data: unreadData } = useUnreadNotificationCount()
  const unreadCount = unreadData?.unreadCount ?? 0

  const { data: pagedData, isLoading, isFetching } = useNotifications({ page, size: 15 })
  const markAllAsRead = useMarkAllNotificationsAsRead()

  const allItems = pagedData?.content ?? []
  const displayedItems = filter === 'unread' ? allItems.filter((item) => !item.read) : allItems

  const totalPages = pagedData?.totalPages ?? 1

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-6 px-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Notifications
            </h1>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {unreadCount} unread
              </span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated with prayer timing changes, moderation decisions, claims, and badges.
          </p>
        </div>

        {unreadCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="gap-2 self-start sm:self-auto"
          >
            {markAllAsRead.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCheck className="size-4 text-primary" />
            )}
            Mark all as read
          </Button>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className="rounded-full text-xs"
          >
            All
          </Button>
          <Button
            type="button"
            variant={filter === 'unread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
            className="rounded-full text-xs gap-1.5"
          >
            Unread
            {unreadCount > 0 ? (
              <span className="rounded-full bg-primary-foreground/20 px-1.5 py-0.2 text-[10px] font-bold">
                {unreadCount}
              </span>
            ) : null}
          </Button>
        </div>

        {isFetching && !isLoading ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            <span>Updating…</span>
          </div>
        ) : null}
      </div>

      <Card className="border-border">
        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
                <Bell className="size-7 stroke-1" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {filter === 'unread'
                  ? 'You have caught up with all your notifications.'
                  : 'Important announcements, iqamah changes, and submission reviews will be listed here.'}
              </p>
              {filter === 'unread' && allItems.length > 0 ? (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="mt-3 text-primary"
                >
                  View all past notifications
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedItems.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 border-t border-border pt-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
