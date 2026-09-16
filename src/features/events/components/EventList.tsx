import { useState } from 'react'
import { CalendarX2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { EventCard } from '@/features/events/components/EventCard'
import { useMosqueEvents } from '@/features/events/hooks/useMosqueEvents'

interface EventListProps {
  idOrSlug: string
}

/** The mosque detail page's Events tab: a paginated, read-only list of
 * upcoming (and past) events. Creating events is Mosque Admin territory —
 * a separate later phase — so there's no "add event" affordance here. */
export function EventList({ idOrSlug }: EventListProps) {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError } = useMosqueEvents(idOrSlug, page)

  const events = data?.content ?? []

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <EmptyState title="Couldn't load events" description="Something went wrong reaching the server." />
  }

  if (events.length === 0) {
    return <EmptyState icon={CalendarX2} title="No events scheduled" description="Check back later for upcoming events at this mosque." />
  }

  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
      {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}
    </div>
  )
}
