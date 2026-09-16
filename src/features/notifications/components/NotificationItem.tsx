import { Link } from 'react-router-dom'
import {
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Award,
  MessageSquare,
  Calendar,
  Megaphone,
  Check,
  ExternalLink,
} from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import type { NotificationResponseDto, NotificationType } from '@/features/notifications/types'
import { useMarkNotificationAsRead } from '@/features/notifications/hooks/useNotificationMutations'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NotificationItemProps {
  notification: NotificationResponseDto
  onSelect?: () => void
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'IQAMAH_CHANGE':
      return { icon: Clock, color: 'text-primary bg-primary/10' }
    case 'SUBMISSION_RECEIVED':
      return { icon: CheckCircle2, color: 'text-primary bg-primary/10' }
    case 'SUBMISSION_APPROVED':
      return { icon: CheckCircle2, color: 'text-primary bg-primary/10' }
    case 'SUBMISSION_REJECTED':
      return { icon: XCircle, color: 'text-destructive bg-destructive/10' }
    case 'CLAIM_APPROVED':
      return { icon: ShieldCheck, color: 'text-primary bg-primary/10' }
    case 'CLAIM_REJECTED':
      return { icon: ShieldAlert, color: 'text-accent bg-accent/10' }
    case 'BADGE_EARNED':
      return { icon: Award, color: 'text-accent bg-accent/10' }
    case 'QUESTION_ANSWERED':
      return { icon: MessageSquare, color: 'text-primary bg-primary/10' }
    case 'EVENT_ANNOUNCEMENT':
      return { icon: Calendar, color: 'text-primary bg-primary/10' }
    case 'SYSTEM_ANNOUNCEMENT':
    default:
      return { icon: Megaphone, color: 'text-muted-foreground bg-muted' }
  }
}

export function NotificationItem({ notification, onSelect }: NotificationItemProps) {
  const markAsRead = useMarkNotificationAsRead()
  const { icon: Icon, color } = getNotificationIcon(notification.type)

  let formattedTime = ''
  try {
    formattedTime = formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })
  } catch {
    formattedTime = notification.createdAt
  }

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!notification.read) {
      markAsRead.mutate(notification.id)
    }
  }

  const content = (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border p-4 transition-colors',
        notification.read
          ? 'border-border/60 bg-card text-muted-foreground'
          : 'border-primary/30 bg-primary/[0.03] text-foreground',
      )}
    >
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', color)}>
        <Icon className="size-4" />
      </div>

      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              'truncate text-sm',
              notification.read ? 'font-medium text-foreground/80' : 'font-semibold text-foreground',
            )}
          >
            {notification.title}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">{formattedTime}</span>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {notification.message}
        </p>

        {notification.linkUrl ? (
          <div className="pt-1 text-xs font-medium text-primary inline-flex items-center gap-1 hover:underline">
            <span>View details</span>
            <ExternalLink className="size-3" />
          </div>
        ) : null}
      </div>

      {!notification.read ? (
        <div className="flex shrink-0 items-center gap-1">
          <span className="size-2 rounded-full bg-primary" title="Unread" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-primary"
            onClick={handleMarkRead}
            disabled={markAsRead.isPending}
            title="Mark as read"
            aria-label="Mark as read"
          >
            <Check className="size-3.5" />
          </Button>
        </div>
      ) : null}
    </div>
  )

  if (notification.linkUrl) {
    return (
      <Link
        to={notification.linkUrl}
        onClick={() => {
          if (!notification.read) markAsRead.mutate(notification.id)
          onSelect?.()
        }}
        className="block no-underline"
      >
        {content}
      </Link>
    )
  }

  return (
    <div
      onClick={() => {
        if (!notification.read) markAsRead.mutate(notification.id)
        onSelect?.()
      }}
      className="cursor-pointer"
    >
      {content}
    </div>
  )
}
