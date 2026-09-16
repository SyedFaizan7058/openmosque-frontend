import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getQuestions } from '@/features/questions/api/questionsApi'
import { questionsKeys } from '@/features/questions/api/questionsKeys'

/** `GET /api/v1/mosques/{idOrSlug}/questions`, paginated. */
export function useQuestions(idOrSlug: string | undefined, page: number, size = 10) {
  return useQuery({
    queryKey: questionsKeys.page(idOrSlug ?? '', page, size),
    queryFn: () => getQuestions({ idOrSlug: idOrSlug as string, page, size }),
    enabled: Boolean(idOrSlug),
    placeholderData: keepPreviousData,
  })
}
