import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createEvent } from '@/features/events/api/eventsApi'
import { eventsKeys } from '@/features/events/api/eventsKeys'
import type { MosqueEventCreateDto } from '@/features/events/types'
import type { ApiErrorDetail } from '@/features/auth/types'

interface CreateEventVars {
  mosqueId: string
  body: MosqueEventCreateDto
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation<unknown, ApiErrorDetail, CreateEventVars>({
    mutationFn: ({ mosqueId, body }) => createEvent(mosqueId, body),
    onSuccess: (_data, { mosqueId }) => {
      void queryClient.invalidateQueries({ queryKey: eventsKeys.list(mosqueId) })
      toast.success('Event created.')
    },
    onError: (error) => {
      toast.error(error?.message ?? "Couldn't create the event. Please try again.")
    },
  })
}
