import { useState } from 'react'
import { format } from 'date-fns'
import { Check, Flag, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { useDecideFlag } from '@/features/flags/hooks/useDecideFlag'
import { useFlagsQueue } from '@/features/flags/hooks/useFlagsQueue'
import type { FlagStatus } from '@/features/flags/types'
import { RejectDialog } from '@/features/moderation/components/RejectDialog'
import { StatusFilterTabs } from '@/features/moderation/components/StatusFilterTabs'

const STATUS_VARIANT: Record<FlagStatus, 'secondary' | 'default' | 'destructive'> = {
  PENDING: 'secondary',
  RESOLVED: 'default',
  DISMISSED: 'destructive',
}

/** Moderator queue for reported content (reviews/questions/answers). The
 * backend only returns `targetType` + `targetId`, not the flagged text
 * itself — there's no endpoint to fetch a review/question/answer by id in
 * isolation — so a moderator judges the report from its reason and takes
 * action directly on the underlying content elsewhere (e.g. that mosque's
 * page) if needed; this queue's job is recording the flag decision, not
 * previewing the content. */
export default function FlagQueuePage() {
  const [status, setStatus] = useState<FlagStatus | undefined>('PENDING')
  const [page, setPage] = useState(0)
  const [dismissingId, setDismissingId] = useState<string | null>(null)
  const { data, isLoading, isError } = useFlagsQueue(page)
  const decideFlag = useDecideFlag()

  // Unlike submissions/claims, `GET /admin/community/flags` takes no
  // `status` query param (backend-api-contract.md §5) — so this filters
  // client-side within whatever page is loaded. Pagination is still driven
  // by the server's unfiltered `totalPages`, so a filtered view can look
  // sparse on a page that's mostly a different status; acceptable for a
  // first pass, worth a real backend filter param later.
  const allFlags = data?.content ?? []
  const flags = status ? allFlags.filter((f) => f.status === status) : allFlags

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Flag className="size-6 text-primary" aria-hidden="true" />
          Flagged Content
        </h1>
        <p className="text-sm text-muted-foreground">Reviews, questions, and answers reported by visitors.</p>
      </div>

      <StatusFilterTabs
        value={status}
        onChange={setStatus}
        options={[
          { value: 'PENDING', label: 'Pending' },
          { value: 'RESOLVED', label: 'Resolved' },
          { value: 'DISMISSED', label: 'Dismissed' },
          { value: undefined, label: 'All' },
        ]}
      />

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load flags" description="Something went wrong reaching the server." />
      ) : flags.length === 0 ? (
        <EmptyState icon={Flag} title="Nothing here" description="No flagged content matches this filter." />
      ) : (
        <div className="flex flex-col gap-4">
          {flags.map((flag) => (
            <Card key={flag.id}>
              <CardContent className="flex flex-col gap-2 pt-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{flag.targetType}</Badge>
                    <Badge variant={STATUS_VARIANT[flag.status]}>{flag.status}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{format(new Date(flag.createdAt), 'MMM d, yyyy')}</span>
                </div>

                <p className="text-sm text-foreground">{flag.reason}</p>
                <p className="text-xs text-muted-foreground">
                  Reported by {flag.reporterEmail ?? 'a user'} · target id {flag.targetId}
                </p>

                {flag.reviewerNotes && (
                  <p className="rounded-md bg-secondary/40 p-2 text-xs text-secondary-foreground">
                    Reviewer note: {flag.reviewerNotes}
                  </p>
                )}

                {flag.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => decideFlag.mutate({ flagId: flag.id, decision: { status: 'RESOLVED' } })}
                      disabled={decideFlag.isPending}
                    >
                      <Check aria-hidden="true" /> Resolve
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setDismissingId(flag.id)}>
                      <X aria-hidden="true" /> Dismiss
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
        open={dismissingId !== null}
        onOpenChange={(open) => !open && setDismissingId(null)}
        title="Dismiss this report?"
        confirmLabel="Dismiss"
        isPending={decideFlag.isPending}
        onConfirm={(comment) => {
          if (!dismissingId) return
          decideFlag.mutate(
            { flagId: dismissingId, decision: { status: 'DISMISSED', reviewerNotes: comment || undefined } },
            { onSuccess: () => setDismissingId(null) },
          )
        }}
      />
    </div>
  )
}
