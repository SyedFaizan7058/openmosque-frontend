import { useState, useEffect, useRef } from 'react'
import { CalendarDays, Clock, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { usePrayerTimes } from '@/features/prayer/hooks/usePrayerTimes'
import { usePrayerCountdown } from '@/features/prayer/hooks/usePrayerCountdown'
import { AnnualScheduleModal } from '@/features/prayer/components/AnnualScheduleModal'
import { cn } from '@/lib/utils'

interface PrayerTimesWidgetProps {
  idOrSlug: string
  /** `YYYY-MM-DD`; omit for "today". */
  date?: string
  mosqueName?: string
  latitude?: number
  longitude?: number
  className?: string
}

function to12hClean(timeStr?: string | null): string {
  if (!timeStr) return '--:--'
  const trimmed = timeStr.trim().replace(/\s*[ap]m/i, '')
  const parts = trimmed.split(':')
  if (parts.length < 2) return trimmed
  const h = parseInt(parts[0] ?? '0', 10)
  const m = parts[1]?.slice(0, 2) ?? '00'
  if (isNaN(h)) return trimmed
  const h12 = h % 12 === 0 ? 12 : h % 12
  const paddedH = h12 < 10 ? `0${h12}` : `${h12}`
  return `${paddedH}:${m}`
}

function timeToMins(timeStr?: string | null): number {
  if (!timeStr) return 0
  const clean = timeStr.trim().replace(/\s*[ap]m/i, '')
  const parts = clean.split(':')
  const h = parseInt(parts[0] ?? '0', 10)
  const m = parseInt(parts[1] ?? '0', 10)
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m)
}

function minsTo12h(totalMins: number): string {
  const norm = ((Math.round(totalMins) % 1440) + 1440) % 1440
  const h = Math.floor(norm / 60)
  const m = norm % 60
  const h12 = h % 12 === 0 ? 12 : h % 12
  const paddedH = h12 < 10 ? `0${h12}` : `${h12}`
  const paddedM = m < 10 ? `0${m}` : `${m}`
  return `${paddedH}:${paddedM}`
}

function getAsrTimesClean(
  timing?: { adhanTime: string; asrShafiTime?: string | null; asrHanafiTime?: string | null },
  juristicSchool?: string,
  topLevelShafi?: string | null,
  topLevelHanafi?: string | null,
): { shafi: string; hanafi: string } {
  const shafiFromData = timing?.asrShafiTime ?? topLevelShafi
  const hanafiFromData = timing?.asrHanafiTime ?? topLevelHanafi

  if (shafiFromData && hanafiFromData) {
    return {
      shafi: to12hClean(shafiFromData),
      hanafi: to12hClean(hanafiFromData),
    }
  }

  if (!timing?.adhanTime) return { shafi: '--:--', hanafi: '--:--' }

  const baseTime = timing.adhanTime
  const parts = baseTime.split(':')
  const baseH = parseInt(parts[0] ?? '15', 10)
  const baseM = parseInt(parts[1] ?? '30', 10)

  if (juristicSchool === 'HANAFI') {
    const shafiTotalMins = Math.max(0, baseH * 60 + baseM - 55)
    return {
      shafi: minsTo12h(shafiTotalMins),
      hanafi: to12hClean(baseTime),
    }
  } else {
    const hanafiTotalMins = baseH * 60 + baseM + 55
    return {
      shafi: to12hClean(baseTime),
      hanafi: minsTo12h(hanafiTotalMins),
    }
  }
}

function computeScheduleCards(data: {
  timings?: { prayerName: string; adhanTime: string; iqamahTime?: string | null; asrShafiTime?: string | null; asrHanafiTime?: string | null }[] | null
  currentPrayer?: string | null
  nextPrayer: string
  timeZone?: string
  juristicSchool?: string
  jummahSchedule?: { firstJummahTime?: string | null; secondJummahTime?: string | null; khutbahLanguage?: string | null } | null
  asrShafiTime?: string | null
  asrHanafiTime?: string | null
  ishraaqTime?: string | null
  chaashtTime?: string | null
  zawaalTime?: string | null
  sunsetTime?: string | null
  iftaarTime?: string | null
  tahajjudTime?: string | null
  sahoorEndTime?: string | null
}) {
  const timingsMap: Record<string, { adhanTime: string; iqamahTime?: string | null; asrShafiTime?: string | null; asrHanafiTime?: string | null }> = {}
  for (const t of data.timings ?? []) {
    timingsMap[t.prayerName] = t
  }

  const fajrAdhan = timingsMap['FAJR']?.adhanTime ?? ''
  const sunriseAdhan = timingsMap['SUNRISE']?.adhanTime ?? ''
  const dhuhrAdhan = timingsMap['DHUHR']?.adhanTime ?? ''
  const asrAdhan = timingsMap['ASR']?.adhanTime ?? ''
  const maghribAdhan = timingsMap['MAGHRIB']?.adhanTime ?? ''
  const ishaAdhan = timingsMap['ISHA']?.adhanTime ?? ''

  const asrTimes = getAsrTimesClean(timingsMap['ASR'], data.juristicSchool, data.asrShafiTime, data.asrHanafiTime)

  // Calculations: prefer backend values, with robust local formula fallbacks
  const sunriseMins = timeToMins(sunriseAdhan)
  const dhuhrMins = timeToMins(dhuhrAdhan)
  const fajrMins = timeToMins(fajrAdhan)
  const maghribMins = timeToMins(maghribAdhan)

  const ishraaq = data.ishraaqTime ? to12hClean(data.ishraaqTime) : (sunriseMins ? minsTo12h(sunriseMins + 20) : '--:--')
  const zawaalMins = dhuhrMins ? Math.max(0, dhuhrMins - 5) : 0
  const zawaal = data.zawaalTime ? to12hClean(data.zawaalTime) : (dhuhrMins ? minsTo12h(zawaalMins) : '--:--')
  const chaasht = data.chaashtTime ? to12hClean(data.chaashtTime) : ((sunriseMins && zawaalMins) ? minsTo12h(sunriseMins + Math.round((zawaalMins - sunriseMins) / 2)) : '--:--')
  const sunset = data.sunsetTime ? to12hClean(data.sunsetTime) : (maghribMins ? minsTo12h(Math.max(0, maghribMins - 3)) : '--:--')
  const iftaar = data.iftaarTime ? to12hClean(data.iftaarTime) : to12hClean(maghribAdhan)
  const sahoorEnd = data.sahoorEndTime ? to12hClean(data.sahoorEndTime) : (fajrMins ? minsTo12h(Math.max(0, fajrMins - 10)) : '--:--')
  const tahajjud = data.tahajjudTime ? to12hClean(data.tahajjudTime) : (fajrMins ? minsTo12h(Math.max(0, fajrMins - 105)) : '--:--')

  // Real-time running prayer calculation based on local/mosque time vs prayer start times
  let current = ''
  try {
    let nowMins = 0
    const effectiveTimeZone =
      data.timeZone && !['UTC', 'ETC/UTC'].includes(data.timeZone.toUpperCase())
        ? data.timeZone
        : Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: effectiveTimeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date()).split(':')
      const h = parseInt(parts[0] ?? '0', 10)
      const m = parseInt(parts[1] ?? '0', 10)
      nowMins = (h % 24) * 60 + m
    } catch {
      const d = new Date()
      nowMins = d.getHours() * 60 + d.getMinutes()
    }

    // Normalized 24-hour minutes (0 to 1439)
    let dhuhrNorm = dhuhrMins
    if (dhuhrNorm && dhuhrNorm < 660) dhuhrNorm += 720 // Afternoon Dhuhr (>= 11:00 AM)

    // For Asr, prioritize raw 24-hour adhanTime or Hanafi time
    let asrNorm = timeToMins(timingsMap['ASR']?.adhanTime || data.asrHanafiTime || timingsMap['ASR']?.asrHanafiTime)
    if (asrNorm && asrNorm < 720) asrNorm += 720 // Afternoon Asr (>= 12:00 PM)

    let maghribNorm = maghribMins
    if (maghribNorm && maghribNorm < 720) maghribNorm += 720

    let ishaNorm = timeToMins(ishaAdhan)
    if (ishaNorm && ishaNorm < 720) ishaNorm += 720

    const chaashtNorm = data.chaashtTime
      ? timeToMins(data.chaashtTime)
      : (sunriseMins && zawaalMins ? sunriseMins + Math.round((zawaalMins - sunriseMins) / 2) : (sunriseMins ? sunriseMins + 180 : (fajrMins ? fajrMins + 240 : 540)))

    // Determine active running prayer
    if (maghribNorm && ishaNorm && nowMins >= maghribNorm && nowMins < ishaNorm) {
      current = 'MAGHRIB'
    } else if (ishaNorm && (nowMins >= ishaNorm || (fajrMins && nowMins < fajrMins))) {
      current = 'ISHA'
    } else if (asrNorm && maghribNorm && nowMins >= asrNorm && nowMins < maghribNorm) {
      current = 'ASR'
    } else if (dhuhrNorm && asrNorm && nowMins >= dhuhrNorm && nowMins < asrNorm) {
      current = 'DHUHR'
    } else if (fajrMins && chaashtNorm && nowMins >= fajrMins && nowMins < chaashtNorm) {
      // Fajr highlighted from Fajr start time until Chaasht
      current = 'FAJR'
    } else if (chaashtNorm && dhuhrNorm && nowMins >= chaashtNorm && nowMins < dhuhrNorm) {
      // Intentional resting gap between Chaasht/Zawaal and Zohar: NO card highlighted
      current = ''
    }
  } catch {
    // fallback
  }

  const next = (data.nextPrayer ?? '').toUpperCase()

  return [
    {
      id: 'fajr',
      name: 'Fajr',
      actionLabel: 'Start',
      time: to12hClean(fajrAdhan),
      isRunning: current === 'FAJR',
      isNext: next === 'FAJR',
      rows: [
        { label: 'Jamaat', value: '--:--' },
        { label: 'Qaza/Sunrise', value: to12hClean(sunriseAdhan) },
        { label: 'Ishraaq', value: ishraaq },
        { label: 'Chaasht', value: chaasht },
      ],
    },
    {
      id: 'zohar',
      name: 'Zohar',
      actionLabel: 'Start',
      time: to12hClean(dhuhrAdhan),
      isRunning: current === 'DHUHR',
      isNext: next === 'DHUHR',
      rows: [
        { label: 'Jamaat', value: '--:--' },
        { label: 'Zawaal', value: zawaal },
        { label: 'Qaza (Hanafi)', value: asrTimes.hanafi },
        { label: 'Qaza (Shafai)', value: asrTimes.shafi },
      ],
    },
    {
      id: 'asr',
      name: 'Asr',
      actionLabel: 'Start',
      // Priority given to Hanafi standard time
      time: asrTimes.hanafi !== '--:--' ? asrTimes.hanafi : to12hClean(asrAdhan),
      isRunning: current === 'ASR',
      isNext: next === 'ASR',
      rows: [
        { label: 'Jamaat', value: '--:--' },
        { label: 'Start (Hanafi)', value: asrTimes.hanafi },
        { label: 'Start (Shafai)', value: asrTimes.shafi },
        { label: 'Qaza', value: sunset },
      ],
    },
    {
      id: 'maghrib',
      name: 'Maghrib',
      actionLabel: 'Start',
      time: to12hClean(maghribAdhan),
      isRunning: current === 'MAGHRIB',
      isNext: next === 'MAGHRIB',
      rows: [
        { label: 'Jamaat', value: to12hClean(maghribAdhan) },
        { label: 'Sunset', value: sunset },
        { label: 'Iftaar', value: iftaar },
        { label: 'Qaza', value: to12hClean(ishaAdhan) },
      ],
    },
    {
      id: 'isha',
      name: 'Isha',
      actionLabel: 'Start',
      time: to12hClean(ishaAdhan),
      isRunning: current === 'ISHA',
      isNext: next === 'ISHA',
      rows: [
        { label: 'Jamaat', value: '--:--' },
        { label: 'Qaza', value: to12hClean(fajrAdhan) },
        { label: 'Tahajjud', value: tahajjud },
        { label: 'Sahoor End', value: sahoorEnd },
      ],
    },
    {
      id: 'juma',
      name: 'Juma',
      actionLabel: 'Khutba',
      // All times left blank for Jummah prayer
      time: '--:--',
      isRunning: false,
      isNext: false,
      rows: [
        { label: 'Khutba 1', value: '--:--' },
        { label: 'Khutba 2', value: '--:--' },
        { label: 'Khutba 3', value: '--:--' },
        { label: 'Khutba 4', value: '--:--' },
      ],
    },
  ]
}

/** The main prayer-times card for a mosque's detail page: tabular prayer
 * times (Prayer, Start, Iqamah), full year schedule modal trigger, countdown,
 * and Friday Jummah schedule. */
export function PrayerTimesWidget({
  idOrSlug,
  date,
  mosqueName,
  latitude,
  longitude,
  className,
}: PrayerTimesWidgetProps) {
  const { data, isLoading, isError, error, refetch } = usePrayerTimes(idOrSlug, date)
  const { isZero } = usePrayerCountdown(data?.timeRemainingMinutes)
  const [annualOpen, setAnnualOpen] = useState(false)

  const hasRefetchedAtZero = useRef(false)
  useEffect(() => {
    if (isZero && !hasRefetchedAtZero.current) {
      hasRefetchedAtZero.current = true
      void refetch()
    }
    if (!isZero) {
      hasRefetchedAtZero.current = false
    }
  }, [isZero, refetch])

  if (isLoading) {
    return (
      <Card className={cn('rounded-2xl border border-border/80 shadow-xs', className)}>
        <CardHeader className="pb-3">
          <CardTitle>Prayer Times</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={Clock}
        title="Couldn't load prayer times"
        description={error?.message ?? 'Something went wrong reaching the server. Please try again shortly.'}
        className={className}
      />
    )
  }

  if (!data) return null

  const resolvedMosqueName = mosqueName ?? data.mosqueName ?? 'Mosque'
  const scheduleCards = computeScheduleCards(data)

  return (
    <>
      <Card className={cn('overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs', className)}>
        {/* Header: Side-by-side on all screens */}
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
              <Clock className="size-4 sm:size-5 text-primary shrink-0" aria-hidden="true" />
              <span>Prayer Times</span>
            </CardTitle>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5 truncate">{data.hijriDate}</p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAnnualOpen(true)}
            className="h-8 sm:h-9 shrink-0 gap-1 sm:gap-1.5 border-teal-200/80 dark:border-teal-900/60 text-primary hover:bg-teal-50/50 hover:border-primary/50 text-[11px] sm:text-xs font-semibold rounded-xl px-2.5 sm:px-3.5 transition-all"
          >
            <CalendarDays className="size-3.5 sm:size-4 text-primary shrink-0" aria-hidden="true" />
            <span>Full Year Schedule</span>
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 pt-1">
          {/* 6-Card Prayer Schedule Grid: 2 per row on mobile, 3 per row on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3.5 w-full">
            {scheduleCards.map((card) => (
              <div
                key={card.id}
                className={cn(
                  'relative overflow-hidden rounded-2xl p-3.5 sm:p-4 md:p-5 transition-all duration-200 border',
                  card.isRunning
                    ? 'bg-gradient-to-br from-[#003438] via-[#004a4e] to-[#003438] text-white border-2 border-teal-400 shadow-md ring-1 ring-teal-400/30'
                    : 'bg-card border-teal-200/80 dark:border-teal-900/60 shadow-2xs hover:border-teal-400/40',
                )}
              >
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-1.5 pb-1">
                  <div className="min-w-0">
                    <h3
                      className={cn(
                        'text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate',
                        card.isRunning ? 'text-white' : 'text-foreground',
                      )}
                    >
                      {card.name}
                    </h3>
                    <span
                      className={cn(
                        'text-[11px] sm:text-xs font-semibold underline underline-offset-4 decoration-1 inline-block mt-0.5',
                        card.isRunning ? 'text-teal-200 decoration-teal-300/60' : 'text-muted-foreground decoration-border',
                      )}
                    >
                      {card.actionLabel}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={cn(
                        'text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight font-mono tabular-nums leading-none',
                        card.isRunning ? 'text-white' : 'text-foreground',
                      )}
                    >
                      {card.time}
                    </div>
                  </div>
                </div>

                {/* Divider Line */}
                <div
                  className={cn(
                    'my-2 sm:my-2.5 border-t',
                    card.isRunning ? 'border-teal-400/30' : 'border-border/60',
                  )}
                />

                {/* 4 Metadata Sub-rows */}
                <div className="flex flex-col divide-y divide-border/30 dark:divide-border/20">
                  {card.rows.map((row, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center justify-between py-1 sm:py-1.5 text-[11px] sm:text-xs md:text-sm',
                        card.isRunning && 'border-teal-400/20',
                      )}
                    >
                      <span
                        className={cn(
                          'font-medium truncate mr-1',
                          card.isRunning ? 'text-teal-100/90' : 'text-muted-foreground',
                        )}
                      >
                        {row.label}
                      </span>
                      <span
                        className={cn(
                          'font-mono tabular-nums tracking-wide font-semibold shrink-0',
                          card.isRunning ? 'text-white font-bold' : 'text-foreground',
                          row.value === '--:--' && (card.isRunning ? 'text-teal-200/50 font-normal' : 'text-muted-foreground/60 font-normal'),
                        )}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Calculation Method Info */}
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground pt-1">
            <Info className="mt-0.5 size-3.5 shrink-0 text-primary/70" aria-hidden="true" />
            Calculated using {data.calculationMethodName} (showing both Shafi'i &amp; Hanafi Asr times), time
            zone {data.timeZone && !['UTC', 'ETC/UTC'].includes(data.timeZone.toUpperCase()) ? data.timeZone : (Intl.DateTimeFormat().resolvedOptions().timeZone || data.timeZone)}.
          </p>
        </CardContent>
      </Card>

      {/* Full Year Schedule Modal */}
      <AnnualScheduleModal
        open={annualOpen}
        onOpenChange={setAnnualOpen}
        mosqueName={resolvedMosqueName}
        latitude={latitude}
        longitude={longitude}
        calculationMethod={data.calculationMethod}
        calculationMethodName={data.calculationMethodName}
      />
    </>
  )
}

