import { useState } from 'react'
import { MessageSquarePlus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { useAuthStore, selectIsAuthenticated, selectUser } from '@/features/auth/store/useAuthStore'
import { RatingSummary } from '@/features/reviews/components/RatingSummary'
import { ReviewCard } from '@/features/reviews/components/ReviewCard'
import { ReviewForm } from '@/features/reviews/components/ReviewForm'
import { useReviews } from '@/features/reviews/hooks/useReviews'

interface ReviewListProps {
  mosqueId: string
  idOrSlug: string
}

/** The mosque detail page's Reviews tab: rating summary header, a "write a
 * review" CTA (or, if the signed-in visitor already left one, an inline
 * prompt to edit it instead — the backend has no dedicated "my review"
 * endpoint, so this scans the currently-loaded page for a match, same
 * approach `backend_analysis.md` §6 recommends), and the paginated list. */
export function ReviewList({ mosqueId, idOrSlug }: ReviewListProps) {
  const [page, setPage] = useState(0)
  const [writeOpen, setWriteOpen] = useState(false)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const currentUser = useAuthStore(selectUser)
  const { data, isLoading, isError } = useReviews(idOrSlug, page)

  const reviews = data?.content ?? []
  const myReview = currentUser ? reviews.find((r) => r.userId === currentUser.id) : undefined

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
        <RatingSummary idOrSlug={idOrSlug} />

        {isAuthenticated && !myReview && (
          <Button
            type="button"
            onClick={() => setWriteOpen(true)}
            className="shrink-0 h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm gap-2 shadow-xs transition-all"
          >
            <Star className="size-4 fill-current" aria-hidden="true" />
            <span>Write a review</span>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load reviews" description="Something went wrong reaching the server." />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquarePlus}
          title="No reviews yet"
          description="Be the first to share your experience at this mosque."
        />
      ) : (
        <div className="flex flex-col">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              mosqueId={mosqueId}
              idOrSlug={idOrSlug}
              isOwn={currentUser?.id === review.userId}
            />
          ))}
        </div>
      )}

      {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}

      <ReviewForm open={writeOpen} onOpenChange={setWriteOpen} mosqueId={mosqueId} idOrSlug={idOrSlug} />
    </div>
  )
}
