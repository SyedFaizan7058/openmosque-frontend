import { useState } from 'react'
import { format } from 'date-fns'
import { Flag, MessageCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useAuthStore, selectIsAuthenticated, selectUser } from '@/features/auth/store/useAuthStore'
import { ReportContentDialog } from '@/features/flags/components/ReportContentDialog'
import { AnswerCard } from '@/features/questions/components/AnswerCard'
import { AnswerForm } from '@/features/questions/components/AnswerForm'
import { useCreateAnswer } from '@/features/questions/hooks/useCreateAnswer'
import { useDeleteQuestion } from '@/features/questions/hooks/useDeleteQuestion'
import { useUpdateQuestion } from '@/features/questions/hooks/useUpdateQuestion'
import type { QuestionResponseDto } from '@/features/questions/types'

interface QuestionCardProps {
  question: QuestionResponseDto
  idOrSlug: string
}

function initialsFor(name: string | null | undefined): string {
  const source = (name ?? 'Anonymous').trim()
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

/** One question and its answer thread. Any signed-in visitor (not just the
 * asker) can add an answer — this mirrors a real community Q&A, where the
 * mosque admin or another visitor is usually the one who actually knows
 * the answer, not the person who asked. */
export function QuestionCard({ question, idOrSlug }: QuestionCardProps) {
  const [editing, setEditing] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [answering, setAnswering] = useState(false)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const currentUser = useAuthStore(selectUser)
  const isOwnQuestion = currentUser?.id === question.userId
  const updateQuestion = useUpdateQuestion()
  const deleteQuestion = useDeleteQuestion()
  const createAnswer = useCreateAnswer()

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs hover:border-[#007378]/30 transition-all mb-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border border-border/60">
            {question.userPhotoUrl ? <AvatarImage src={question.userPhotoUrl} alt="" /> : null}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {initialsFor(question.userDisplayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">{question.userDisplayName ?? 'Anonymous'}</span>
            <span className="text-xs text-muted-foreground">{format(new Date(question.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {isOwnQuestion ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Question options" className="size-8">
                <MoreVertical className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(true)}>
                <Pencil aria-hidden="true" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConfirmDeleteOpen(true)} className="text-destructive focus:text-destructive">
                <Trash2 aria-hidden="true" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <ReportContentDialog
            targetType="QUESTION"
            targetId={question.id}
            trigger={
              <Button type="button" variant="ghost" size="icon" aria-label="Report this question" className="size-8">
                <Flag className="size-4" aria-hidden="true" />
              </Button>
            }
          />
        )}
      </div>

      {editing ? (
        <AnswerForm
          defaultValue={question.questionText}
          submitLabel="Save"
          isPending={updateQuestion.isPending}
          onCancel={() => setEditing(false)}
          onSubmit={(questionText) =>
            updateQuestion.mutate({ questionId: question.id, idOrSlug, body: { questionText } }, { onSuccess: () => setEditing(false) })
          }
        />
      ) : (
        <p className="whitespace-pre-wrap text-sm sm:text-base font-semibold text-foreground leading-snug">
          {question.questionText}
        </p>
      )}

      {question.answers != null && question.answers.length > 0 && (
        <div className="flex flex-col gap-2.5 pt-1">
          {question.answers.map((answer) => (
            <AnswerCard key={answer.id} answer={answer} idOrSlug={idOrSlug} isOwn={currentUser?.id === answer.userId} />
          ))}
        </div>
      )}

      {isAuthenticated &&
        (answering ? (
          <div className="pt-2">
            <AnswerForm
              submitLabel="Post answer"
              isPending={createAnswer.isPending}
              onCancel={() => setAnswering(false)}
              onSubmit={(answerText) =>
                createAnswer.mutate(
                  { questionId: question.id, idOrSlug, body: { answerText } },
                  { onSuccess: () => setAnswering(false) },
                )
              }
            />
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit h-8 rounded-xl border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 text-xs font-semibold gap-1.5 transition-all mt-1"
            onClick={() => setAnswering(true)}
          >
            <MessageCircle className="size-3.5" aria-hidden="true" />
            <span>Answer</span>
          </Button>
        ))}

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete this question?"
        description="This will also remove its answers. This can't be undone."
        isPending={deleteQuestion.isPending}
        onConfirm={() =>
          deleteQuestion.mutate({ questionId: question.id, idOrSlug }, { onSuccess: () => setConfirmDeleteOpen(false) })
        }
      />
    </div>
  )
}
