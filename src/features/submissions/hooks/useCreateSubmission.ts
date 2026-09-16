import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createMosqueSubmission } from '@/features/submissions/api/submissionsApi'
import { notificationsKeys } from '@/features/notifications/api/notificationsKeys'

export function useCreateSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMosqueSubmission,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['moderation', 'counts'] })
      toast.success("Thanks! Your submission is pending review by a moderator.")
    },
    onError: () => {
      toast.error("Couldn't submit this mosque. Please check the form and try again.")
    },
  })
}
