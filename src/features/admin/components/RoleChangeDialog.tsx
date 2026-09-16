import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { UserRole } from '@/lib/constants'

interface PendingRoleChange {
  userId: string
  userLabel: string
  fromRole: UserRole
  toRole: UserRole
}

interface RoleChangeDialogProps {
  pending: PendingRoleChange | null
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

/** A role change is a high-impact, irreversible-feeling action (it can
 * hand someone `SUPER_ADMIN`, or take `MOSQUE_ADMIN` away from someone
 * actively managing a mosque) — worth one confirmation step, unlike the
 * single-click "Approve" elsewhere in the moderation queues where the
 * only destructive path (Reject) is what gets a dialog. */
export function RoleChangeDialog({ pending, isPending, onCancel, onConfirm }: RoleChangeDialogProps) {
  return (
    <Dialog open={pending !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change this user's role?</DialogTitle>
          <DialogDescription>
            {pending && (
              <>
                <span className="font-medium text-foreground">{pending.userLabel}</span> will move from{' '}
                <span className="font-medium text-foreground">{pending.fromRole}</span> to{' '}
                <span className="font-medium text-foreground">{pending.toRole}</span>. This takes effect immediately.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            Confirm change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
