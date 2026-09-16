import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Compass, Loader2, MapPin, Search, ShieldCheck } from 'lucide-react'
import { useLocationStore } from '@/stores/useLocationStore'

const POPULAR_CITIES = [
  'Udgir',
  'Hyderabad',
  'Mumbai',
  'Bengaluru',
  'Delhi',
  'London',
  'Dubai',
  'Istanbul',
  'Dallas',
  'Toronto',
]

export function LocationModal() {
  const isModalOpen = useLocationStore((s) => s.isModalOpen)
  const closeModal = useLocationStore((s) => s.closeModal)
  const isLocating = useLocationStore((s) => s.isLocating)
  const error = useLocationStore((s) => s.error)
  const accuracyLevel = useLocationStore((s) => s.accuracyLevel)
  const detectGps = useLocationStore((s) => s.detectGps)
  const setCityLocation = useLocationStore((s) => s.setCityLocation)

  const [cityInput, setCityInput] = useState('')

  const handleGpsClick = async () => {
    await detectGps()
  }

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cityInput.trim()) return
    await setCityLocation(cityInput.trim())
    setCityInput('')
  }

  const handleSelectQuickCity = async (cityName: string) => {
    await setCityLocation(cityName)
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card p-6 shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-500/10 text-primary mb-1">
            <MapPin className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Find Mosques Near You
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground max-w-sm">
            Allow OpenMosque to locate verified masjids, jamat timings, and walking distances close to your area.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive text-center">
            {error}
          </div>
        ) : null}

        {accuracyLevel === 'approximate' && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300 text-center">
            Network location detected from your internet provider. If your city is different, please search below.
          </div>
        )}

        <div className="flex flex-col gap-4 py-2">
          {/* Primary GPS Permission Primer Button */}
          <Button
            type="button"
            size="lg"
            disabled={isLocating}
            onClick={handleGpsClick}
            className="w-full gap-2.5 rounded-xl bg-primary text-primary-foreground font-semibold h-11 shadow-sm hover:bg-primary/90 transition-all"
          >
            {isLocating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Locating with GPS…</span>
              </>
            ) : (
              <>
                <Compass className="size-4.5" />
                <span>Use My Current Location</span>
              </>
            )}
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border/80" />
            <span className="absolute bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground">
              or enter city
            </span>
          </div>

          {/* Manual City Search Form */}
          <form onSubmit={handleCitySubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="e.g. Hyderabad, London, Dallas…"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="pl-9 text-sm rounded-xl"
                disabled={isLocating}
              />
            </div>
            <Button
              type="submit"
              disabled={!cityInput.trim() || isLocating}
              className="rounded-xl px-4 font-medium"
            >
              Set
            </Button>
          </form>

          {/* Quick Popular Cities */}
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-xs font-medium text-muted-foreground">
              Popular Cities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelectQuickCity(c)}
                  disabled={isLocating}
                  className="rounded-lg border border-border/80 bg-secondary/50 px-2.5 py-1 text-xs text-foreground/90 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Location is only used to calculate distances and prayer schedules.</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
