import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateQuestion } from '@/features/questions/api/questionsApi'
import { questionsKeys } from '@/features/questions/api/questionsKeys'
import type { QuestionCreateDto } from '@/features/questions/types'

interface UpdateQuestionVars {
  questionId: string
  idOrSlug: string
  body: QuestionCreateDto
}

/** `PUT /api/v1/community/questions/{questionId}` — own question only. */
export function useUpdateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ questionId, body }: UpdateQuestionVars) => updateQuestion(questionId, body),
    onSuccess: (_data, { idOrSlug }) => {
      void queryClient.invalidateQueries({ queryKey: questionsKeys.list(idOrSlug) })
      toast.success('Your question has been updated.')
    },
    onError: () => {
      toast.error("Couldn't update your question. Please try again.")
    },
  })
}
