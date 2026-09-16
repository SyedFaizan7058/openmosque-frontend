import { useFacilities } from '@/features/mosques/hooks/useFacilities'
import { Skeleton } from '@/components/ui/skeleton'

interface FacilityCheckboxGroupProps {
  value: string[]
  onChange: (codes: string[]) => void
}

/** Live facility catalog rendered as a checkbox grid — used by the mosque
 * submission form's `facilityCodes` field. Plain checkboxes rather than a
 * dedicated shadcn `Checkbox` primitive (not in `components/ui/` yet, and
 * a one-off multi-select doesn't justify adding a whole new primitive for
 * this single call site). */
export function FacilityCheckboxGroup({ value, onChange }: FacilityCheckboxGroupProps) {
  const { data: facilities, isLoading } = useFacilities()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  function toggle(code: string) {
    onChange(value.includes(code) ? value.filter((c) => c !== code) : [...value, code])
  }

  return (
    <div role="group" aria-label="Facilities" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {(facilities ?? []).map((facility) => {
        const checked = value.includes(facility.code)
        return (
          <label
            key={facility.id}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(facility.code)}
              className="size-4 rounded border-input accent-primary"
            />
            {facility.name}
          </label>
        )
      })}
    </div>
  )
}
