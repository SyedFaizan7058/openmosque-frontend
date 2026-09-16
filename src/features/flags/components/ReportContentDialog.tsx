import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Flag, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useFlagContent } from '@/features/flags/hooks/useFlagContent'
import type { TargetType } from '@/features/flags/types'

interface ReportContentDialogProps {
  targetType: TargetType
  targetId: string
  /** Rendered as the dialog's trigger — kept generic (rather than a fixed
   * icon button) so a review card, a question card, and an answer card can
   * each style the trigger to fit their own layout. */
  trigger: ReactNode
}

/** Generic "report this" dialog — one small reason textarea, wired to
 * `POST /api/v1/community/flag`. Shared by reviews, questions, and answers
 * rather than each feature building its own report flow, since the
 * request shape (`targetType` + `targetId` + `reason`) is identical for
 * all three. */
export function ReportContentDialog({ targetType, targetId, trigger }: ReportContentDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const flagContent = useFlagContent()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!reason.trim()) return
    flagContent.mutate(
      { targetType, targetId, reason: reason.trim() },
      {
        onSuccess: () => {
          setOpen(false)
          setReason('')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="size-4 text-destructive" aria-hidden="true" />
            Report content
          </DialogTitle>
          <DialogDescription>
            Let a moderator know what's wrong with this {targetType.toLowerCase()}. They'll review it before taking
            action.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
          <label htmlFor="report-reason" className="sr-only">
            Reason for reporting
          </label>
          <Textarea
            id="report-reason"
            rows={3}
            required
            placeholder="What's the issue? (e.g. spam, inappropriate language, false information)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={flagContent.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={flagContent.isPending || !reason.trim()}>
              {flagContent.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              Submit report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
