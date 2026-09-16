import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
  highlightLine?: boolean
}

/** Generic "nothing here yet" placeholder — supports standard dashed layout or
 * themed card layout with a primary color highlight line. */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className, highlightLine = false }: EmptyStateProps) {
  return (
    <div
      className={cn(
        highlightLine
          ? 'relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/80 bg-card px-6 py-12 text-center shadow-xs'
          : 'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center',
        className,
      )}
    >
      {highlightLine ? (
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
          <Icon className="size-7" aria-hidden="true" />
        </div>
      ) : (
        <Icon className="size-10 text-muted-foreground" aria-hidden="true" />
      )}
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      {description ? <p className="max-w-md text-sm text-muted-foreground leading-relaxed">{description}</p> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
