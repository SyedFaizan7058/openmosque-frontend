import { useState } from 'react'
import { format } from 'date-fns'
import { Flag, MoreVertical, Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ReportContentDialog } from '@/features/flags/components/ReportContentDialog'
import { AnswerForm } from '@/features/questions/components/AnswerForm'
import { useDeleteAnswer } from '@/features/questions/hooks/useDeleteAnswer'
import { useUpdateAnswer } from '@/features/questions/hooks/useUpdateAnswer'
import type { AnswerResponseDto } from '@/features/questions/types'

interface AnswerCardProps {
  answer: AnswerResponseDto
  idOrSlug: string
  isOwn: boolean
}

function initialsFor(name: string | null | undefined): string {
  const source = (name ?? 'Anonymous').trim()
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

/** One answer within a question's thread. `officialMosqueAdmin` (the
 * backend flags this per-answer, based on whether the answerer currently
 * has a claimed-admin relationship to the mosque) gets a small badge so
 * visitors can tell an authoritative reply from a fellow visitor's. */
export function AnswerCard({ answer, idOrSlug, isOwn }: AnswerCardProps) {
  const [editing, setEditing] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const updateAnswer = useUpdateAnswer()
  const deleteAnswer = useDeleteAnswer()

  return (
    <div className="flex items-start gap-3 rounded-xl border border-teal-200/80 dark:border-teal-900/50 bg-teal-50/25 dark:bg-teal-950/20 p-3.5 sm:p-4 ml-1 sm:ml-4">
      <Avatar className="size-8 shrink-0 border border-teal-200/60">
        {answer.userPhotoUrl ? <AvatarImage src={answer.userPhotoUrl} alt="" /> : null}
        <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
          {initialsFor(answer.userDisplayName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{answer.userDisplayName ?? 'Anonymous'}</span>
            {answer.officialMosqueAdmin && (
              <Badge className="gap-1 text-[10px] bg-[#007378] hover:bg-[#005c60] text-white font-semibold">
                <ShieldCheck className="size-3" aria-hidden="true" /> Mosque Admin
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{format(new Date(answer.createdAt), 'MMM d, yyyy')}</span>
          </div>

          {isOwn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" aria-label="Answer options" className="size-7">
                  <MoreVertical className="size-3.5" aria-hidden="true" />
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
              targetType="ANSWER"
              targetId={answer.id}
              trigger={
                <Button type="button" variant="ghost" size="icon" aria-label="Report this answer" className="size-7">
                  <Flag className="size-3.5" aria-hidden="true" />
                </Button>
              }
            />
          )}
        </div>

        {editing ? (
          <AnswerForm
            defaultValue={answer.answerText}
            submitLabel="Save"
            isPending={updateAnswer.isPending}
            onCancel={() => setEditing(false)}
            onSubmit={(answerText) =>
              updateAnswer.mutate({ answerId: answer.id, idOrSlug, body: { answerText } }, { onSuccess: () => setEditing(false) })
            }
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm text-foreground">{answer.answerText}</p>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete this answer?"
        description="This can't be undone."
        isPending={deleteAnswer.isPending}
        onConfirm={() => deleteAnswer.mutate({ answerId: answer.id, idOrSlug }, { onSuccess: () => setConfirmDeleteOpen(false) })}
      />
    </div>
  )
}
