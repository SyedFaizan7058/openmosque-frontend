import { useState } from 'react'
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRegenerateBackupCodes } from '@/features/auth/2fa/hooks/use2FA'
import { BackupCodesDisplay } from '@/features/auth/2fa/components/BackupCodesDisplay'

interface RegenerateBackupCodesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegenerateBackupCodesModal({ open, onOpenChange }: RegenerateBackupCodesModalProps) {
  const [code, setCode] = useState('')
  const [newCodes, setNewCodes] = useState<string[] | null>(null)
  const regenerateMutation = useRegenerateBackupCodes()

  const handleRegenerate = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = code.trim().replace(/\D/g, '')
    if (clean.length !== 6) {
      toast.error('Please enter a valid 6-digit code from your authenticator app.')
      return
    }

    regenerateMutation.mutate(clean, {
      onSuccess: (codes) => {
        toast.success('Generated 8 new backup recovery codes.')
        setNewCodes(codes)
      },
      onError: (err) => {
        console.error('[OpenMosque] Failed to regenerate backup codes:', err)
        toast.error('Verification failed. Invalid authenticator code.')
      },
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    setCode('')
    setNewCodes(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {newCodes ? (
          <div className="space-y-4">
            <DialogHeader>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                <CheckCircle2 className="size-6" />
              </div>
              <DialogTitle className="text-center text-xl">New Backup Codes Generated</DialogTitle>
              <DialogDescription className="text-center">
                All previous backup recovery codes have been invalidated.
              </DialogDescription>
            </DialogHeader>

            <BackupCodesDisplay codes={newCodes} />

            <div className="pt-2">
              <Button type="button" className="w-full" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <DialogHeader>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-primary mb-2">
                <RefreshCw className="size-6" />
              </div>
              <DialogTitle className="text-center text-xl">Regenerate Backup Codes</DialogTitle>
              <DialogDescription className="text-center">
                Generating new backup codes will invalidate all existing backup codes immediately.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRegenerate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="regen-2fa-code">6-Digit Authenticator Code</Label>
                <Input
                  id="regen-2fa-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="font-mono text-center text-lg tracking-widest"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={regenerateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={regenerateMutation.isPending || code.length !== 6}
                  className="gap-1.5"
                >
                  {regenerateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Regenerate Codes
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
