import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteAnswer } from '@/features/questions/api/questionsApi'
import { questionsKeys } from '@/features/questions/api/questionsKeys'

/** `DELETE /api/v1/community/answers/{answerId}` — own answer only. */
export function useDeleteAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ answerId }: { answerId: string; idOrSlug: string }) => deleteAnswer(answerId),
    onSuccess: (_data, { idOrSlug }) => {
      void queryClient.invalidateQueries({ queryKey: questionsKeys.list(idOrSlug) })
      toast.success('Your answer has been deleted.')
    },
    onError: () => {
      toast.error("Couldn't delete your answer. Please try again.")
    },
  })
}
