import { useState } from 'react'
import { format } from 'date-fns'
import { Check, ClipboardList, MapPin, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { RejectDialog } from '@/features/moderation/components/RejectDialog'
import { StatusFilterTabs } from '@/features/moderation/components/StatusFilterTabs'
import { useDecideSubmission } from '@/features/submissions/hooks/useDecideSubmission'
import { useSubmissionsQueue } from '@/features/submissions/hooks/useSubmissionsQueue'
import type { SubmissionStatus } from '@/features/submissions/types'

const STATUS_VARIANT: Record<SubmissionStatus, 'secondary' | 'default' | 'destructive'> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
}

/** Moderator queue for crowdsourced mosque submissions and edit
 * suggestions (`SubmissionType` distinguishes the two, both reviewed here
 * through the same decision endpoint). Defaults to `PENDING` since that's
 * the only status that actually needs a moderator's attention. */
export default function SubmissionQueuePage() {
  const [status, setStatus] = useState<SubmissionStatus | undefined>('PENDING')
  const [page, setPage] = useState(0)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const { data, isLoading, isError } = useSubmissionsQueue(status, page)
  const decideSubmission = useDecideSubmission()

  const submissions = data?.content ?? []

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <ClipboardList className="size-6 text-primary" aria-hidden="true" />
          Submission Queue
        </h1>
        <p className="text-sm text-muted-foreground">New mosque submissions and edit suggestions awaiting review.</p>
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
        <EmptyState title="Couldn't load submissions" description="Something went wrong reaching the server." />
      ) : submissions.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Nothing here" description="No submissions match this filter." />
      ) : (
        <div className="flex flex-col gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{submission.name}</h3>
                      <Badge variant="outline">{submission.submissionType === 'NEW_MOSQUE' ? 'New Mosque' : 'Edit Suggestion'}</Badge>
                      <Badge variant={STATUS_VARIANT[submission.status]}>{submission.status}</Badge>
                    </div>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      {[submission.address, submission.city, submission.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{format(new Date(submission.createdAt), 'MMM d, yyyy, h:mm a')}</span>
                </div>

                {submission.description && <p className="text-sm text-foreground">{submission.description}</p>}

                <p className="text-xs text-muted-foreground">
                  Submitted by {submission.submitterName ?? submission.submitterEmail ?? 'a user'}
                </p>

                {submission.reviewComments && (
                  <p className="rounded-md bg-secondary/40 p-2 text-xs text-secondary-foreground">
                    Reviewer note: {submission.reviewComments}
                  </p>
                )}

                {submission.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => decideSubmission.mutate({ submissionId: submission.id, decision: { status: 'APPROVED' } })}
                      disabled={decideSubmission.isPending}
                    >
                      <Check aria-hidden="true" /> Approve
                    </Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => setRejectingId(submission.id)}>
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
        title="Reject this submission?"
        confirmLabel="Reject"
        isPending={decideSubmission.isPending}
        onConfirm={(comment) => {
          if (!rejectingId) return
          decideSubmission.mutate(
            { submissionId: rejectingId, decision: { status: 'REJECTED', reviewComments: comment || undefined } },
            { onSuccess: () => setRejectingId(null) },
          )
        }}
      />
    </div>
  )
}
