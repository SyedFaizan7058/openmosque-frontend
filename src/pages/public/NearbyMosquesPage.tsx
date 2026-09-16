import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Compass,
  List,
  Map as MapIcon,
  MapPinOff,
  RotateCcw,
  Search,
  SearchX,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { MosqueCard } from '@/features/mosques/components/MosqueCard'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { FacilityFilterList } from '@/features/mosques/components/FacilityFilterList'
import { MosqueMap } from '@/features/mosques/components/MosqueMap'
import { useLocationStore } from '@/stores/useLocationStore'
import { useNearbyMosques } from '@/features/mosques/hooks/useNearbyMosques'
import { Pagination } from '@/components/shared/Pagination'
import { cn } from '@/lib/utils'

const RADIUS_OPTIONS_KM = [1, 5, 10, 25, 50] as const
const DEFAULT_RADIUS_KM = 10
const PAGE_SIZE = 15
type ViewMode = 'list' | 'map'

/** Geolocation-driven mosque discovery: detects the visitor's position,
 * lets them pick a search radius and facility filters, and toggle between
 * a list and a clustered map. Denying location access surfaces a clear
 * manual fallback to `/search` rather than a dead end. */
export default function NearbyMosquesPage() {
  const coords = useLocationStore((s) => s.coords)
  const city = useLocationStore((s) => s.city)
  const error = useLocationStore((s) => s.error)
  const isLocating = useLocationStore((s) => s.isLocating)
  const detectGps = useLocationStore((s) => s.detectGps)
  const openModal = useLocationStore((s) => s.openModal)

  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const radiusKm = (() => {
    const parsed = Number(searchParams.get('radiusKm'))
    return RADIUS_OPTIONS_KM.includes(parsed as (typeof RADIUS_OPTIONS_KM)[number])
      ? parsed
      : DEFAULT_RADIUS_KM
  })()
  const page = Math.max(0, Number(searchParams.get('page')) || 0)
  const view: ViewMode = searchParams.get('view') === 'map' ? 'map' : 'list'
  const facilityCodes = useMemo(
    () => searchParams.get('facilities')?.split(',').filter(Boolean) ?? [],
    [searchParams],
  )

  function updateParams(mutate: (next: URLSearchParams) => void) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      mutate(next)
      return next
    })
  }

  function handlePageChange(newPage: number) {
    updateParams((next) => next.set('page', String(newPage)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleRadiusChange(newRadius: number) {
    updateParams((next) => {
      next.set('radiusKm', String(newRadius))
      next.set('page', '0')
    })
  }

  function handleFacilityChange(codes: string[]) {
    updateParams((next) => {
      if (codes.length) next.set('facilities', codes.join(','))
      else next.delete('facilities')
      next.set('page', '0')
    })
  }

  function clearAllFilters() {
    updateParams((next) => {
      next.delete('facilities')
      next.set('radiusKm', String(DEFAULT_RADIUS_KM))
      next.set('page', '0')
    })
  }

  function removeFacility(codeToRemove: string) {
    handleFacilityChange(facilityCodes.filter((c) => c !== codeToRemove))
  }

  const hasActiveFilters = radiusKm !== DEFAULT_RADIUS_KM || facilityCodes.length > 0
  const activeFilterCount = (radiusKm !== DEFAULT_RADIUS_KM ? 1 : 0) + facilityCodes.length

  const nearbyParams = coords ? { lat: coords.lat, lng: coords.lng, radiusKm } : null
  const { data: mosques, isLoading, isFetching, isError } = useNearbyMosques(nearbyParams)

  const results = useMemo(() => {
    if (!mosques) return []
    if (facilityCodes.length === 0) return mosques
    return mosques.filter((mosque) =>
      facilityCodes.every((code) => (mosque.facilityCodes ?? []).includes(code)),
    )
  }, [mosques, facilityCodes])

  const totalPages = Math.ceil(results.length / PAGE_SIZE)
  const paginatedResults = useMemo(
    () => results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [results, page],
  )

  const mapMarkers = useMemo(
    () =>
      results.map((mosque) => ({
        id: mosque.id,
        lat: mosque.latitude,
        lng: mosque.longitude,
        name: mosque.name,
        slug: mosque.slug,
        verified: mosque.verified,
      })),
    [results],
  )

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8f9fa] dark:bg-background py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {city ? `Nearby Mosques in ${city}` : 'Nearby Mosques'}
              </h1>
              <button
                type="button"
                onClick={openModal}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors px-2.5 py-0.5 text-xs font-semibold text-primary cursor-pointer"
              >
                <Compass className="size-3 text-primary" aria-hidden="true" />
                <span>{city || 'Change location'}</span>
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover verified mosques and prayer halls closest to your current location.
            </p>
          </div>

          {/* View Mode Toggle (List / Map) + Mobile Filters Trigger */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <div className="inline-flex items-center rounded-xl border border-border/80 bg-card p-1 shadow-xs" role="group" aria-label="Result view">
              <Button
                type="button"
                size="sm"
                variant={view === 'list' ? 'default' : 'ghost'}
                aria-pressed={view === 'list'}
                className={cn(
                  'h-8 rounded-lg px-3 text-xs font-medium gap-1.5 transition-all',
                  view === 'list' && 'shadow-xs',
                )}
                onClick={() => updateParams((next) => next.set('view', 'list'))}
              >
                <List className="size-3.5" aria-hidden="true" /> List
              </Button>
              <Button
                type="button"
                size="sm"
                variant={view === 'map' ? 'default' : 'ghost'}
                aria-pressed={view === 'map'}
                className={cn(
                  'h-8 rounded-lg px-3 text-xs font-medium gap-1.5 transition-all',
                  view === 'map' && 'shadow-xs',
                )}
                onClick={() => updateParams((next) => next.set('view', 'map'))}
              >
                <MapIcon className="size-3.5" aria-hidden="true" /> Map
              </Button>
            </div>

            {/* Mobile / Small screen Filters Button (Shifted to the right side) */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden h-10 gap-1.5 rounded-xl border-border/80 bg-card px-3.5 text-xs font-medium shadow-xs hover:border-primary/50 text-foreground ml-auto sm:ml-0"
            >
              <SlidersHorizontal className="size-3.5 text-primary" aria-hidden="true" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Loading / Error / Unset States */}
        {isLocating ? (
          <LoadingSpinner label="Detecting your location…" className="py-20" />
        ) : !coords ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-border/80 bg-card p-8 sm:p-10 text-center shadow-sm my-6">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-teal-500/10 text-primary mb-4">
              <Compass className="size-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Find Mosques Near You
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              OpenMosque uses your location to calculate distances, travel routes, and nearest prayer spaces.
            </p>
            {error && (
              <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
                {error}
              </div>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <Button onClick={() => detectGps()} className="rounded-xl gap-2 font-semibold">
                <Compass className="size-4" />
                <span>Use My Location</span>
              </Button>
              <Button variant="outline" onClick={openModal} className="rounded-xl gap-2 font-semibold">
                <Search className="size-4" />
                <span>Select City Manually</span>
              </Button>
            </div>
          </div>
        ) : error ? (
          <EmptyState
            icon={MapPinOff}
            title="We couldn't access your location"
            description={error}
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => detectGps()}>Try GPS again</Button>
                <Button variant="outline" onClick={openModal}>
                  Select city manually
                </Button>
              </div>
            }
          />
        ) : (
          <>

            {/* =========================================================================
                MOBILE FILTER DIALOG MODAL
                ========================================================================= */}
            <Dialog open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl">
                <DialogHeader className="p-4 sm:p-5 border-b border-border/60 pb-3">
                  <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                    <SlidersHorizontal className="size-4 text-primary" /> Filter Mosques
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Customize search radius distance and required facilities.
                  </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto p-4 sm:p-5 space-y-5 flex-1">
                  {/* Radius Section */}
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">
                      Search Radius
                    </Label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {RADIUS_OPTIONS_KM.map((km) => (
                        <button
                          key={km}
                          type="button"
                          onClick={() => handleRadiusChange(km)}
                          className={cn(
                            'py-2 px-1 text-center rounded-xl text-xs font-medium border transition-all',
                            radiusKm === km
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                              : 'bg-muted/40 text-foreground border-border/60 hover:border-primary/40',
                          )}
                        >
                          {km} km
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Facilities Section */}
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">
                      Available Facilities
                    </Label>
                    <FacilityFilterList
                      selectedCodes={facilityCodes}
                      variant="list"
                      onChange={handleFacilityChange}
                    />
                  </div>
                </div>

                <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    disabled={!hasActiveFilters}
                    className="text-xs"
                  >
                    Reset all
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setMobileFilterOpen(false)}
                    className="text-xs px-5 shadow-xs"
                  >
                    Show {results.length} Mosque{results.length === 1 ? '' : 's'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* =========================================================================
                MAIN LAYOUT GRID: DESKTOP SIDEBAR + CONTENT AREA
                ========================================================================= */}
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[280px_1fr]">
              {/* Desktop Sticky Filter Card */}
              <aside className="sticky top-20 hidden lg:flex lg:flex-col gap-5 rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                {/* Header with Title & Reset */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      <RotateCcw className="size-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Radius Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Compass className="size-3.5 text-primary" aria-hidden="true" />
                      <span>Search Radius</span>
                    </Label>
                    <span className="text-xs font-bold text-primary">within {radiusKm} km</span>
                  </div>

                  <div className="grid grid-cols-5 gap-1 pt-1">
                    {RADIUS_OPTIONS_KM.map((km) => (
                      <button
                        key={km}
                        type="button"
                        onClick={() => handleRadiusChange(km)}
                        className={cn(
                          'py-1.5 text-center rounded-lg text-xs font-medium border transition-all',
                          radiusKm === km
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                            : 'bg-muted/40 text-muted-foreground border-transparent hover:border-border/60 hover:text-foreground',
                        )}
                      >
                        {km}k
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border/60" />

                {/* Facilities Multi-Select Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Facilities
                    </Label>
                    {facilityCodes.length > 0 && (
                      <span className="text-xs font-bold text-primary">
                        {facilityCodes.length} selected
                      </span>
                    )}
                  </div>
                  <FacilityFilterList
                    selectedCodes={facilityCodes}
                    variant="list"
                    onChange={handleFacilityChange}
                  />
                </div>
              </aside>

              {/* Main Content (Results & Map) */}
              <div className="flex flex-col gap-5">
                {/* Active Filter Chips & Result Counter Bar */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-card border border-border/70 px-4 py-2.5 shadow-xs">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-medium text-foreground" aria-live="polite">
                      {isLoading || isFetching ? (
                        'Searching nearby…'
                      ) : (
                        <>
                          <span className="font-bold text-primary">{results.length}</span>{' '}
                          mosque{results.length === 1 ? '' : 's'} found within{' '}
                          <span className="font-semibold text-foreground">{radiusKm} km</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Active facility badges (removable with x) */}
                  {facilityCodes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {facilityCodes.map((code) => (
                        <span
                          key={code}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 pl-2 pr-1 py-0.5 text-[11px] font-medium text-primary"
                        >
                          <span>{code.replace(/_/g, ' ').toLowerCase()}</span>
                          <button
                            type="button"
                            onClick={() => removeFacility(code)}
                            className="rounded-full hover:bg-primary/20 p-0.5 text-primary"
                            aria-label={`Remove filter ${code}`}
                          >
                            <X className="size-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content Rendering */}
                {isLoading ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full rounded-xl" />
                    ))}
                  </div>
                ) : isError ? (
                  <EmptyState
                    icon={SearchX}
                    title="Couldn't load nearby mosques"
                    description="Something went wrong reaching the server. Please try again shortly."
                    action={
                      <Button asChild variant="outline">
                        <Link to="/search">Search all mosques instead</Link>
                      </Button>
                    }
                  />
                ) : results.length === 0 ? (
                  <EmptyState
                    icon={MapPinOff}
                    title="No mosques found nearby"
                    description={`We couldn't find any mosques within ${radiusKm} km matching your filter criteria. Try expanding the radius or clearing filters.`}
                    action={
                      <div className="flex flex-wrap justify-center gap-2">
                        {hasActiveFilters && (
                          <Button onClick={clearAllFilters} variant="default">
                            Clear all filters
                          </Button>
                        )}
                        <Button asChild variant="outline">
                          <Link to="/search">Search all mosques</Link>
                        </Button>
                      </div>
                    }
                  />
                ) : view === 'map' ? (
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
                    <MosqueMap
                      markers={mapMarkers}
                      center={coords ?? undefined}
                      className="h-[560px]"
                    />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {paginatedResults.map((mosque) => (
                        <MosqueCard
                          key={mosque.id}
                          mosque={mosque}
                          overlaySlot={<FavoriteButton mosqueId={mosque.id} />}
                        />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="pt-4 flex justify-center">
                        <Pagination
                          page={page}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
