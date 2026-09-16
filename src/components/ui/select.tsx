import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

/** A plain native `<select>` styled to match `Input`/`Textarea` — not a
 * Radix primitive. This codebase deliberately reaches for a native control
 * over a new dependency for closed, short enum pickers (see
 * `FacilityCheckboxGroup`'s doc comment for the same call on checkboxes);
 * the option lists here (calculation methods, iqamah type, event
 * type/audience) are all plain enums with no need for search, multi-select,
 * or custom option rendering, so a real `<select>` — free keyboard/
 * accessibility support, zero extra bundle weight — is the right tool. */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  )
})
Select.displayName = 'Select'

export { Select }
