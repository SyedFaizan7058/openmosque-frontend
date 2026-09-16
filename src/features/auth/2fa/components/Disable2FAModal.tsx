import { useState } from 'react'
import { AlertTriangle, Loader2, ShieldOff } from 'lucide-react'
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
import { useDisable2FA } from '@/features/auth/2fa/hooks/use2FA'
import { clearDevice2FAVerified } from '@/features/auth/2fa/lib/twoFactorStorage'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

interface Disable2FAModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Disable2FAModal({ open, onOpenChange }: Disable2FAModalProps) {
  const [code, setCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const disableMutation = useDisable2FA()
  const user = useAuthStore((s) => s.user)
  const setTwoFactorRequired = useAuthStore((s) => s.setTwoFactorRequired)

  const handleDisable = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = code.trim()
    if (!clean) {
      toast.error('Please enter an authentication code.')
      return
    }

    disableMutation.mutate(
      useBackupCode ? { backupCode: clean } : { code: clean },
      {
        onSuccess: () => {
          if (user?.firebaseUid) {
            clearDevice2FAVerified(user.firebaseUid)
          }
          setTwoFactorRequired(false)
          toast.success('Two-factor authentication has been disabled.')
          onOpenChange(false)
        },
        onError: (err) => {
          console.error('[OpenMosque] Failed to disable 2FA:', err)
          toast.error('Verification failed. Invalid code or backup code.')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
            <ShieldOff className="size-6" />
          </div>
          <DialogTitle className="text-center text-xl">Disable Two-Factor Authentication</DialogTitle>
          <DialogDescription className="text-center">
            Disabling 2FA reduces your account security. To proceed, please confirm with a verification code.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2.5 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>
            Anyone with your password or Google account will be able to sign in without an additional challenge.
          </span>
        </div>

        <form onSubmit={handleDisable} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="disable-2fa-code">
                {useBackupCode ? '8-Character Backup Code' : '6-Digit Authenticator Code'}
              </Label>
              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode)
                  setCode('')
                }}
                className="text-xs text-primary hover:underline"
              >
                {useBackupCode ? 'Use authenticator code' : 'Use backup recovery code'}
              </button>
            </div>
            <Input
              id="disable-2fa-code"
              type="text"
              placeholder={useBackupCode ? 'XXXX-XXXX' : '123456'}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono text-center text-base tracking-wider"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={disableMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={disableMutation.isPending || !code.trim()}
              className="gap-1.5"
            >
              {disableMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Disable 2FA
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
