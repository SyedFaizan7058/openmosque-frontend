import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useCreateQuestion } from '@/features/questions/hooks/useCreateQuestion'
import { questionFormSchema } from '@/features/questions/schemas'
import type { QuestionFormValues } from '@/features/questions/schemas'

interface AskQuestionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mosqueId: string
  idOrSlug: string
}

/** "Ask a question" dialog — a single required text field, wired to
 * `POST /api/v1/mosques/{id}/questions`. */
export function AskQuestionForm({ open, onOpenChange, mosqueId, idOrSlug }: AskQuestionFormProps) {
  const createQuestion = useCreateQuestion()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionFormValues>({ resolver: zodResolver(questionFormSchema), defaultValues: { questionText: '' } })

  function onSubmit(values: QuestionFormValues) {
    createQuestion.mutate(
      { mosqueId, idOrSlug, body: { questionText: values.questionText.trim() } },
      {
        onSuccess: () => {
          onOpenChange(false)
          reset()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ask a question</DialogTitle>
          <DialogDescription>Other visitors or the mosque's admin may answer.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
          <label htmlFor="ask-question-text" className="sr-only">
            Your question
          </label>
          <Textarea
            id="ask-question-text"
            rows={3}
            placeholder="What would you like to know?"
            aria-invalid={!!errors.questionText}
            aria-describedby={errors.questionText ? 'ask-question-text-error' : undefined}
            {...register('questionText')}
          />
          {errors.questionText ? (
            <p id="ask-question-text-error" role="alert" className="text-sm text-destructive">
              {errors.questionText.message}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createQuestion.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createQuestion.isPending}>
              {createQuestion.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              Post question
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
