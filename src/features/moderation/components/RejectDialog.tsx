import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface RejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  confirmLabel: string
  isPending: boolean
  onConfirm: (comment: string) => void
}

/** Shared "reject with an optional note" dialog for the submission/claim
 * moderation queues — approving is a single click (no dialog needed), but
 * rejecting benefits from a short explanation the submitter can see later
 * via `reviewComments`, so it gets one extra step. */
export function RejectDialog({ open, onOpenChange, title, confirmLabel, isPending, onConfirm }: RejectDialogProps) {
  const [comment, setComment] = useState('')

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setComment('')
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>An optional note is shared back with the submitter.</DialogDescription>
        </DialogHeader>
        <Textarea
          rows={3}
          placeholder="Reason (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={() => onConfirm(comment.trim())} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
