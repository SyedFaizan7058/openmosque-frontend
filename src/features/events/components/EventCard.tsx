import { format } from 'date-fns'
import { CalendarDays, ExternalLink, MapPin, Mic2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MosqueEventResponseDto } from '@/features/events/types'

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

const AUDIENCE_LABELS: Record<string, string> = {
  ALL: 'Everyone',
  BROTHERS: 'Brothers',
  SISTERS: 'Sisters',
  YOUTH: 'Youth',
}

interface EventCardProps {
  event: MosqueEventResponseDto
}

/** A modern upcoming (or past) event card with date badge, tags, and action buttons. */
export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.startDateTime)
  const monthStr = format(eventDate, 'MMM').toUpperCase()
  const dayStr = format(eventDate, 'd')
  const timeStr = format(eventDate, 'h:mm a')

  return (
    <div
      className={cn(
        'group flex flex-col sm:flex-row items-start gap-4 sm:gap-5 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs hover:border-[#007378]/40 hover:shadow-sm transition-all',
        event.cancelled && 'opacity-60 grayscale',
      )}
    >
      {/* Date badge */}
      <div className="flex sm:flex-col items-center justify-center rounded-xl bg-primary/[0.08] text-primary border border-primary/20 px-3.5 py-2 sm:py-2.5 min-w-[60px] shrink-0 gap-1.5 sm:gap-0">
        <span className="text-[11px] font-bold tracking-wider text-primary/80 uppercase">{monthStr}</span>
        <span className="text-xl sm:text-2xl font-extrabold text-primary leading-tight">{dayStr}</span>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border border-primary/20 font-semibold text-xs"
          >
            {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
          </Badge>
          {event.audience !== 'ALL' && (
            <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
              {AUDIENCE_LABELS[event.audience] ?? event.audience}
            </Badge>
          )}
          {event.cancelled && <Badge variant="destructive">Cancelled</Badge>}
        </div>

        <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {event.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <CalendarDays className="size-3.5 text-primary" aria-hidden="true" />
            {timeStr}
          </span>
          {event.locationDetails && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-muted-foreground" aria-hidden="true" />
              {event.locationDetails}
            </span>
          )}
          {event.speakerName && (
            <span className="flex items-center gap-1.5">
              <Mic2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
              {event.speakerName}
            </span>
          )}
          {event.audience === 'ALL' && (
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5 text-muted-foreground" aria-hidden="true" />
              Open to everyone
            </span>
          )}
        </div>

        {event.registrationUrl && !event.cancelled && (
          <div className="pt-2">
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all"
            >
              <span>Register Now</span>
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
