import { useState, useEffect } from 'react'
import { CheckCircle2, KeyRound, Loader2 } from 'lucide-react'
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
import { useSetup2FA, useEnable2FA } from '@/features/auth/2fa/hooks/use2FA'
import { QrCodeDisplay } from '@/features/auth/2fa/components/QrCodeDisplay'
import { BackupCodesDisplay } from '@/features/auth/2fa/components/BackupCodesDisplay'
import type { TwoFactorSetupResponseDto } from '@/features/auth/2fa/types'

interface Setup2FAModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Setup2FAModal({ open, onOpenChange }: Setup2FAModalProps) {
  const [setupData, setSetupData] = useState<TwoFactorSetupResponseDto | null>(null)
  const [code, setCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)

  const setupMutation = useSetup2FA()
  const enableMutation = useEnable2FA()

  useEffect(() => {
    if (open) {
      setCode('')
      setBackupCodes(null)
      setupMutation.mutate(undefined, {
        onSuccess: (data) => setSetupData(data),
        onError: (err) => {
          console.error('[OpenMosque] Failed to initiate 2FA setup:', err)
          toast.error('Could not initiate 2FA setup. Please try again.')
          onOpenChange(false)
        },
      })
    } else {
      setSetupData(null)
      setBackupCodes(null)
      setCode('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleVerifyAndEnable = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = code.trim().replace(/\s+/g, '')
    if (cleanCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code.')
      return
    }

    enableMutation.mutate(cleanCode, {
      onSuccess: (res) => {
        toast.success('Two-factor authentication enabled successfully!')
        setBackupCodes(res.backupCodes)
      },
      onError: (err) => {
        console.error('[OpenMosque] Failed to enable 2FA:', err)
        toast.error('Invalid authentication code. Please verify the code and try again.')
      },
    })
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {backupCodes ? (
          <div className="space-y-4">
            <DialogHeader>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                <CheckCircle2 className="size-6" />
              </div>
              <DialogTitle className="text-center text-xl">2FA Is Now Active</DialogTitle>
              <DialogDescription className="text-center">
                Your account is now protected with Two-Factor Authentication.
              </DialogDescription>
            </DialogHeader>

            <BackupCodesDisplay codes={backupCodes} />

            <div className="pt-2">
              <Button type="button" className="w-full" onClick={handleClose}>
                I have safely stored these codes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <DialogHeader>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                <KeyRound className="size-6" />
              </div>
              <DialogTitle className="text-center text-xl">Set Up Two-Factor Authentication</DialogTitle>
              <DialogDescription className="sr-only">
                Scan the QR code with your authenticator app and enter the verification code.
              </DialogDescription>
            </DialogHeader>

            {setupMutation.isPending || !setupData ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6 pt-1">
                <QrCodeDisplay
                  qrCodeUri={setupData.qrCodeUri}
                  manualEntryKey={setupData.manualEntryKey}
                  instructions={setupData.instructions}
                />

                <form onSubmit={handleVerifyAndEnable} className="space-y-6 pt-4 border-t border-border/60">
                  <div className="flex flex-col items-center gap-2.5">
                    <Label
                      htmlFor="two-factor-setup-code"
                      className="text-sm font-semibold text-foreground tracking-wide"
                    >
                      Enter 6-digit Code
                    </Label>
                    <Input
                      id="two-factor-setup-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="123456"
                      autoComplete="one-time-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      className="h-12 w-full max-w-xs text-center text-xl tracking-[0.35em] font-mono shadow-xs"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={enableMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={enableMutation.isPending || code.length !== 6}
                      className="gap-1.5 px-5"
                    >
                      {enableMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      Verify & Activate
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
