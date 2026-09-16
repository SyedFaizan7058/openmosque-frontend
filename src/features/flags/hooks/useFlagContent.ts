import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createFlag } from '@/features/flags/api/flagsApi'

/** `POST /api/v1/community/flag`. No cache to invalidate on success — the
 * flagged content's own list doesn't reflect flag status to its author,
 * only to moderators (a separate queue this hook doesn't touch). */
export function useFlagContent() {
  return useMutation({
    mutationFn: createFlag,
    onSuccess: () => {
      toast.success("Thanks — we've received your report.")
    },
    onError: () => {
      toast.error("Couldn't submit your report. Please try again.")
    },
  })
}
