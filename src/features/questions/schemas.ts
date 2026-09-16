import { z } from 'zod'

/** Mirrors `QuestionCreateDto` (`questionText: string` `@NotBlank`,
 * backend_analysis.md §4). */
export const questionFormSchema = z.object({
  questionText: z.string().min(1, 'Please enter your question').max(1000, 'Please keep it under 1000 characters'),
})
export type QuestionFormValues = z.infer<typeof questionFormSchema>

/** Mirrors `AnswerCreateDto` (`answerText: string` `@NotBlank`,
 * backend_analysis.md §4). */
export const answerFormSchema = z.object({
  answerText: z.string().min(1, 'Please enter your answer').max(2000, 'Please keep it under 2000 characters'),
})
export type AnswerFormValues = z.infer<typeof answerFormSchema>
