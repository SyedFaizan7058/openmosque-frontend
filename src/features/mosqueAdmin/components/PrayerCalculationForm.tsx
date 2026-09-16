import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { usePrayerConfig } from '@/features/mosqueAdmin/hooks/usePrayerConfig'
import { useUpdatePrayerConfig } from '@/features/mosqueAdmin/hooks/useUpdatePrayerConfig'
import { prayerConfigFormSchema } from '@/features/mosqueAdmin/schemas'
import type { PrayerConfigFormValues } from '@/features/mosqueAdmin/schemas'
import type { PrayerConfigUpdateDto } from '@/features/mosqueAdmin/types'
import { CALCULATION_METHOD_LABELS, JURISTIC_SCHOOL_LABELS } from '@/features/mosqueAdmin/lib/prayerLabels'

interface PrayerCalculationFormProps {
  mosqueId: string
}

const emptyDefaults: PrayerConfigFormValues = {
  calculationMethod: 'MUSLIM_WORLD_LEAGUE',
  juristicSchool: 'STANDARD',
  timeZone: '',
  fajrAngle: '',
  ishaAngle: '',
  highLatitudeRule: '',
}

/** How prayer times get calculated for this mosque — the astronomical
 * method + juristic school the public prayer-times widget's numbers
 * ultimately come from. `fajrAngle`/`ishaAngle` only matter when
 * `calculationMethod` is `CUSTOM`; shown always (not conditionally
 * hidden) since a mosque might switch methods later and want its custom
 * angles preserved in the form. */
export function PrayerCalculationForm({ mosqueId }: PrayerCalculationFormProps) {
  const { data: config, isLoading } = usePrayerConfig(mosqueId)
  const updateConfig = useUpdatePrayerConfig(mosqueId)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PrayerConfigFormValues>({
    resolver: zodResolver(prayerConfigFormSchema),
    // RHF's `values` (not `defaultValues`) keeps the form synced whenever
    // the query resolves/refetches, without fighting the user's own edits
    // via a manual `reset()` effect.
    values: config
      ? {
          calculationMethod: config.calculationMethod,
          juristicSchool: config.juristicSchool,
          timeZone: config.timeZone ?? '',
          fajrAngle: config.fajrAngle != null ? String(config.fajrAngle) : '',
          ishaAngle: config.ishaAngle != null ? String(config.ishaAngle) : '',
          highLatitudeRule: config.highLatitudeRule ?? '',
        }
      : emptyDefaults,
  })

  function onSubmit(values: PrayerConfigFormValues) {
    const body: PrayerConfigUpdateDto = {
      calculationMethod: values.calculationMethod,
      juristicSchool: values.juristicSchool,
      timeZone: values.timeZone?.trim() || undefined,
      fajrAngle: values.fajrAngle?.trim() ? Number(values.fajrAngle) : undefined,
      ishaAngle: values.ishaAngle?.trim() ? Number(values.ishaAngle) : undefined,
      highLatitudeRule: values.highLatitudeRule?.trim() || undefined,
    }
    updateConfig.mutate(body)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prayer Calculation Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prayer Calculation Settings</CardTitle>
        <CardDescription>How Adhan times are computed for the public prayer-times widget.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pc-method">Calculation method</Label>
              <Select id="pc-method" aria-invalid={!!errors.calculationMethod} {...register('calculationMethod')}>
                {Object.entries(CALCULATION_METHOD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pc-school">Juristic school</Label>
              <Select id="pc-school" aria-invalid={!!errors.juristicSchool} {...register('juristicSchool')}>
                {Object.entries(JURISTIC_SCHOOL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pc-tz">Time zone (optional)</Label>
              <Input id="pc-tz" placeholder="e.g. Asia/Kolkata" {...register('timeZone')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pc-highlat">High-latitude rule (optional)</Label>
              <Input id="pc-highlat" {...register('highLatitudeRule')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pc-fajr-angle">Fajr angle (Custom method only)</Label>
              <Input id="pc-fajr-angle" inputMode="decimal" {...register('fajrAngle')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pc-isha-angle">Isha angle (Custom method only)</Label>
              <Input id="pc-isha-angle" inputMode="decimal" {...register('ishaAngle')} />
            </div>
          </div>

          <Button type="submit" className="w-fit" disabled={updateConfig.isPending || !isDirty}>
            {updateConfig.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            Save calculation settings
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
