import { cn } from '@/lib/utils'

interface StatusFilterTabsProps<T extends string> {
  value: T | undefined
  options: Array<{ value: T | undefined; label: string }>
  onChange: (value: T | undefined) => void
}

/** Small pill-tab row for filtering a moderation queue by status — shared
 * shape across submissions/claims (both take an optional `status` query
 * param with the same three-ish values). Not a `role="tablist"` (these
 * filter a list in place rather than switching between independent
 * panels), so plain toggle buttons are the more accurate semantics. */
export function StatusFilterTabs<T extends string>({ value, options, onChange }: StatusFilterTabsProps<T>) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.label}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
            value === opt.value
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-muted-foreground hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
