import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createAnswer } from '@/features/questions/api/questionsApi'
import { questionsKeys } from '@/features/questions/api/questionsKeys'
import type { AnswerCreateDto } from '@/features/questions/types'

interface CreateAnswerVars {
  questionId: string
  idOrSlug: string
  body: AnswerCreateDto
}

/** `POST /api/v1/community/questions/{questionId}/answers`. */
export function useCreateAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ questionId, body }: CreateAnswerVars) => createAnswer(questionId, body),
    onSuccess: (_data, { idOrSlug }) => {
      void queryClient.invalidateQueries({ queryKey: questionsKeys.list(idOrSlug) })
      toast.success('Your answer has been posted.')
    },
    onError: () => {
      toast.error("Couldn't post your answer. Please try again.")
    },
  })
}
