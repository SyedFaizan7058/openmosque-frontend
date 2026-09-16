import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Router-level fallback (`errorElement`) for every top-level route group.
 * A render error thrown anywhere in that subtree — the layout included —
 * would otherwise surface React Router's raw, unstyled default error page
 * (no app chrome, no way back), which is exactly what a real bug briefly
 * did before this existed. This is the safety net for anything an inline
 * page-level try/catch or empty-state check misses.
 */
export default function RouteErrorPage() {
  const error = useRouteError()

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <AlertTriangle className="size-12 text-destructive" aria-hidden="true" />
      <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => window.location.reload()}>Reload the page</Button>
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
