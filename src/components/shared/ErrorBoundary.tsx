import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/** Class component is required here — there is no hooks-based equivalent
 * of `componentDidCatch`/`getDerivedStateFromError` in React yet. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[OpenMosque] Uncaught render error:', error, errorInfo)
  }

  private handleReset = (): void => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
            <AlertTriangle className="size-12 text-destructive" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              An unexpected error occurred while rendering this page. Reloading usually fixes it.
            </p>
            <Button onClick={this.handleReset}>Reload page</Button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
