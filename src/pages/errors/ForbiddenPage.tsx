import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <ShieldAlert className="size-12 text-destructive" aria-hidden="true" />
      <h1 className="text-3xl font-bold text-foreground">403 — Access denied</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        You don&apos;t have permission to view this page. If you think this is a mistake, contact an
        administrator.
      </p>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  )
}
