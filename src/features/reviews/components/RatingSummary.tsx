import { Skeleton } from '@/components/ui/skeleton'
import { useRatingSummary } from '@/features/reviews/hooks/useRatingSummary'
import { StarRatingDisplay } from '@/features/reviews/components/StarRatingDisplay'

const SUB_CATEGORIES: Array<{ key: 'averageCleanliness' | 'averageFacilities' | 'averageWomensArea' | 'averageParking'; label: string }> = [
  { key: 'averageCleanliness', label: 'Cleanliness' },
  { key: 'averageFacilities', label: 'Facilities' },
  { key: 'averageWomensArea', label: "Women's area" },
  { key: 'averageParking', label: 'Parking' },
]

interface RatingSummaryProps {
  idOrSlug: string
}

/** The Reviews tab's header block: overall average + total count, plus a
 * small breakdown of the four optional sub-categories (skipped entirely
 * when nobody has rated a given one yet). */
export function RatingSummary({ idOrSlug }: RatingSummaryProps) {
  const { data: summary, isLoading } = useRatingSummary(idOrSlug)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
    )
  }

  if (!summary || summary.totalReviews === 0) {
    return <p className="text-sm text-muted-foreground">No reviews yet — be the first to share your experience.</p>
  }

  const subCategories = SUB_CATEGORIES.filter((c) => summary[c.key] != null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-foreground">{summary.averageOverall.toFixed(1)}</span>
        <div className="flex flex-col gap-0.5">
          <StarRatingDisplay value={summary.averageOverall} size="md" />
          <span className="text-sm text-muted-foreground">
            {summary.totalReviews} review{summary.totalReviews === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {subCategories.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-4">
          {subCategories.map((c) => (
            <div key={c.key} className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">{c.label}</dt>
              {/* Non-null-asserted via the `filter` above, which narrows on
                  `!= null` but TypeScript can't carry that through the map
                  callback's closure — safe by construction. */}
              <dd className="text-sm font-medium text-foreground">{(summary[c.key] as number).toFixed(1)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
