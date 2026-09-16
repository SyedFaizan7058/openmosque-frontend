import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { useCreateClaim } from '@/features/claims/hooks/useCreateClaim'
import { claimFormSchema } from '@/features/claims/schemas'
import type { ClaimFormValues } from '@/features/claims/schemas'

interface ClaimMosqueFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mosqueId: string
  mosqueName: string
}

/** "Claim this mosque" dialog — asserts the visitor is that mosque's
 * official admin. An approval promotes their account to `MOSQUE_ADMIN`
 * server-side (backend-api-contract.md §3); this form only collects the
 * verification details a moderator needs to judge that claim.
 * `proofDocumentUrl` stays a real URL field in the form schema/submission
 * — the "Choose file" control below is just a second way to *produce*
 * that URL (via `POST /media/upload-direct`) for a visitor who has a
 * photo ID or utility bill on their device rather than already hosted
 * somewhere they can link to. */
export function ClaimMosqueForm({ open, onOpenChange, mosqueId, mosqueName }: ClaimMosqueFormProps) {
  const createClaim = useCreateClaim()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: { fullName: '', phoneNumber: '', officialEmail: '', positionInMosque: '', proofDocumentUrl: '' },
  })
  const proofDocumentUrl = watch('proofDocumentUrl')

  function onSubmit(values: ClaimFormValues) {
    createClaim.mutate(
      { mosqueId, body: values },
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
          <DialogTitle>Claim {mosqueName}</DialogTitle>
          <DialogDescription>
            Verify you're an official representative of this mosque. A moderator will review your submission.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="claim-name">Full name</Label>
            <Input id="claim-name" aria-invalid={!!errors.fullName} {...register('fullName')} />
            {errors.fullName && <p role="alert" className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="claim-position">Your position at this mosque</Label>
            <Input id="claim-position" placeholder="e.g. Imam, Board Member" aria-invalid={!!errors.positionInMosque} {...register('positionInMosque')} />
            {errors.positionInMosque && <p role="alert" className="text-sm text-destructive">{errors.positionInMosque.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="claim-phone">Phone number</Label>
            <Input id="claim-phone" type="tel" aria-invalid={!!errors.phoneNumber} {...register('phoneNumber')} />
            {errors.phoneNumber && <p role="alert" className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="claim-email">Official email</Label>
            <Input id="claim-email" type="email" placeholder="you@mosque.org" aria-invalid={!!errors.officialEmail} {...register('officialEmail')} />
            {errors.officialEmail && <p role="alert" className="text-sm text-destructive">{errors.officialEmail.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="claim-proof-upload">Proof of Document</Label>
            <p className="text-xs text-muted-foreground">
              Attach utility bill, registration document, or committee ID (PDF or image, max 5 MB).
            </p>
            <div className="pt-1 flex items-center gap-3">
              <FileUploadField
                id="claim-proof-upload"
                category="PROOF_DOCUMENT"
                maxBytes={5 * 1024 * 1024}
                maxSizeLabel="5 MB"
                disabled={createClaim.isPending}
                onUploaded={(url) => setValue('proofDocumentUrl', url, { shouldValidate: true, shouldDirty: true })}
              />
              {proofDocumentUrl ? (
                <span className="text-xs font-medium text-primary flex items-center gap-1">
                  ✓ Document uploaded
                </span>
              ) : null}
            </div>
            {errors.proofDocumentUrl && (
              <p role="alert" className="text-sm text-destructive">{errors.proofDocumentUrl.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createClaim.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createClaim.isPending}>
              {createClaim.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              Submit claim
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
