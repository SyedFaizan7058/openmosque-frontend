import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ShareMosqueButtonProps {
  mosqueName: string
  className?: string
}

/** Shares the current page URL via the native share sheet where available
 * (mobile browsers, some desktop browsers), falling back to copying the
 * link to the clipboard with a toast confirmation everywhere else — there
 * is no backend endpoint involved, this is purely a client-side share of
 * the page the visitor is already on. */
export function ShareMosqueButton({ mosqueName, className }: ShareMosqueButtonProps) {
  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: mosqueName, url })
      } catch (err) {
        // AbortError fires when the user just dismisses the share sheet —
        // not a real failure, nothing to report.
        if (err instanceof Error && err.name !== 'AbortError') {
          toast.error("Couldn't share this page. Please try again.")
        }
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard.')
    } catch {
      toast.error("Couldn't copy the link. Please copy it from the address bar.")
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      <Share2 className="size-4" aria-hidden="true" />
      Share
    </button>
  )
}
