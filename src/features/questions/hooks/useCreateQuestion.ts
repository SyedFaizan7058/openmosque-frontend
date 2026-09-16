import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createQuestion } from '@/features/questions/api/questionsApi'
import { questionsKeys } from '@/features/questions/api/questionsKeys'
import type { QuestionCreateDto } from '@/features/questions/types'

interface CreateQuestionVars {
  mosqueId: string
  idOrSlug: string
  body: QuestionCreateDto
}

/** `POST /api/v1/mosques/{id}/questions`. */
export function useCreateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ mosqueId, body }: CreateQuestionVars) => createQuestion(mosqueId, body),
    onSuccess: (_data, { idOrSlug }) => {
      void queryClient.invalidateQueries({ queryKey: questionsKeys.list(idOrSlug) })
      toast.success('Your question has been posted.')
    },
    onError: () => {
      toast.error("Couldn't post your question. Please try again.")
    },
  })
}
