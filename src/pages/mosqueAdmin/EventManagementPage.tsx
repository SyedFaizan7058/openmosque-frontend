import { useState } from 'react'
import { CalendarDays, CalendarX2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { MosqueAdminHeader } from '@/features/mosqueAdmin/components/MosqueAdminHeader'
import { AdminEventCard } from '@/features/events/components/AdminEventCard'
import { EventForm } from '@/features/events/components/EventForm'
import { useMosqueEvents } from '@/features/events/hooks/useMosqueEvents'
import type { MosqueEventResponseDto } from '@/features/events/types'

interface EventManagementBodyProps {
  mosqueId: string
}

function EventManagementBody({ mosqueId }: EventManagementBodyProps) {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError } = useMosqueEvents(mosqueId, page)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<MosqueEventResponseDto | undefined>(undefined)

  const events = data?.content ?? []

  function openCreate() {
    setEditingEvent(undefined)
    setFormOpen(true)
  }

  function openEdit(event: MosqueEventResponseDto) {
    setEditingEvent(event)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <Button type="button" className="w-fit" onClick={openCreate}>
        <Plus aria-hidden="true" /> Add event
      </Button>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load events" description="Something went wrong reaching the server." />
      ) : events.length === 0 ? (
        <EmptyState icon={CalendarX2} title="No events yet" description="Add your mosque's first event above." />
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <AdminEventCard key={event.id} mosqueId={mosqueId} event={event} onEdit={() => openEdit(event)} />
          ))}
          {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}
        </div>
      )}

      <EventForm open={formOpen} onOpenChange={setFormOpen} mosqueId={mosqueId} event={editingEvent} />
    </div>
  )
}

/** Reuses the public `GET /mosques/{idOrSlug}/events` list (there's no
 * separate admin-listing endpoint — see the doc comment in `eventsApi.ts`)
 * and layers create/edit/delete on top via the `/mosque-admin/**`
 * mutation endpoints. */
export default function EventManagementPage() {
  return (
    <MosqueAdminHeader
      title="Events Management"
      description="Create, edit, and remove your mosque's events."
      icon={CalendarDays}
    >
      {(mosque) => <EventManagementBody mosqueId={mosque.id} />}
    </MosqueAdminHeader>
  )
}
