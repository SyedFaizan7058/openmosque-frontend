import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteEvent } from '@/features/events/api/eventsApi'
import { eventsKeys } from '@/features/events/api/eventsKeys'
import type { ApiErrorDetail } from '@/features/auth/types'

interface DeleteEventVars {
  mosqueId: string
  eventId: string
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation<unknown, ApiErrorDetail, DeleteEventVars>({
    mutationFn: ({ mosqueId, eventId }) => deleteEvent(mosqueId, eventId),
    onSuccess: (_data, { mosqueId }) => {
      void queryClient.invalidateQueries({ queryKey: eventsKeys.list(mosqueId) })
      toast.success('Event deleted.')
    },
    onError: (error) => {
      toast.error(error?.message ?? "Couldn't delete the event. Please try again.")
    },
  })
}
