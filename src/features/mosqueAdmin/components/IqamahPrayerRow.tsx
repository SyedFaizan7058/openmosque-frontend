import type { UseFormRegister, UseFormWatch } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { IQAMAH_TYPE_LABELS } from '@/features/mosqueAdmin/lib/prayerLabels'
import type { IqamahPrayerKey } from '@/features/mosqueAdmin/types'
import type { IqamahScheduleFormValues } from '@/features/mosqueAdmin/schemas'

interface IqamahPrayerRowProps {
  prayerKey: IqamahPrayerKey
  label: string
  register: UseFormRegister<IqamahScheduleFormValues>
  watch: UseFormWatch<IqamahScheduleFormValues>
}

/** One prayer's row in the Iqamah Schedule form: a type toggle (offset vs.
 * fixed time) plus whichever single input that type actually needs, and an
 * optional Adhan-time override. Extracted from `IqamahScheduleForm` since
 * the same four fields repeat for all five daily prayers — a `maxVisible`-
 * style "don't repeat this five times" split, not a new abstraction for
 * its own sake. */
export function IqamahPrayerRow({ prayerKey, label, register, watch }: IqamahPrayerRowProps) {
  const type = watch(`${prayerKey}.type`)

  return (
    <div className="grid grid-cols-1 items-end gap-3 border-b border-border pb-4 last:border-0 last:pb-0 sm:grid-cols-4">
      <div className="flex flex-col gap-1.5">
        <Label>{label}</Label>
        <Select {...register(`${prayerKey}.type`)}>
          {Object.entries(IQAMAH_TYPE_LABELS).map(([value, optionLabel]) => (
            <option key={value} value={value}>
              {optionLabel}
            </option>
          ))}
        </Select>
      </div>

      {type === 'FIXED_TIME' ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${prayerKey}-fixed`}>Iqamah time</Label>
          <Input id={`${prayerKey}-fixed`} type="time" {...register(`${prayerKey}.fixedTime`)} />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${prayerKey}-offset`}>Minutes after Adhan</Label>
          <Input id={`${prayerKey}-offset`} type="number" inputMode="numeric" min={0} {...register(`${prayerKey}.offsetMinutes`)} />
        </div>
      )}

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor={`${prayerKey}-adhan`}>Adhan time override (optional)</Label>
        <Input id={`${prayerKey}-adhan`} type="time" {...register(`${prayerKey}.adhanTime`)} />
      </div>
    </div>
  )
}
