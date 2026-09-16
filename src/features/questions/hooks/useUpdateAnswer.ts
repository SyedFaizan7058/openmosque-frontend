import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateAnswer } from '@/features/questions/api/questionsApi'
import { questionsKeys } from '@/features/questions/api/questionsKeys'
import type { AnswerCreateDto } from '@/features/questions/types'

interface UpdateAnswerVars {
  answerId: string
  idOrSlug: string
  body: AnswerCreateDto
}

/** `PUT /api/v1/community/answers/{answerId}` — own answer only. */
export function useUpdateAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ answerId, body }: UpdateAnswerVars) => updateAnswer(answerId, body),
    onSuccess: (_data, { idOrSlug }) => {
      void queryClient.invalidateQueries({ queryKey: questionsKeys.list(idOrSlug) })
      toast.success('Your answer has been updated.')
    },
    onError: () => {
      toast.error("Couldn't update your answer. Please try again.")
    },
  })
}
