import type { LucideIcon } from 'lucide-react'
import { Construction } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface PagePlaceholderProps {
  title: string
  phase: number
  description?: string
  icon?: LucideIcon
}

/**
 * Standard "coming in a later phase" placeholder, used by every stub page
 * so routing/layout/guards are demonstrably wired end-to-end even before
 * the real feature is built. Not a dangling stub — a real, centered,
 * accessible page inside the standard container.
 */
export function PagePlaceholder({ title, phase, description, icon: Icon = Construction }: PagePlaceholderProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <CardHeader className="items-center">
          <Icon className="mb-2 size-10 text-accent" aria-hidden="true" />
          <CardTitle>{title}</CardTitle>
          <CardDescription>This page is coming in Phase {phase}.</CardDescription>
        </CardHeader>
        {description ? (
          <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
        ) : null}
      </Card>
    </div>
  )
}
