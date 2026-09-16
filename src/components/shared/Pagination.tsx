import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  /** Zero-indexed current page, matching the backend's `pageNumber`. */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

type PageToken = number | 'ellipsis'

/** Builds a windowed page-number list: always the first and last page,
 * always the pages immediately around `page`, and an ellipsis token
 * wherever a gap opens up — so a 40-page result set doesn't render 40
 * buttons. */
function buildPageWindow(page: number, totalPages: number): PageToken[] {
  const pageWindow = new Set<number>([0, totalPages - 1, page])
  if (page > 0) pageWindow.add(page - 1)
  if (page < totalPages - 1) pageWindow.add(page + 1)

  const sorted = [...pageWindow].filter((p) => p >= 0 && p < totalPages).sort((a, b) => a - b)

  const tokens: PageToken[] = []
  sorted.forEach((p, i) => {
    if (i > 0) {
      const prev = sorted[i - 1]
      if (prev !== undefined && p - prev > 1) tokens.push('ellipsis')
    }
    tokens.push(p)
  })
  return tokens
}

/** Reusable prev/next + numbered pager. Fully keyboard operable (plain
 * `<button>`s via `Button`) and marks the active page with
 * `aria-current="page"` for assistive tech. */
export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const tokens = buildPageWindow(page, totalPages)

  return (
    <nav aria-label="Pagination" className={cn('flex flex-wrap items-center justify-center gap-1', className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Previous page"
        disabled={page <= 0}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft aria-hidden="true" />
      </Button>

      {tokens.map((token, i) =>
        token === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground" aria-hidden="true">
            …
          </span>
        ) : (
          <Button
            key={token}
            type="button"
            variant={token === page ? 'default' : 'outline'}
            size="icon"
            aria-current={token === page ? 'page' : undefined}
            aria-label={`Page ${token + 1}`}
            onClick={() => onPageChange(token)}
          >
            {token + 1}
          </Button>
        ),
      )}

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Next page"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight aria-hidden="true" />
      </Button>

      <span className="sr-only" aria-live="polite">
        Page {page + 1} of {totalPages}
      </span>
    </nav>
  )
}
