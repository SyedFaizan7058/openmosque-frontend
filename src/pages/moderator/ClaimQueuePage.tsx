import { useState } from 'react'
import { format } from 'date-fns'
import { Check, FileCheck2, Mail, Phone, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { useClaimsQueue } from '@/features/claims/hooks/useClaimsQueue'
import { useDecideClaim } from '@/features/claims/hooks/useDecideClaim'
import type { ClaimStatus } from '@/features/claims/types'
import { RejectDialog } from '@/features/moderation/components/RejectDialog'
import { StatusFilterTabs } from '@/features/moderation/components/StatusFilterTabs'

const STATUS_VARIANT: Record<ClaimStatus, 'secondary' | 'default' | 'destructive'> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
}

/** Moderator queue for "claim this mosque" requests. Approving one
 * promotes the claimant to `MOSQUE_ADMIN` and awards the `VERIFIED_IMAM`
 * badge — entirely server-side, nothing extra to do here beyond recording
 * the decision. */
export default function ClaimQueuePage() {
  const [status, setStatus] = useState<ClaimStatus | undefined>('PENDING')
  const [page, setPage] = useState(0)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const { data, isLoading, isError } = useClaimsQueue(status, page)
  const decideClaim = useDecideClaim()

  const claims = data?.content ?? []

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <FileCheck2 className="size-6 text-primary" aria-hidden="true" />
          Claim Requests
        </h1>
        <p className="text-sm text-muted-foreground">Visitors asserting they're a mosque's official administrator.</p>
      </div>

      <StatusFilterTabs
        value={status}
        onChange={(v) => {
          setStatus(v)
          setPage(0)
        }}
        options={[
          { value: 'PENDING', label: 'Pending' },
          { value: 'APPROVED', label: 'Approved' },
          { value: 'REJECTED', label: 'Rejected' },
          { value: undefined, label: 'All' },
        ]}
      />

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load claims" description="Something went wrong reaching the server." />
      ) : claims.length === 0 ? (
        <EmptyState icon={FileCheck2} title="Nothing here" description="No claim requests match this filter." />
      ) : (
        <div className="flex flex-col gap-4">
          {claims.map((claim) => (
            <Card key={claim.id}>
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{claim.mosqueName}</h3>
                      <Badge variant={STATUS_VARIANT[claim.status]}>{claim.status}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {claim.fullName} — {claim.positionInMosque}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{format(new Date(claim.createdAt), 'MMM d, yyyy, h:mm a')}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5" aria-hidden="true" /> {claim.officialEmail}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5" aria-hidden="true" /> {claim.phoneNumber}
                  </span>
                  <a
                    href={claim.proofDocumentUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-primary hover:underline"
                  >
                    View proof document
                  </a>
                </div>

                {claim.reviewComments && (
                  <p className="rounded-md bg-secondary/40 p-2 text-xs text-secondary-foreground">
                    Reviewer note: {claim.reviewComments}
                  </p>
                )}

                {claim.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => decideClaim.mutate({ claimId: claim.id, decision: { status: 'APPROVED' } })}
                      disabled={decideClaim.isPending}
                    >
                      <Check aria-hidden="true" /> Approve
                    </Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => setRejectingId(claim.id)}>
                      <X aria-hidden="true" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}

      <RejectDialog
        open={rejectingId !== null}
        onOpenChange={(open) => !open && setRejectingId(null)}
        title="Reject this claim?"
        confirmLabel="Reject"
        isPending={decideClaim.isPending}
        onConfirm={(comment) => {
          if (!rejectingId) return
          decideClaim.mutate(
            { claimId: rejectingId, decision: { status: 'REJECTED', reviewComments: comment || undefined } },
            { onSuccess: () => setRejectingId(null) },
          )
        }}
      />
    </div>
  )
}
