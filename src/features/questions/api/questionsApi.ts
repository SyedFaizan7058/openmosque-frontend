import { axiosInstance } from '@/lib/axiosInstance'
import type { PageResponse } from '@/lib/apiTypes'
import type { AnswerCreateDto, AnswerResponseDto, QuestionCreateDto, QuestionResponseDto } from '@/features/questions/types'

/**
 * Q&A API (backend_analysis.md §5, "Community: reviews, ratings, Q&A,
 * flags"). Note the asymmetric routing the backend actually implements:
 * reading and *asking* a question go through `/mosques/{idOrSlug|id}/...`,
 * but editing/deleting an existing question or answer go through
 * `/community/...` instead (no mosque in the path at all) — this isn't a
 * frontend inconsistency, it's what `CommunityUserController` maps.
 */

export interface QuestionsPageParams {
  idOrSlug: string
  page: number
  size: number
}

/** `GET /api/v1/mosques/{idOrSlug}/questions?page=&size=` — public. */
export async function getQuestions({ idOrSlug, page, size }: QuestionsPageParams): Promise<PageResponse<QuestionResponseDto>> {
  const result = await axiosInstance.get(`/mosques/${encodeURIComponent(idOrSlug)}/questions`, {
    params: { page, size },
  })
  return result as unknown as PageResponse<QuestionResponseDto>
}

/** `POST /api/v1/mosques/{id}/questions` — user. */
export async function createQuestion(mosqueId: string, body: QuestionCreateDto): Promise<QuestionResponseDto> {
  const result = await axiosInstance.post(`/mosques/${encodeURIComponent(mosqueId)}/questions`, body)
  return result as unknown as QuestionResponseDto
}

/** `PUT /api/v1/community/questions/{questionId}` — user, own question only. */
export async function updateQuestion(questionId: string, body: QuestionCreateDto): Promise<QuestionResponseDto> {
  const result = await axiosInstance.put(`/community/questions/${encodeURIComponent(questionId)}`, body)
  return result as unknown as QuestionResponseDto
}

/** `DELETE /api/v1/community/questions/{questionId}` — user, own question only. */
export async function deleteQuestion(questionId: string): Promise<void> {
  await axiosInstance.delete(`/community/questions/${encodeURIComponent(questionId)}`)
}

/** `POST /api/v1/community/questions/{questionId}/answers` — user. */
export async function createAnswer(questionId: string, body: AnswerCreateDto): Promise<AnswerResponseDto> {
  const result = await axiosInstance.post(`/community/questions/${encodeURIComponent(questionId)}/answers`, body)
  return result as unknown as AnswerResponseDto
}

/** `PUT /api/v1/community/answers/{answerId}` — user, own answer only. */
export async function updateAnswer(answerId: string, body: AnswerCreateDto): Promise<AnswerResponseDto> {
  const result = await axiosInstance.put(`/community/answers/${encodeURIComponent(answerId)}`, body)
  return result as unknown as AnswerResponseDto
}

/** `DELETE /api/v1/community/answers/{answerId}` — user, own answer only. */
export async function deleteAnswer(answerId: string): Promise<void> {
  await axiosInstance.delete(`/community/answers/${encodeURIComponent(answerId)}`)
}
