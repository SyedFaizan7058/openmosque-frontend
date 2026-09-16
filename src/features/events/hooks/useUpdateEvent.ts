import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateEvent } from '@/features/events/api/eventsApi'
import { eventsKeys } from '@/features/events/api/eventsKeys'
import type { MosqueEventCreateDto } from '@/features/events/types'
import type { ApiErrorDetail } from '@/features/auth/types'

interface UpdateEventVars {
  mosqueId: string
  eventId: string
  body: MosqueEventCreateDto
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation<unknown, ApiErrorDetail, UpdateEventVars>({
    mutationFn: ({ mosqueId, eventId, body }) => updateEvent(mosqueId, eventId, body),
    onSuccess: (_data, { mosqueId }) => {
      void queryClient.invalidateQueries({ queryKey: eventsKeys.list(mosqueId) })
      toast.success('Event updated.')
    },
    onError: (error) => {
      toast.error(error?.message ?? "Couldn't update the event. Please try again.")
    },
  })
}
