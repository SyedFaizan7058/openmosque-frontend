import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Globe,
  List,
  Map as MapIcon,
  MapPin,
  RotateCcw,
  Search,
  SearchX,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Pagination } from '@/components/shared/Pagination'
import { MosqueCard } from '@/features/mosques/components/MosqueCard'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { FacilityFilterList } from '@/features/mosques/components/FacilityFilterList'
import { MosqueMap } from '@/features/mosques/components/MosqueMap'
import { useSearchMosques } from '@/features/mosques/hooks/useSearchMosques'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 15
type ViewMode = 'list' | 'map'

function parsePage(raw: string | null): number {
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0
}

/**
 * Public mosque search: debounced text/city/country filters, a facility
 * checklist, and a map/list toggle — redesigned to match the modern UI/UX
 * and layout of the Nearby Mosques page with full desktop/mobile responsiveness.
 */
export default function SearchMosquesPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [qInput, setQInput] = useState(searchParams.get('q') ?? '')
  const [cityInput, setCityInput] = useState(searchParams.get('city') ?? '')
  const [countryInput, setCountryInput] = useState(searchParams.get('country') ?? '')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const debouncedQ = useDebouncedValue(qInput, 400)
  const debouncedCity = useDebouncedValue(cityInput, 400)
  const debouncedCountry = useDebouncedValue(countryInput, 400)

  const prevFiltersRef = useRef({ q: debouncedQ, city: debouncedCity, country: debouncedCountry })
  useEffect(() => {
    // Only update search params and reset page if the filter inputs ACTUALLY changed
    const prev = prevFiltersRef.current
    if (prev.q === debouncedQ && prev.city === debouncedCity && prev.country === debouncedCountry) {
      return
    }
    prevFiltersRef.current = { q: debouncedQ, city: debouncedCity, country: debouncedCountry }

    setSearchParams(
      (prevParams) => {
        const next = new URLSearchParams(prevParams)
        if (debouncedQ) next.set('q', debouncedQ)
        else next.delete('q')
        if (debouncedCity) next.set('city', debouncedCity)
        else next.delete('city')
        if (debouncedCountry) next.set('country', debouncedCountry)
        else next.delete('country')
        next.set('page', '0')
        return next
      },
      { replace: true },
    )
  }, [debouncedQ, debouncedCity, debouncedCountry, setSearchParams])

  const page = parsePage(searchParams.get('page'))
  const view: ViewMode = searchParams.get('view') === 'map' ? 'map' : 'list'
  const facilityCodes = useMemo(
    () => searchParams.get('facilities')?.split(',').filter(Boolean) ?? [],
    [searchParams],
  )

  function updateParams(mutate: (next: URLSearchParams) => void, options?: { replace?: boolean }) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      mutate(next)
      return next
    }, options)
  }

  function handleFacilityChange(codes: string[]) {
    updateParams((next) => {
      if (codes.length) next.set('facilities', codes.join(','))
      else next.delete('facilities')
      next.set('page', '0')
    })
  }

  function handlePageChange(newPage: number) {
    updateParams((next) => next.set('page', String(newPage)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleViewChange(newView: ViewMode) {
    updateParams((next) => next.set('view', newView), { replace: true })
  }

  function clearAllFilters() {
    setQInput('')
    setCityInput('')
    setCountryInput('')
    updateParams((next) => {
      next.delete('q')
      next.delete('city')
      next.delete('country')
      next.delete('facilities')
      next.set('page', '0')
    })
  }

  function removeFacility(codeToRemove: string) {
    handleFacilityChange(facilityCodes.filter((c) => c !== codeToRemove))
  }

  function clearQ() {
    setQInput('')
    updateParams((next) => {
      next.delete('q')
      next.set('page', '0')
    })
  }

  function clearCity() {
    setCityInput('')
    updateParams((next) => {
      next.delete('city')
      next.set('page', '0')
    })
  }

  function clearCountry() {
    setCountryInput('')
    updateParams((next) => {
      next.delete('country')
      next.set('page', '0')
    })
  }

  const hasActiveFilters = Boolean(
    qInput.trim() || cityInput.trim() || countryInput.trim() || facilityCodes.length > 0,
  )
  const activeFilterCount =
    (qInput.trim() ? 1 : 0) +
    (cityInput.trim() ? 1 : 0) +
    (countryInput.trim() ? 1 : 0) +
    facilityCodes.length

  const { data, isLoading, isError } = useSearchMosques({
    q: searchParams.get('q') || undefined,
    city: searchParams.get('city') || undefined,
    country: searchParams.get('country') || undefined,
    page,
    size: PAGE_SIZE,
  })

  const results = useMemo(() => {
    if (!data) return []
    if (facilityCodes.length === 0) return data.content
    return data.content.filter((mosque) =>
      facilityCodes.every((code) => (mosque.facilityCodes ?? []).includes(code)),
    )
  }, [data, facilityCodes])

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
                Search Mosques
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Search className="size-3 text-primary" aria-hidden="true" /> Global Directory
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Find and explore verified mosques and prayer spaces across the globe.
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
                onClick={() => handleViewChange('list')}
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
                onClick={() => handleViewChange('map')}
              >
                <MapIcon className="size-3.5" aria-hidden="true" /> Map
              </Button>
            </div>

            {/* Mobile / Small screen Filters Button (Shifted to right side) */}
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
                Filter by keyword, city, country, or required facilities.
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
              {/* Keyword Input */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mobile-search-q" className="text-xs font-semibold text-foreground">
                  Name or Keyword
                </Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="mobile-search-q"
                    type="text"
                    value={qInput}
                    onChange={(e) => setQInput(e.target.value)}
                    placeholder="e.g. Al-Noor Masjid"
                    className="pl-8 text-xs h-9"
                  />
                  {qInput && (
                    <button
                      type="button"
                      onClick={clearQ}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* City Input */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mobile-search-city" className="text-xs font-semibold text-foreground">
                  City
                </Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="mobile-search-city"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="e.g. London, Toronto"
                    className="pl-8 text-xs h-9"
                  />
                  {cityInput && (
                    <button
                      type="button"
                      onClick={clearCity}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Country Input */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mobile-search-country" className="text-xs font-semibold text-foreground">
                  Country
                </Label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="mobile-search-country"
                    value={countryInput}
                    onChange={(e) => setCountryInput(e.target.value)}
                    placeholder="e.g. Canada, UK"
                    className="pl-8 text-xs h-9"
                  />
                  {countryInput && (
                    <button
                      type="button"
                      onClick={clearCountry}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-border/60 pt-3" />

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

            {/* Keyword Filter */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="search-q" className="text-xs font-semibold text-foreground">
                Name or Keyword
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="search-q"
                  type="text"
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  placeholder="e.g. Al-Noor Masjid"
                  className="pl-8 text-xs h-9"
                />
                {qInput && (
                  <button
                    type="button"
                    onClick={clearQ}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* City Filter */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="search-city" className="text-xs font-semibold text-foreground">
                City
              </Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="search-city"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="e.g. London, Toronto"
                  className="pl-8 text-xs h-9"
                />
                {cityInput && (
                  <button
                    type="button"
                    onClick={clearCity}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Country Filter */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="search-country" className="text-xs font-semibold text-foreground">
                Country
              </Label>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="search-country"
                  value={countryInput}
                  onChange={(e) => setCountryInput(e.target.value)}
                  placeholder="e.g. Canada, UK"
                  className="pl-8 text-xs h-9"
                />
                {countryInput && (
                  <button
                    type="button"
                    onClick={clearCountry}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
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
                  {isLoading ? (
                    'Searching mosques…'
                  ) : (
                    <>
                      <span className="font-bold text-primary">{data?.totalElements ?? results.length}</span>{' '}
                      mosque{(data?.totalElements ?? results.length) === 1 ? '' : 's'} found
                    </>
                  )}
                </p>
              </div>

              {/* Active filter badges */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {debouncedQ && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 pl-2 pr-1 py-0.5 text-[11px] font-medium text-primary">
                      <span>"{debouncedQ}"</span>
                      <button
                        type="button"
                        onClick={clearQ}
                        className="rounded-full hover:bg-primary/20 p-0.5 text-primary"
                        aria-label="Remove keyword filter"
                      >
                        <X className="size-2.5" />
                      </button>
                    </span>
                  )}
                  {debouncedCity && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 pl-2 pr-1 py-0.5 text-[11px] font-medium text-primary">
                      <span>City: {debouncedCity}</span>
                      <button
                        type="button"
                        onClick={clearCity}
                        className="rounded-full hover:bg-primary/20 p-0.5 text-primary"
                        aria-label="Remove city filter"
                      >
                        <X className="size-2.5" />
                      </button>
                    </span>
                  )}
                  {debouncedCountry && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 pl-2 pr-1 py-0.5 text-[11px] font-medium text-primary">
                      <span>Country: {debouncedCountry}</span>
                      <button
                        type="button"
                        onClick={clearCountry}
                        className="rounded-full hover:bg-primary/20 p-0.5 text-primary"
                        aria-label="Remove country filter"
                      >
                        <X className="size-2.5" />
                      </button>
                    </span>
                  )}
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
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-[11px] text-muted-foreground hover:text-primary transition-colors underline ml-1"
                  >
                    Clear all
                  </button>
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
                title="Couldn't load search results"
                description="Something went wrong reaching the server. Please try again shortly."
                action={
                  <Button asChild variant="outline">
                    <Link to="/nearby">Explore nearby mosques instead</Link>
                  </Button>
                }
              />
            ) : results.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No mosques matched your search"
                description="Try broadening your search query, checking for typos, or clearing filters."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    {hasActiveFilters && (
                      <Button onClick={clearAllFilters} variant="default">
                        Clear all filters
                      </Button>
                    )}
                    <Button asChild variant="outline">
                      <Link to="/nearby">Explore nearby mosques</Link>
                    </Button>
                  </div>
                }
              />
            ) : view === 'map' ? (
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <MosqueMap markers={mapMarkers} className="h-[600px] w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((mosque) => (
                  <MosqueCard
                    key={mosque.id}
                    mosque={mosque}
                    overlaySlot={<FavoriteButton mosqueId={mosque.id} />}
                  />
                ))}
              </div>
            )}

            {/* Numbered Pagination */}
            {data && data.totalPages > 1 && !isError && (
              <Pagination
                page={page}
                totalPages={data.totalPages}
                onPageChange={handlePageChange}
                className="pt-2"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
