import { useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Building2, Globe, Mail, Pencil, Phone, PhoneOff, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import NotFoundPage from '@/pages/errors/NotFoundPage'
import { MosqueHeroBanner } from '@/features/mosques/components/MosqueHeroBanner'
import { MosqueFacilitiesOverview } from '@/features/mosques/components/MosqueFacilitiesOverview'
import { MosqueMap } from '@/features/mosques/components/MosqueMap'
import { useMosqueDetail } from '@/features/mosques/hooks/useMosqueDetail'
import { PrayerTimesWidget } from '@/features/prayer/components/PrayerTimesWidget'
import { DateNav } from '@/features/prayer/components/DateNav'
import { EventList } from '@/features/events/components/EventList'
import { ReviewList } from '@/features/reviews/components/ReviewList'
import { QuestionList } from '@/features/questions/components/QuestionList'
import { ClaimMosqueForm } from '@/features/claims/components/ClaimMosqueForm'
import { MosqueSubmissionForm } from '@/features/submissions/components/MosqueSubmissionForm'
import { useAuthStore, selectIsAuthenticated, selectUser } from '@/features/auth/store/useAuthStore'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'prayer-times', label: 'Prayer Times' },
  { id: 'events', label: 'Events' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'qa', label: 'Q&A' },
] as const
type TabId = (typeof TABS)[number]['id']

interface TabBarProps {
  active: TabId
  onChange: (id: TabId) => void
}

/** A minimal, fully keyboard-operable tab bar (no Radix Tabs dependency in
 * this project yet) — left/right arrow keys move focus and selection
 * together (WAI-ARIA "automatic activation" tab pattern), Home/End jump to
 * the first/last tab. */
function TabBar({ active, onChange }: TabBarProps) {
  const buttonRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({})

  function focusAndSelect(id: TabId) {
    onChange(id)
    buttonRefs.current[id]?.focus()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = TABS.findIndex((t) => t.id === active)
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusAndSelect(TABS[(currentIndex + 1) % TABS.length]!.id)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusAndSelect(TABS[(currentIndex - 1 + TABS.length) % TABS.length]!.id)
    } else if (e.key === 'Home') {
      e.preventDefault()
      focusAndSelect(TABS[0]!.id)
    } else if (e.key === 'End') {
      e.preventDefault()
      focusAndSelect(TABS[TABS.length - 1]!.id)
    }
  }

  return (
    <div role="tablist" aria-label="Mosque details" className="flex gap-1 overflow-x-auto border-b border-border" onKeyDown={handleKeyDown}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => {
            buttonRefs.current[tab.id] = el
          }}
          type="button"
          role="tab"
          id={`mosque-tab-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`mosque-panel-${tab.id}`}
          tabIndex={active === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          className={cn(
            '-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            active === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function TabPanel({ id, active, children }: { id: TabId; active: TabId; children: ReactNode }) {
  if (id !== active) return null
  return (
    <div role="tabpanel" id={`mosque-panel-${id}`} aria-labelledby={`mosque-tab-${id}`} tabIndex={0} className="py-6">
      {children}
    </div>
  )
}

export default function MosqueDetailPage() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const detailQuery = useMosqueDetail(idOrSlug)
  const { data: mosque, isLoading, isError, error } = detailQuery
  // Prayer times are the reason most visitors open a mosque page, so that
  // tab is the default landing view rather than "Overview".
  const [activeTab, setActiveTab] = useState<TabId>('prayer-times')
  const [prayerDate, setPrayerDate] = useState<string | undefined>(undefined)
  const [claimOpen, setClaimOpen] = useState(false)
  const [suggestEditOpen, setSuggestEditOpen] = useState(false)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const currentUser = useAuthStore(selectUser)

  const handleSuggestEdit = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
    } else {
      setSuggestEditOpen(true)
    }
  }

  if (isLoading) {
    return <LoadingSpinner label="Loading mosque…" className="min-h-[60vh]" />
  }

  if (isError) {
    if (error?.code === 'RESOURCE_NOT_FOUND') {
      return <NotFoundPage />
    }
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <EmptyState
          title="Couldn't load this mosque"
          description={error?.message ?? 'Something went wrong reaching the server. Please try again shortly.'}
        />
      </div>
    )
  }

  if (!mosque) return null

  // Both typed arrays but, per the `claimedMosqueIds` live-crash precedent,
  // defensively treated as possibly `undefined` from the real backend.
  const facilities = mosque.facilities ?? []
  const images = mosque.images ?? []

  const mapMarkers = [
    { id: mosque.id, lat: mosque.latitude, lng: mosque.longitude, name: mosque.name, slug: mosque.slug, verified: mosque.verified },
  ]
  // Opens the device's default maps app/site with turn-by-turn directions
  // pre-filled — Google's directions URL API works without any key and
  // gracefully redirects to Apple Maps on iOS Safari, so no separate
  // mobile-specific link is needed. Shared by the header's "Directions"
  // button and the location line's external link.
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8f9fa] dark:bg-background py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        {/* Unified Hero Banner Card matching Image 2 & Image 3 */}
        <MosqueHeroBanner
          mosque={mosque}
          images={images}
          directionsUrl={directionsUrl}
          onSuggestEdit={() => setSuggestEditOpen(true)}
          onClaimMosque={
            !currentUser?.claimedMosqueIds?.includes(mosque.id) && !mosque.verified
              ? () => setClaimOpen(true)
              : undefined
          }
        />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <TabBar active={activeTab} onChange={setActiveTab} />

          <TabPanel id="overview" active={activeTab}>
            <div className="flex flex-col gap-6">
              {/* About Mosque Card */}
              <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
                <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-foreground">
                  <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
                  About {mosque.name}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {mosque.description ||
                    `${mosque.name} is a welcoming community mosque serving the local Muslim community with daily prayers, Jummah congregation, and educational facilities.`}
                </p>
              </div>

              {/* Facilities Section Card */}
              <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    Facilities & Amenities
                  </h2>
                  {facilities.length > 0 && (
                    <span className="text-xs font-semibold text-muted-foreground">
                      {facilities.length} {facilities.length === 1 ? 'facility' : 'facilities'} available
                    </span>
                  )}
                </div>

                {facilities.length > 0 ? (
                  <MosqueFacilitiesOverview facilityCodes={facilities.map((f) => f.facilityCode)} />
                ) : (
                  <EmptyState
                    icon={Building2}
                    title="No facilities registered yet"
                    description="Help the community keep information accurate. If you know what facilities are available at this mosque, you can suggest an edit."
                    action={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSuggestEdit}
                        className="rounded-xl border-primary/40 text-primary hover:bg-primary hover:text-white transition-all font-semibold gap-2 shadow-xs"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Suggest an edit
                      </Button>
                    }
                  />
                )}
              </div>

              {/* Contact Information Card */}
              <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
                <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-foreground">
                  <Phone className="size-5 text-primary" aria-hidden="true" />
                  Contact Information
                </h2>

                {mosque.contactPhone || mosque.contactEmail || mosque.websiteUrl ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {mosque.contactPhone && (
                      <a
                        href={`tel:${mosque.contactPhone}`}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-border/80 bg-muted/30 hover:bg-primary/5 hover:border-primary/40 transition-all group"
                      >
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Phone className="size-4" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-muted-foreground">Phone</span>
                          <span className="text-sm font-semibold text-foreground truncate">{mosque.contactPhone}</span>
                        </div>
                      </a>
                    )}

                    {mosque.contactEmail && (
                      <a
                        href={`mailto:${mosque.contactEmail}`}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-border/80 bg-muted/30 hover:bg-primary/5 hover:border-primary/40 transition-all group"
                      >
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Mail className="size-4" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-muted-foreground">Email</span>
                          <span className="text-sm font-semibold text-foreground truncate">{mosque.contactEmail}</span>
                        </div>
                      </a>
                    )}

                    {mosque.websiteUrl && (
                      <a
                        href={mosque.websiteUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-border/80 bg-muted/30 hover:bg-primary/5 hover:border-primary/40 transition-all group"
                      >
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Globe className="size-4" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-muted-foreground">Website</span>
                          <span className="text-sm font-semibold text-foreground truncate">{mosque.websiteUrl.replace(/^https?:\/\//, '')}</span>
                        </div>
                      </a>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    icon={PhoneOff}
                    title="No contact information registered yet"
                    description="Help visitors get in touch with this mosque by providing phone, email, or website details."
                    action={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSuggestEdit}
                        className="rounded-xl border-primary/40 text-primary hover:bg-primary hover:text-white transition-all font-semibold gap-2 shadow-xs"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Suggest an edit
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
          </TabPanel>

          <TabPanel id="prayer-times" active={activeTab}>
            <div className="flex flex-col gap-4">
              <DateNav date={prayerDate} onChange={setPrayerDate} />
              {idOrSlug && (
                <PrayerTimesWidget
                  idOrSlug={idOrSlug}
                  date={prayerDate}
                  mosqueName={mosque.name}
                  latitude={mosque.latitude}
                  longitude={mosque.longitude}
                />
              )}
            </div>
          </TabPanel>
          <TabPanel id="events" active={activeTab}>
            <EventList idOrSlug={idOrSlug ?? mosque.slug} />
          </TabPanel>
          <TabPanel id="reviews" active={activeTab}>
            <ReviewList mosqueId={mosque.id} idOrSlug={idOrSlug ?? mosque.slug} />
          </TabPanel>
          <TabPanel id="qa" active={activeTab}>
            <QuestionList mosqueId={mosque.id} idOrSlug={idOrSlug ?? mosque.slug} />
          </TabPanel>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="relative z-0 isolate overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
            <MosqueMap
              markers={mapMarkers}
              singleMarker
              center={{ lat: mosque.latitude, lng: mosque.longitude }}
              zoom={15}
              className="h-[250px] w-full border-0 rounded-2xl"
            />
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
            {currentUser?.claimedMosqueIds?.includes(mosque.id) ? (
              <div className="flex items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-secondary/40 px-3 py-2 text-sm text-secondary-foreground font-medium">
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" /> You've claimed this mosque
              </div>
            ) : isAuthenticated ? (
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 rounded-xl border-border/80 hover:border-accent/60 hover:bg-accent/5 hover:text-accent transition-all font-medium text-sm gap-2"
                onClick={() => setClaimOpen(true)}
              >
                <ShieldCheck className="size-4 text-accent" aria-hidden="true" />
                <span>Claim this Mosque</span>
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    aria-disabled="true"
                    onClick={(e) => e.preventDefault()}
                    className="w-full h-10 rounded-xl cursor-not-allowed opacity-60 gap-2 text-sm border-border/80"
                  >
                    <ShieldCheck className="size-4" aria-hidden="true" />
                    <span>Claim this Mosque</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sign in to claim this mosque</TooltipContent>
              </Tooltip>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 rounded-xl border-border/80 hover:border-primary/60 hover:bg-primary/5 hover:text-primary transition-all font-medium text-sm gap-2"
              onClick={handleSuggestEdit}
            >
              <Pencil className="size-4 text-primary" aria-hidden="true" />
              <span>Suggest an edit</span>
            </Button>
          </div>
        </aside>
      </div>

      <ClaimMosqueForm open={claimOpen} onOpenChange={setClaimOpen} mosqueId={mosque.id} mosqueName={mosque.name} />

      <Dialog open={suggestEditOpen} onOpenChange={setSuggestEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Suggest an edit to {mosque.name}</DialogTitle>
            <DialogDescription>A moderator will review your suggested changes before they're applied.</DialogDescription>
          </DialogHeader>
          <MosqueSubmissionForm
            mode="edit"
            mosqueId={mosque.id}
            defaultValues={{
              name: mosque.name,
              description: mosque.description ?? '',
              address: mosque.address,
              city: mosque.city,
              state: mosque.state ?? '',
              country: mosque.country,
              postalCode: mosque.postalCode ?? '',
              latitude: String(mosque.latitude),
              longitude: String(mosque.longitude),
              contactPhone: mosque.contactPhone ?? '',
              contactEmail: mosque.contactEmail ?? '',
              websiteUrl: mosque.websiteUrl ?? '',
              liveStreamUrl: mosque.liveStreamUrl ?? '',
              facilityCodes: facilities.map((f) => f.facilityCode),
            }}
            onSuccess={() => setSuggestEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
