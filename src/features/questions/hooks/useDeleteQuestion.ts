import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteQuestion } from '@/features/questions/api/questionsApi'
import { questionsKeys } from '@/features/questions/api/questionsKeys'

/** `DELETE /api/v1/community/questions/{questionId}` — own question only. */
export function useDeleteQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ questionId }: { questionId: string; idOrSlug: string }) => deleteQuestion(questionId),
    onSuccess: (_data, { idOrSlug }) => {
      void queryClient.invalidateQueries({ queryKey: questionsKeys.list(idOrSlug) })
      toast.success('Your question has been deleted.')
    },
    onError: () => {
      toast.error("Couldn't delete your question. Please try again.")
    },
  })
}
