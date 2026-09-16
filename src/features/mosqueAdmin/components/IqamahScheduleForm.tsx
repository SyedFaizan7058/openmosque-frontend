import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { IqamahPrayerRow } from '@/features/mosqueAdmin/components/IqamahPrayerRow'
import { useIqamahSchedule } from '@/features/mosqueAdmin/hooks/useIqamahSchedule'
import { useUpdateIqamahSchedule } from '@/features/mosqueAdmin/hooks/useUpdateIqamahSchedule'
import { iqamahScheduleFormSchema } from '@/features/mosqueAdmin/schemas'
import type { IqamahScheduleFormValues } from '@/features/mosqueAdmin/schemas'
import type { IqamahScheduleDto, IqamahScheduleUpdateDto } from '@/features/mosqueAdmin/types'
import { IQAMAH_PRAYER_LABELS } from '@/features/mosqueAdmin/lib/prayerLabels'

interface IqamahScheduleFormProps {
  mosqueId: string
}

const emptyPrayer = { type: 'OFFSET_AFTER_ADHAN' as const, offsetMinutes: '10', fixedTime: '', adhanTime: '' }

const emptyDefaults: IqamahScheduleFormValues = {
  fajr: emptyPrayer,
  dhuhr: emptyPrayer,
  asr: emptyPrayer,
  maghrib: emptyPrayer,
  isha: emptyPrayer,
  jummah1Time: '',
  jummah2Time: '',
  jummahKhutbahLanguage: '',
}

/** Written out explicitly per prayer (no dynamic `dto[`${key}Type`]`
 * indexing) — matches this codebase's convention of spelling every DTO
 * field out by hand (see `IqamahScheduleDto` itself) rather than reaching
 * for mapped-type cleverness on a five-item, unlikely-to-grow list. */
function dtoToFormValues(dto: IqamahScheduleDto): IqamahScheduleFormValues {
  return {
    fajr: {
      type: dto.fajrType,
      offsetMinutes: dto.fajrOffsetMinutes != null ? String(dto.fajrOffsetMinutes) : '',
      fixedTime: dto.fajrFixedTime ?? '',
      adhanTime: dto.fajrAdhanTime ?? '',
    },
    dhuhr: {
      type: dto.dhuhrType,
      offsetMinutes: dto.dhuhrOffsetMinutes != null ? String(dto.dhuhrOffsetMinutes) : '',
      fixedTime: dto.dhuhrFixedTime ?? '',
      adhanTime: dto.dhuhrAdhanTime ?? '',
    },
    asr: {
      type: dto.asrType,
      offsetMinutes: dto.asrOffsetMinutes != null ? String(dto.asrOffsetMinutes) : '',
      fixedTime: dto.asrFixedTime ?? '',
      adhanTime: dto.asrAdhanTime ?? '',
    },
    maghrib: {
      type: dto.maghribType,
      offsetMinutes: dto.maghribOffsetMinutes != null ? String(dto.maghribOffsetMinutes) : '',
      fixedTime: dto.maghribFixedTime ?? '',
      adhanTime: dto.maghribAdhanTime ?? '',
    },
    isha: {
      type: dto.ishaType,
      offsetMinutes: dto.ishaOffsetMinutes != null ? String(dto.ishaOffsetMinutes) : '',
      fixedTime: dto.ishaFixedTime ?? '',
      adhanTime: dto.ishaAdhanTime ?? '',
    },
    jummah1Time: dto.jummah1Time ?? '',
    jummah2Time: dto.jummah2Time ?? '',
    jummahKhutbahLanguage: dto.jummahKhutbahLanguage ?? '',
  }
}

/** Per-mosque Iqamah timing rules — separate from `PrayerCalculationForm`
 * (a different backend resource, `IqamahScheduleDto` vs `PrayerConfigDto`,
 * with its own GET/PUT pair), so this is its own Card/form with its own
 * save action rather than one giant combined form. */
export function IqamahScheduleForm({ mosqueId }: IqamahScheduleFormProps) {
  const { data: schedule, isLoading } = useIqamahSchedule(mosqueId)
  const updateSchedule = useUpdateIqamahSchedule(mosqueId)

  const {
    register,
    watch,
    handleSubmit,
    formState: { isDirty },
  } = useForm<IqamahScheduleFormValues>({
    resolver: zodResolver(iqamahScheduleFormSchema),
    values: schedule ? dtoToFormValues(schedule) : emptyDefaults,
  })

  function onSubmit(values: IqamahScheduleFormValues) {
    const body: IqamahScheduleUpdateDto = {
      fajrType: values.fajr.type,
      fajrOffsetMinutes: values.fajr.type === 'OFFSET_AFTER_ADHAN' && values.fajr.offsetMinutes?.trim() ? Number(values.fajr.offsetMinutes) : undefined,
      fajrFixedTime: values.fajr.type === 'FIXED_TIME' && values.fajr.fixedTime?.trim() ? values.fajr.fixedTime : undefined,
      fajrAdhanTime: values.fajr.adhanTime?.trim() || undefined,

      dhuhrType: values.dhuhr.type,
      dhuhrOffsetMinutes: values.dhuhr.type === 'OFFSET_AFTER_ADHAN' && values.dhuhr.offsetMinutes?.trim() ? Number(values.dhuhr.offsetMinutes) : undefined,
      dhuhrFixedTime: values.dhuhr.type === 'FIXED_TIME' && values.dhuhr.fixedTime?.trim() ? values.dhuhr.fixedTime : undefined,
      dhuhrAdhanTime: values.dhuhr.adhanTime?.trim() || undefined,

      asrType: values.asr.type,
      asrOffsetMinutes: values.asr.type === 'OFFSET_AFTER_ADHAN' && values.asr.offsetMinutes?.trim() ? Number(values.asr.offsetMinutes) : undefined,
      asrFixedTime: values.asr.type === 'FIXED_TIME' && values.asr.fixedTime?.trim() ? values.asr.fixedTime : undefined,
      asrAdhanTime: values.asr.adhanTime?.trim() || undefined,

      maghribType: values.maghrib.type,
      maghribOffsetMinutes: values.maghrib.type === 'OFFSET_AFTER_ADHAN' && values.maghrib.offsetMinutes?.trim() ? Number(values.maghrib.offsetMinutes) : undefined,
      maghribFixedTime: values.maghrib.type === 'FIXED_TIME' && values.maghrib.fixedTime?.trim() ? values.maghrib.fixedTime : undefined,
      maghribAdhanTime: values.maghrib.adhanTime?.trim() || undefined,

      ishaType: values.isha.type,
      ishaOffsetMinutes: values.isha.type === 'OFFSET_AFTER_ADHAN' && values.isha.offsetMinutes?.trim() ? Number(values.isha.offsetMinutes) : undefined,
      ishaFixedTime: values.isha.type === 'FIXED_TIME' && values.isha.fixedTime?.trim() ? values.isha.fixedTime : undefined,
      ishaAdhanTime: values.isha.adhanTime?.trim() || undefined,

      jummah1Time: values.jummah1Time?.trim() || undefined,
      jummah2Time: values.jummah2Time?.trim() || undefined,
      jummahKhutbahLanguage: values.jummahKhutbahLanguage?.trim() || undefined,
    }

    updateSchedule.mutate(body)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Iqamah Schedule</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iqamah Schedule</CardTitle>
        <CardDescription>
          When the congregation prayer actually starts, per prayer — either a fixed number of minutes after Adhan, or
          a fixed clock time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-4">
            <IqamahPrayerRow prayerKey="fajr" label={IQAMAH_PRAYER_LABELS.fajr} register={register} watch={watch} />
            <IqamahPrayerRow prayerKey="dhuhr" label={IQAMAH_PRAYER_LABELS.dhuhr} register={register} watch={watch} />
            <IqamahPrayerRow prayerKey="asr" label={IQAMAH_PRAYER_LABELS.asr} register={register} watch={watch} />
            <IqamahPrayerRow prayerKey="maghrib" label={IQAMAH_PRAYER_LABELS.maghrib} register={register} watch={watch} />
            <IqamahPrayerRow prayerKey="isha" label={IQAMAH_PRAYER_LABELS.isha} register={register} watch={watch} />
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <Label className="text-sm font-semibold text-foreground">Friday Jummah (optional)</Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="jummah1">1st Jummah time</Label>
                <Input id="jummah1" type="time" {...register('jummah1Time')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="jummah2">2nd Jummah time</Label>
                <Input id="jummah2" type="time" {...register('jummah2Time')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="jummah-lang">Khutbah language</Label>
                <Input id="jummah-lang" placeholder="e.g. English" {...register('jummahKhutbahLanguage')} />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-fit" disabled={updateSchedule.isPending || !isDirty}>
            {updateSchedule.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            Save iqamah schedule
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
