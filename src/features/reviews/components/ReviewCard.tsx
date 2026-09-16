import { useState } from 'react'
import { format } from 'date-fns'
import { Flag, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ReportContentDialog } from '@/features/flags/components/ReportContentDialog'
import { StarRatingDisplay } from '@/features/reviews/components/StarRatingDisplay'
import { ReviewForm } from '@/features/reviews/components/ReviewForm'
import { useDeleteReview } from '@/features/reviews/hooks/useDeleteReview'
import type { ReviewResponseDto } from '@/features/reviews/types'

interface ReviewCardProps {
  review: ReviewResponseDto
  mosqueId: string
  idOrSlug: string
  /** Whether the signed-in visitor owns this review — gates the edit/delete
   * menu. `MosqueDetailPage`/`ReviewList` computes this once from the auth
   * store rather than every card reading it independently. */
  isOwn: boolean
}

function initialsFor(name: string | null | undefined): string {
  const source = (name ?? 'Anonymous').trim()
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

/** A single review — reviewer identity, star rating, free text, and (for
 * the review's own author) an edit/delete menu, or (for anyone else) a
 * report action. Never both on the same card: you can't report your own
 * review. */
export function ReviewCard({ review, mosqueId, idOrSlug, isOwn }: ReviewCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const deleteReview = useDeleteReview()

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs hover:border-[#007378]/30 transition-all mb-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border border-border/60">
            {review.userPhotoUrl ? <AvatarImage src={review.userPhotoUrl} alt="" /> : null}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {initialsFor(review.userDisplayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">{review.userDisplayName ?? 'Anonymous'}</span>
            <span className="text-xs text-muted-foreground">{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {isOwn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Review options" className="size-8">
                <MoreVertical className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil aria-hidden="true" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConfirmDeleteOpen(true)} className="text-destructive focus:text-destructive">
                <Trash2 aria-hidden="true" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <ReportContentDialog
            targetType="REVIEW"
            targetId={review.id}
            trigger={
              <Button type="button" variant="ghost" size="icon" aria-label="Report this review" className="size-8">
                <Flag className="size-4" aria-hidden="true" />
              </Button>
            }
          />
        )}
      </div>

      <StarRatingDisplay value={review.ratingOverall} />

      {review.reviewText && <p className="whitespace-pre-wrap text-sm text-foreground">{review.reviewText}</p>}

      {isOwn && (
        <>
          <ReviewForm open={editOpen} onOpenChange={setEditOpen} mosqueId={mosqueId} idOrSlug={idOrSlug} existingReview={review} />
          <ConfirmDialog
            open={confirmDeleteOpen}
            onOpenChange={setConfirmDeleteOpen}
            title="Delete this review?"
            description="This can't be undone."
            isPending={deleteReview.isPending}
            onConfirm={() =>
              deleteReview.mutate(
                { mosqueId, reviewId: review.id, idOrSlug },
                { onSuccess: () => setConfirmDeleteOpen(false) },
              )
            }
          />
        </>
      )}
    </div>
  )
}
