import { useState, useEffect, useMemo } from 'react'
import { Calendar, CalendarDays, CalendarRange, Download, FileSpreadsheet, Loader2, Printer, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AnnualScheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mosqueName: string
  latitude?: number
  longitude?: number
  calculationMethod?: string
  calculationMethodName?: string
}

interface AladhanDayTiming {
  date: {
    readable: string
    timestamp: string
    gregorian: {
      date: string
      day: string
      weekday: { en: string }
      month: { number: number; en: string }
      year: string
    }
    hijri: {
      date: string
      day: string
      weekday: { en: string; ar: string }
      month: { number: number; en: string; ar: string }
      year: string
      designation: { abbreviated: string }
    }
  }
  timings: {
    Fajr: string
    Sunrise: string
    Dhuhr: string
    Asr: string
    Sunset: string
    Maghrib: string
    Isha: string
    Imsak: string
    Midnight: string
  }
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const METHOD_TO_ALADHAN_ID: Record<string, number> = {
  KARACHI: 1,
  ISNA: 2,
  MUSLIM_WORLD_LEAGUE: 3,
  UMM_AL_QURA: 4,
  EGYPTIAN: 5,
  TEHRAN: 7,
  GULF: 8,
  KUWAIT: 9,
  QATAR: 10,
  SINGAPORE: 11,
  FRANCE: 12,
  TURKEY: 13,
  RUSSIA: 14,
}

function format12h(timeStr?: string): string {
  if (!timeStr) return '—'
  const clean = timeStr.split(' ')[0] ?? ''
  const parts = clean.split(':')
  if (parts.length < 2) return clean
  const h = parseInt(parts[0] ?? '0', 10)
  const m = parts[1] ?? '00'
  if (isNaN(h)) return clean
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m} ${ampm}`
}

function computeHanafiAsr(shafiAsrStr?: string): string {
  if (!shafiAsrStr) return '—'
  const clean = shafiAsrStr.split(' ')[0] ?? ''
  const parts = clean.split(':')
  if (parts.length < 2) return clean
  const h = parseInt(parts[0] ?? '0', 10)
  const m = parseInt(parts[1] ?? '0', 10)
  if (isNaN(h) || isNaN(m)) return clean
  const totalMins = (h * 60 + m + 55) % 1440
  const hNew = Math.floor(totalMins / 60)
  const mNew = totalMins % 60
  const ampm = hNew >= 12 ? 'PM' : 'AM'
  const h12 = hNew % 12 === 0 ? 12 : hNew % 12
  const paddedM = mNew < 10 ? `0${mNew}` : `${mNew}`
  return `${h12}:${paddedM} ${ampm}`
}

export function AnnualScheduleModal({
  open,
  onOpenChange,
  mosqueName,
  latitude,
  longitude,
  calculationMethod,
}: AnnualScheduleModalProps) {
  const currentDate = useMemo(() => new Date(), [])
  const [selectedYear] = useState<number>(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1)
  const [monthData, setMonthData] = useState<AladhanDayTiming[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // CSV Scope Picker Modal State
  const [csvPickerOpen, setCsvPickerOpen] = useState(false)
  const [isExportingFullYear, setIsExportingFullYear] = useState(false)
  const [customSelectedMonth, setCustomSelectedMonth] = useState<number>(currentDate.getMonth() + 1)
  const [customSelectedYear, setCustomSelectedYear] = useState<number>(currentDate.getFullYear())
  const [isExportingCustom, setIsExportingCustom] = useState(false)

  const methodId = (calculationMethod && METHOD_TO_ALADHAN_ID[calculationMethod]) || 2

  useEffect(() => {
    if (!open) return

    const lat = latitude ?? 21.4225
    const lng = longitude ?? 39.8262

    let isMounted = true
    setIsLoading(true)
    setError(null)

    const url = `https://api.aladhan.com/v1/calendar/${selectedYear}/${selectedMonth}?latitude=${lat}&longitude=${lng}&method=${methodId}`

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load prayer calendar')
        return res.json()
      })
      .then((json) => {
        if (isMounted) {
          if (json.data && Array.isArray(json.data)) {
            setMonthData(json.data)
          } else {
            setMonthData([])
          }
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error fetching prayer schedule')
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [open, selectedYear, selectedMonth, latitude, longitude, methodId])

  function handlePrint() {
    window.print()
  }

  async function handleExportSpecificMonthCSV(targetMonth: number, targetYear: number) {
    setIsExportingCustom(true)
    try {
      let days: AladhanDayTiming[] = []
      if (targetMonth === selectedMonth && targetYear === selectedYear && monthData.length > 0) {
        days = monthData
      } else {
        const lat = latitude ?? 21.4225
        const lng = longitude ?? 39.8262
        const url = `https://api.aladhan.com/v1/calendar/${targetYear}/${targetMonth}?latitude=${lat}&longitude=${lng}&method=${methodId}`
        const res = await fetch(url)
        const json = await res.json()
        if (Array.isArray(json.data)) {
          days = json.data as AladhanDayTiming[]
        }
      }
      if (days.length === 0) return

      const header = 'DATE,DAY,FAJR,DHUHR,ASR (SHAFI\'I),ASR (HANAFI),MAGHRIB,ISHA\n'
      const rows = days
        .map((d) => {
          const dateStr = `${d.date.gregorian.day}-${MONTH_SHORT[targetMonth - 1]}-${targetYear}`
          const dayName = d.date.gregorian.weekday.en.slice(0, 3).toUpperCase()
          const fajr = format12h(d.timings.Fajr)
          const dhuhr = format12h(d.timings.Dhuhr)
          const asrShafi = format12h(d.timings.Asr)
          const asrHanafi = computeHanafiAsr(d.timings.Asr)
          const maghrib = format12h(d.timings.Maghrib)
          const isha = format12h(d.timings.Isha)
          return `"${dateStr}","${dayName}","${fajr}","${dhuhr}","${asrShafi}","${asrHanafi}","${maghrib}","${isha}"`
        })
        .join('\n')

      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute(
        'download',
        `${mosqueName.replace(/\s+/g, '_')}_Prayer_Schedule_${MONTH_SHORT[targetMonth - 1]}_${targetYear}.csv`,
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setCsvPickerOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsExportingCustom(false)
    }
  }

  function handleExportMonthCSV() {
    void handleExportSpecificMonthCSV(selectedMonth, selectedYear)
  }

  async function handleExportFullYearCSV() {
    setIsExportingFullYear(true)
    try {
      const lat = latitude ?? 21.4225
      const lng = longitude ?? 39.8262

      const fetchPromises = Array.from({ length: 12 }, (_, idx) => {
        const m = idx + 1
        const url = `https://api.aladhan.com/v1/calendar/${selectedYear}/${m}?latitude=${lat}&longitude=${lng}&method=${methodId}`
        return fetch(url)
          .then((r) => r.json())
          .then((j) => (Array.isArray(j.data) ? (j.data as AladhanDayTiming[]) : []))
          .catch(() => [] as AladhanDayTiming[])
      })

      const allMonths = await Promise.all(fetchPromises)
      const header = 'DATE,MONTH,YEAR,DAY,FAJR,DHUHR,ASR (SHAFI\'I),ASR (HANAFI),MAGHRIB,ISHA\n'
      const rows = allMonths
        .flatMap((days, mIdx) => {
          const mName = MONTH_SHORT[mIdx]
          return days.map((d) => {
            const dateStr = `${d.date.gregorian.day}-${mName}-${selectedYear}`
            const dayName = d.date.gregorian.weekday.en.slice(0, 3).toUpperCase()
            const fajr = format12h(d.timings.Fajr)
            const dhuhr = format12h(d.timings.Dhuhr)
            const asrShafi = format12h(d.timings.Asr)
            const asrHanafi = computeHanafiAsr(d.timings.Asr)
            const maghrib = format12h(d.timings.Maghrib)
            const isha = format12h(d.timings.Isha)
            return `"${dateStr}","${mName}","${selectedYear}","${dayName}","${fajr}","${dhuhr}","${asrShafi}","${asrHanafi}","${maghrib}","${isha}"`
          })
        })
        .join('\n')

      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute(
        'download',
        `${mosqueName.replace(/\s+/g, '_')}_Full_Year_Prayer_Schedule_${selectedYear}.csv`,
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setCsvPickerOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsExportingFullYear(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* [&>button:last-child]:hidden removes Radix's default duplicate X button */}
        <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-3xl border-0 shadow-2xl [&>button:last-child]:hidden bg-[#f8fafc] dark:bg-card">
          {/* =========================================================================
              HEADER: DEEP TEAL BANNER MATCHING IMAGE 2 (SINGLE X ICON)
              ========================================================================= */}
          <div className="bg-[#007378] text-white p-5 sm:p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 sm:size-12 items-center justify-center rounded-2xl bg-white/15 border border-white/20 text-white shrink-0 shadow-xs">
                <CalendarDays className="size-6 text-white" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                  Annual Prayer Timetable · {selectedYear}
                </h2>
                <p className="text-xs sm:text-sm text-white/85 mt-0.5 font-medium line-clamp-1">
                  {mosqueName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 px-3 sm:px-3.5 py-1.5 text-xs font-semibold backdrop-blur-xs transition-all cursor-pointer"
              >
                <Printer className="size-3.5" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={() => setCsvPickerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 px-3 sm:px-3.5 py-1.5 text-xs font-semibold backdrop-blur-xs transition-all cursor-pointer"
              >
                <Download className="size-3.5" />
                <span>CSV</span>
              </button>

              {/* Sole Close Button */}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex size-8 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all ml-1 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* =========================================================================
              MONTH SELECTOR BAR MATCHING IMAGE 2 WITH THEME COLORS
              ========================================================================= */}
          <div className="bg-teal-50/40 dark:bg-teal-950/20 px-4 sm:px-6 py-3 border-b border-teal-200/60 dark:border-teal-900/50 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 sm:gap-2 min-w-max mx-auto sm:mx-0">
              {MONTH_SHORT.map((shortName, idx) => {
                const monthNum = idx + 1
                const isSelected = selectedMonth === monthNum
                return (
                  <button
                    key={shortName}
                    type="button"
                    onClick={() => setSelectedMonth(monthNum)}
                    className={cn(
                      'px-3 py-1 text-xs sm:text-sm font-semibold rounded-full transition-all cursor-pointer',
                      isSelected
                        ? 'bg-[#007378] text-white shadow-xs'
                        : 'text-muted-foreground hover:text-[#007378] hover:bg-teal-100/60 dark:hover:bg-teal-900/40',
                    )}
                  >
                    {shortName}
                  </button>
                )
              })}
            </div>
          </div>

          {/* =========================================================================
              SUBHEADER INFO LINE WITH THEME HIGHLIGHT
              ========================================================================= */}
          <div className="px-5 sm:px-6 py-2.5 bg-[#007378]/[0.05] border-b border-[#007378]/20 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#007378] dark:text-teal-400 text-sm">
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </span>
              <span className="rounded-full bg-[#007378]/15 text-[#007378] dark:text-teal-300 font-bold px-2 py-0.5 text-[11px]">
                All {monthData.length} days
              </span>
            </div>
            <span className="text-muted-foreground text-[11px] sm:text-xs">
              All times displayed in local mosque timezone · Adhan
            </span>
          </div>

          {/* =========================================================================
              TABLE BODY WITH 100% STICKY THEME HEADER ROW (IMAGE 1)
              ========================================================================= */}
          <div className="flex-1 overflow-auto max-h-[60vh] sm:max-h-[64vh] px-4 sm:px-6 py-2 scroll-smooth">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Loading prayer times for {MONTH_NAMES[selectedMonth - 1]}...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                <p className="text-sm font-medium text-destructive">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMonth((m) => m)}
                  className="mt-2 text-xs"
                >
                  Try again
                </Button>
              </div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                {/* 100% Sticky Column Header Row (Image 1) */}
                <thead className="sticky top-0 z-20 shadow-xs">
                  <tr className="border-b border-[#007378]/25">
                    <th className="sticky top-0 z-20 py-3 px-4 bg-[#f8fafc] dark:bg-card text-left font-extrabold uppercase tracking-widest text-[#007378] dark:text-teal-400 text-xs whitespace-nowrap">
                      DATE
                    </th>
                    <th className="sticky top-0 z-20 py-3 px-4 bg-[#f8fafc] dark:bg-card text-center font-extrabold uppercase tracking-widest text-[#007378] dark:text-teal-400 text-xs whitespace-nowrap">
                      FAJR
                    </th>
                    <th className="sticky top-0 z-20 py-3 px-4 bg-[#f8fafc] dark:bg-card text-center font-extrabold uppercase tracking-widest text-[#007378] dark:text-teal-400 text-xs whitespace-nowrap">
                      DHUHR
                    </th>
                    <th className="sticky top-0 z-20 py-3 px-3 sm:px-4 bg-[#f8fafc] dark:bg-card text-center font-extrabold uppercase tracking-widest text-[#007378] dark:text-teal-400 text-xs whitespace-nowrap">
                      ASR (S / H)
                    </th>
                    <th className="sticky top-0 z-20 py-3 px-4 bg-[#f8fafc] dark:bg-card text-center font-extrabold uppercase tracking-widest text-[#007378] dark:text-teal-400 text-xs whitespace-nowrap">
                      MAGHRIB
                    </th>
                    <th className="sticky top-0 z-20 py-3 px-4 bg-[#f8fafc] dark:bg-card text-center font-extrabold uppercase tracking-widest text-[#007378] dark:text-teal-400 text-xs whitespace-nowrap">
                      ISHA
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-100/60 dark:divide-teal-900/40">
                  {monthData.map((day, idx) => {
                    const isToday =
                      currentDate.getDate() === parseInt(day.date.gregorian.day, 10) &&
                      currentDate.getMonth() + 1 === selectedMonth &&
                      currentDate.getFullYear() === selectedYear

                    const isFriday = day.date.gregorian.weekday.en.toLowerCase() === 'friday'
                    const weekdayShort = day.date.gregorian.weekday.en.slice(0, 3).toUpperCase()

                    return (
                      <tr
                        key={day.date.gregorian.date}
                        className={cn(
                          'transition-colors',
                          idx % 2 === 1 ? 'bg-[#007378]/[0.02]' : 'bg-transparent',
                          'hover:bg-[#007378]/[0.06]',
                          isToday && 'bg-[#007378]/[0.10] font-semibold',
                        )}
                      >
                        {/* DATE Column: Day number + Weekday (FRI in amber badge) */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground w-6 text-sm">
                              {day.date.gregorian.day}
                            </span>
                            {isFriday ? (
                              <span className="rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold px-1.5 py-0.5 text-[10px] tracking-wide">
                                FRI
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs font-semibold">
                                {weekdayShort}
                              </span>
                            )}
                            {isToday && (
                              <span className="rounded-full bg-[#007378] px-1.5 py-0.2 text-[9px] font-bold text-white ml-1">
                                Today
                              </span>
                            )}
                          </div>
                        </td>

                        {/* FAJR */}
                        <td className="py-3 px-4 text-center font-mono text-xs sm:text-sm font-semibold text-[#334155] dark:text-slate-200">
                          {format12h(day.timings.Fajr)}
                        </td>

                        {/* DHUHR */}
                        <td className="py-3 px-4 text-center font-mono text-xs sm:text-sm font-semibold text-[#334155] dark:text-slate-200">
                          {format12h(day.timings.Dhuhr)}
                        </td>

                        {/* ASR: Showing both Shafi'i and Hanafi times */}
                        <td className="py-2.5 px-3 sm:px-4 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center justify-center font-mono text-xs gap-0.5">
                            <div className="flex items-center gap-1 justify-center">
                              <span className="font-semibold text-foreground text-xs sm:text-sm">
                                {format12h(day.timings.Asr)}
                              </span>
                              <span className="text-[9px] font-bold text-[#007378] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-1 rounded border border-[#007378]/20" title="Shafi'i">
                                S
                              </span>
                            </div>
                            <div className="flex items-center gap-1 justify-center">
                              <span className="font-medium text-muted-foreground text-[11px] sm:text-xs">
                                {computeHanafiAsr(day.timings.Asr)}
                              </span>
                              <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-1 rounded border border-amber-500/20" title="Hanafi">
                                H
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* MAGHRIB */}
                        <td className="py-3 px-4 text-center font-mono text-xs sm:text-sm font-semibold text-[#334155] dark:text-slate-200">
                          {format12h(day.timings.Maghrib)}
                        </td>

                        {/* ISHA */}
                        <td className="py-3 px-4 text-center font-mono text-xs sm:text-sm font-semibold text-[#334155] dark:text-slate-200">
                          {format12h(day.timings.Isha)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}

            {monthData.length > 0 && (
              <div className="py-3 text-center text-xs text-muted-foreground border-t border-teal-200/40 dark:border-teal-900/40 mt-1">
                Showing all {monthData.length} days of {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </div>
            )}
          </div>

          {/* =========================================================================
              FOOTER MATCHING IMAGE 2 WITH THEME HIGHLIGHTS
              ========================================================================= */}
          <div className="px-5 sm:px-6 py-3 border-t border-teal-200/60 dark:border-teal-900/50 bg-teal-50/30 dark:bg-teal-950/20 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              {monthData.length > 0 && `${monthData.length} days loaded for ${MONTH_SHORT[selectedMonth - 1]} ${selectedYear}`}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-5 text-xs font-semibold h-9 border-teal-300 dark:border-teal-800 hover:bg-teal-100/50 text-[#007378]"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          CSV EXPORT SCOPE MODAL (ASK MONTH OR FULL YEAR)
          ========================================================================= */}
      <Dialog open={csvPickerOpen} onOpenChange={setCsvPickerOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl border border-border/80 bg-card shadow-2xl">
          <DialogHeader className="gap-1.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
              <FileSpreadsheet className="size-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Download Prayer Schedule (CSV)
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Select which schedule range you want to export for {mosqueName}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 py-4">
            {/* Option 1: Current Month */}
            <button
              type="button"
              onClick={handleExportMonthCSV}
              className="flex items-center justify-between p-4 rounded-xl border border-teal-200/80 dark:border-teal-900/50 bg-teal-50/30 dark:bg-teal-950/20 hover:border-primary hover:bg-primary/[0.06] transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    Current Month
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {MONTH_NAMES[selectedMonth - 1]} {selectedYear} ({monthData.length} days)
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-primary">Download →</span>
            </button>

            {/* Option 2: Custom Month Selection */}
            <div className="flex flex-col gap-2.5 p-4 rounded-xl border border-teal-200/80 dark:border-teal-900/50 bg-teal-50/30 dark:bg-teal-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <CalendarRange className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Custom Month Selection
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Pick any month & year to export
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isExportingCustom}
                  onClick={() => void handleExportSpecificMonthCSV(customSelectedMonth, customSelectedYear)}
                  className="h-8 px-3 text-xs font-semibold rounded-lg border-primary/40 text-primary hover:bg-primary hover:text-white transition-all shrink-0"
                >
                  {isExportingCustom ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    'Download →'
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <select
                  value={customSelectedMonth}
                  onChange={(e) => setCustomSelectedMonth(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-border/80 bg-card px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={name} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </select>

                <select
                  value={customSelectedYear}
                  onChange={(e) => setCustomSelectedYear(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-border/80 bg-card px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {[selectedYear - 1, selectedYear, selectedYear + 1].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Option 3: Full Year (All 12 Months) */}
            <button
              type="button"
              onClick={() => void handleExportFullYearCSV()}
              disabled={isExportingFullYear}
              className="flex items-center justify-between p-4 rounded-xl border border-teal-200/80 dark:border-teal-900/50 bg-teal-50/30 dark:bg-teal-950/20 hover:border-primary hover:bg-primary/[0.06] transition-all text-left cursor-pointer group disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  {isExportingFullYear ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <CalendarDays className="size-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    Full Year ({selectedYear})
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Complete 12-month annual schedule (~365 days)
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-primary">
                {isExportingFullYear ? 'Exporting…' : 'Download →'}
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
