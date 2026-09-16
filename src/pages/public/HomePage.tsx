import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Accessibility,
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  Clock,
  Droplets,
  Heart,
  HeartHandshake,
  MapPin,
  MapPinOff,
  ParkingSquare,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { MosqueCard } from '@/features/mosques/components/MosqueCard'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { MosqueHeroGraphic } from '@/components/shared/MosqueHeroGraphic'
import { useLocationStore } from '@/stores/useLocationStore'
import { useNearbyMosques } from '@/features/mosques/hooks/useNearbyMosques'

const NEAR_YOU_RADIUS_KM = 10

interface NearYouSectionProps {
  onCount: (count: number) => void
}

function NearYouSection({ onCount }: NearYouSectionProps) {
  const coords = useLocationStore((s) => s.coords)
  const isLocating = useLocationStore((s) => s.isLocating)
  const error = useLocationStore((s) => s.error)
  const detectGps = useLocationStore((s) => s.detectGps)
  const openModal = useLocationStore((s) => s.openModal)

  const nearbyParams = coords ? { lat: coords.lat, lng: coords.lng, radiusKm: NEAR_YOU_RADIUS_KM } : null
  const { data: mosques, isLoading, isError } = useNearbyMosques(nearbyParams)

  useEffect(() => {
    if (isLocating || error || !coords || isLoading || isError || !mosques || mosques.length === 0) {
      onCount(0)
    } else {
      onCount(mosques.length)
    }
  }, [isLocating, error, coords, isLoading, isError, mosques, onCount])

  if (isLocating) {
    return <LoadingSpinner label="Detecting your location…" className="py-12" />
  }

  if (!coords) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xs p-8 sm:p-10 text-center shadow-xs">
        <div className="mx-auto flex size-13 items-center justify-center rounded-2xl bg-teal-500/10 text-primary mb-3.5">
          <Compass className="size-6 text-primary" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Find Mosques Near You
        </h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">
          Allow OpenMosque to access your location to view verified masjids, jamat prayer times, and accurate walking distances.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <Button
            type="button"
            size="default"
            onClick={() => detectGps()}
            className="rounded-xl gap-2 font-semibold shadow-xs"
          >
            <Compass className="size-4" />
            <span>Use My Location</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={openModal}
            className="rounded-xl gap-2 font-semibold"
          >
            <Search className="size-4" />
            <span>Select City Manually</span>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={MapPinOff}
        title="Couldn't load nearby mosques"
        description="Something went wrong reaching the server. Please try again shortly."
      />
    )
  }

  if (!mosques || mosques.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No mosques found nearby"
        description={`We couldn't find any mosques within ${NEAR_YOU_RADIUS_KM}km. Try a broader search or change your location.`}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={openModal}>Change Location</Button>
            <Button asChild variant="outline">
              <Link to="/search">Search all mosques</Link>
            </Button>
          </div>
        }
      />
    )
  }

  const displayedMosques = mosques.slice(0, 8)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {displayedMosques.map((mosque) => (
        <MosqueCard key={mosque.id} mosque={mosque} overlaySlot={<FavoriteButton mosqueId={mosque.id} />} />
      ))}
    </div>
  )
}

/** The public discovery homepage: hero + search bar, a geolocation-driven
 * "Near you" strip, and a contribute CTA. */
export default function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [nearbyCount, setNearbyCount] = useState(0)

  const currentCity = useLocationStore((s) => s.city)

  const handleNearbyCount = useCallback((count: number) => {
    setNearbyCount(count)
  }, [])

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    navigate(`/search${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    // PublicLayout (the parent route) already renders the shared header and
    // the min-h-screen flex column — this page just contributes its content.
    <>
      <header className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/[0.03] to-background pt-10 sm:pt-16 pb-0 border-b border-border/40">
        {/* Soft atmospheric ambient glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-primary/15 rounded-full blur-3xl" />

        <div className="container relative mx-auto flex flex-col items-center gap-5 px-4 text-center sm:gap-6 sm:px-6">
          {/* Discovery Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary shadow-xs backdrop-blur-xs">
            <Sparkles className="size-3.5 text-primary" />
            <span>Discover Verified Mosques & Community Hubs</span>
          </div>

          <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Find your mosque,{' '}
            <span className="text-primary bg-gradient-to-r from-primary via-teal-600 to-primary bg-clip-text text-transparent">
              wherever you are
            </span>
          </h1>

          <p className="max-w-xl text-base sm:text-lg text-muted-foreground">
            Prayer times, khutbahs, events, and community — all in one place.
          </p>

          {/* Elevated Modern Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex w-full max-w-xl items-center rounded-2xl bg-card p-1.5 shadow-lg shadow-primary/5 ring-1 ring-border/80 transition-all focus-within:ring-2 focus-within:ring-primary/40 focus-within:shadow-xl"
            role="search"
          >
            <label htmlFor="home-search" className="sr-only">
              Search mosques by name or city
            </label>
            <Search className="ml-3 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <Input
              id="home-search"
              type="search"
              placeholder="Search by mosque name, city, or neighborhood…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
            />
            <Button type="submit" size="default" className="gap-2 rounded-xl px-5 font-medium shadow-xs">
              Search
            </Button>
          </form>

          {/* Quick Action Navigation Buttons */}
          <div className="flex w-full max-w-lg flex-row items-center justify-center gap-2.5 sm:gap-3.5">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 rounded-xl border-border bg-card/60 shadow-2xs hover:bg-accent/40"
            >
              <Link to="/nearby">
                <MapPin className="size-3.5 text-primary" />
                <span>Nearby</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 rounded-xl border-border bg-card/60 shadow-2xs hover:bg-accent/40"
            >
              <Link to="/search">
                <Search className="size-3.5 text-primary" />
                <span>Search</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 rounded-xl border-border bg-card/60 shadow-2xs hover:bg-accent/40"
            >
              <Link to="/favorites">
                <Heart className="size-3.5 text-rose-500" />
                <span>Favorites</span>
              </Link>
            </Button>
          </div>

          {/* Community Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verified prayer schedules</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4 text-teal-600 dark:text-teal-400" />
              <span>Multi-shift Friday Jummah</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HeartHandshake className="size-4 text-primary" />
              <span>Open community driven</span>
            </div>
          </div>

          {/* Majestic Mosque Architectural Vector Illustration */}
          <div className="w-full max-w-5xl mx-auto mt-6 sm:mt-10 -mb-1 px-2 sm:px-4">
            <MosqueHeroGraphic className="drop-shadow-xs" />
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {currentCity ? `Mosques near ${currentCity}` : 'Near you'}
            </h2>
            {nearbyCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {nearbyCount} closest
              </span>
            )}
          </div>
          <Link
            to="/nearby"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group"
          >
            <span>View all nearby</span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
        <NearYouSection onCount={handleNearbyCount} />
      </section>

      {/* =========================================================================
          SECTION: BROWSE MOSQUES BY AMENITIES & FACILITIES
          ========================================================================= */}
      <section className="border-y border-border/60 bg-muted/25 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center gap-2 mb-8 sm:mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Facility Finder
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Browse Mosques by Amenities
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg">
              Find prayer spaces suited to your worship, family, and accessibility needs.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { label: "Women's Section", code: 'WOMENS_SECTION', icon: Users, desc: 'Dedicated prayer area' },
              { label: 'Wudu Facilities', code: 'WUDU_AREA', icon: Droplets, desc: 'Clean ablution spaces' },
              { label: 'Wheelchair Access', code: 'WHEELCHAIR_ACCESSIBILITY', icon: Accessibility, desc: 'Ramps & accessible entry' },
              { label: 'On-site Parking', code: 'PARKING', icon: ParkingSquare, desc: 'Visitor parking spaces' },
              { label: 'Janazah Services', code: 'JANAZAH_SERVICES', icon: HeartHandshake, desc: 'Funeral arrangements' },
              { label: 'Library & Classes', code: 'LIBRARY', icon: BookOpen, desc: 'Islamic literature & study' },
            ].map((amenity) => {
              const Icon = amenity.icon
              return (
                <Link
                  key={amenity.code}
                  to={`/search?facilities=${amenity.code}`}
                  className="group flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {amenity.label}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                    {amenity.desc}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: CORE PLATFORM PILLARS ("WHY OPENMOSQUE")
          ========================================================================= */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center gap-2 mb-10 sm:mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Why OpenMosque
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Everything You Need in One Place
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
              Reliable, verified, and community-curated information for mosques worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Pillar 1 */}
            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all">
              <div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-500/10 text-primary mb-5">
                  <Clock className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">
                  Dual Fiqh Timings &amp; Iqamah
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Start and Iqamah timings with full support for both Hanafi and Shafi'i Asr standards, live running prayer indicators, and full-year schedules.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-border/60 flex items-center text-xs font-semibold text-primary">
                <Link to="/search" className="inline-flex items-center gap-1 hover:underline">
                  <span>View prayer timetables</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all">
              <div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-500/10 text-primary mb-5">
                  <ShieldCheck className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">
                  Verified Local Facilities
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Know before you go. Easily check wudu areas, women's prayer rooms, wheelchair accessibility, parking availability, and funeral services.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-border/60 flex items-center text-xs font-semibold text-primary">
                <Link to="/search" className="inline-flex items-center gap-1 hover:underline">
                  <span>Explore verified amenities</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all">
              <div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-500/10 text-primary mb-5">
                  <Users className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">
                  Friday Jummah Schedules
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Never miss Friday prayers. Look up multiple Jummah shifts, khutbah start times, speech languages, and directions directly on the map.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-border/60 flex items-center text-xs font-semibold text-primary">
                <Link to="/nearby" className="inline-flex items-center gap-1 hover:underline">
                  <span>Locate Friday prayers</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: COMMUNITY CONTRIBUTION BANNER
          ========================================================================= */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-14 sm:pb-18">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#003438] via-[#004a4e] to-[#00272a] p-8 sm:p-12 text-white shadow-xl">
          {/* Soft ambient glow aura */}
          <div className="pointer-events-none absolute -right-16 -top-16 size-80 rounded-full bg-teal-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-teal-200 border border-white/20 mb-3.5 backdrop-blur-xs">
                <PlusCircle className="size-3.5" />
                Open Community Platform
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Help us map every mosque &amp; prayer space
              </h3>
              <p className="mt-2.5 text-sm sm:text-base text-teal-100/85 leading-relaxed">
                Notice a local masjid that is missing or has outdated prayer times? Submit updates or claim your mosque profile to help travelers and local worshippers.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-xl bg-white text-[#007378] hover:bg-teal-50 font-bold shadow-md h-11 sm:h-12 px-3 sm:px-6 text-xs sm:text-base justify-center"
              >
                <Link to="/submit-mosque">Add a Mosque</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-xl border-2 border-white bg-white/10 text-white hover:bg-white hover:text-[#003438] font-bold shadow-xs backdrop-blur-xs h-11 sm:h-12 px-3 sm:px-6 text-xs sm:text-base justify-center transition-all"
              >
                <Link to="/search">Search Directory</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
