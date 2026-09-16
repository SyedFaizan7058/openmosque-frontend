import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { suggestMosqueEdit } from '@/features/submissions/api/submissionsApi'
import type { MosqueSubmissionRequestDto } from '@/features/submissions/types'

/** `POST /api/v1/mosques/{id}/suggest-edit`. */
export function useSuggestEdit() {
  return useMutation({
    mutationFn: ({ mosqueId, body }: { mosqueId: string; body: MosqueSubmissionRequestDto }) => suggestMosqueEdit(mosqueId, body),
    onSuccess: () => {
      toast.success("Thanks! Your edit suggestion is pending review by a moderator.")
    },
    onError: () => {
      toast.error("Couldn't submit your edit suggestion. Please try again.")
    },
  })
}
