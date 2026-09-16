import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarDays, MapPin, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useDeleteEvent } from '@/features/events/hooks/useDeleteEvent'
import type { MosqueEventResponseDto } from '@/features/events/types'
import { cn } from '@/lib/utils'

const EVENT_TYPE_LABELS: Record<string, string> = {
  HALAQAH: 'Halaqah',
  WORKSHOP: 'Workshop',
  YOUTH_PROGRAM: 'Youth Program',
  CHARITY: 'Charity',
  RAMADAN: 'Ramadan',
  EID: 'Eid',
  COMMUNITY_MEETING: 'Community Meeting',
  OTHER: 'Event',
}

interface AdminEventCardProps {
  mosqueId: string
  event: MosqueEventResponseDto
  onEdit: () => void
}

/** One event row in the admin's Events Management list — the same core
 * info as the public `EventCard`, plus an edit/delete menu. Kept as a
 * separate component rather than adding admin-only props to `EventCard`
 * itself, since the public card intentionally has zero interactivity. */
export function AdminEventCard({ mosqueId, event, onEdit }: AdminEventCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const deleteEvent = useDeleteEvent()

  return (
    <Card className={cn(event.cancelled && 'opacity-60')}>
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}</Badge>
            {event.cancelled && <Badge variant="destructive">Cancelled</Badge>}
          </div>
          <h3 className="font-semibold text-foreground">{event.title}</h3>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden="true" />
            {format(new Date(event.startDateTime), "MMM d, yyyy 'at' h:mm a")}
          </span>
          {event.locationDetails && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" /> {event.locationDetails}
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" aria-label="Event options" className="size-8 shrink-0">
              <MoreVertical className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil aria-hidden="true" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConfirmOpen(true)} className="text-destructive focus:text-destructive">
              <Trash2 aria-hidden="true" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this event?"
        description="This can't be undone."
        isPending={deleteEvent.isPending}
        onConfirm={() =>
          deleteEvent.mutate({ mosqueId, eventId: event.id }, { onSuccess: () => setConfirmOpen(false) })
        }
      />
    </Card>
  )
}
