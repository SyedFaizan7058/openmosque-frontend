import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { answerFormSchema } from '@/features/questions/schemas'
import type { AnswerFormValues } from '@/features/questions/schemas'

interface AnswerFormProps {
  defaultValue?: string
  submitLabel: string
  isPending: boolean
  onSubmit: (answerText: string) => void
  onCancel: () => void
}

/** Inline (non-dialog) form for posting or editing a single answer —
 * appears directly under a question's answer thread, not in a modal, since
 * answering is meant to feel like a quick reply rather than a separate
 * flow. Shared by both "answer this question" and "edit my answer". */
export function AnswerForm({ defaultValue = '', submitLabel, isPending, onSubmit, onCancel }: AnswerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnswerFormValues>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: { answerText: defaultValue },
  })

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={handleSubmit((values) => onSubmit(values.answerText.trim()))}
      noValidate
    >
      <label htmlFor="answer-text" className="sr-only">
        Your answer
      </label>
      <Textarea
        id="answer-text"
        rows={2}
        autoFocus
        placeholder="Write your answer…"
        aria-invalid={!!errors.answerText}
        aria-describedby={errors.answerText ? 'answer-text-error' : undefined}
        {...register('answerText')}
      />
      {errors.answerText ? (
        <p id="answer-text-error" role="alert" className="text-sm text-destructive">
          {errors.answerText.message}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
