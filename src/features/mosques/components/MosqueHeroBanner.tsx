import { useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  Images,
  MapPin,
  MoreHorizontal,
  Navigation,
  Pencil,
  Share2,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { MosqueIcon } from '@/components/icons/MosqueIcon'
import { useAuthStore, selectIsAuthenticated } from '@/features/auth/store/useAuthStore'
import { useFavoriteMosqueIds } from '@/features/favorites/hooks/useFavoriteMosqueIds'
import { useToggleFavorite } from '@/features/favorites/hooks/useToggleFavorite'
import type { MosqueResponseDto, MosqueImageDto } from '@/features/mosques/types'
import { cn } from '@/lib/utils'

interface MosqueHeroBannerProps {
  mosque: MosqueResponseDto
  images: MosqueImageDto[]
  directionsUrl: string
  onSuggestEdit: () => void
  onClaimMosque?: () => void
}

/**
 * A unified, cinematic hero banner for the mosque detail page (matching Image 2).
 *
 * Features:
 * 1. Single unified card: Mosque name, verified badge, rating, location, and action
 *    buttons (Directions, Favorite, Share, More) overlaid directly on the banner.
 * 2. Real Mosque photo display when available.
 * 3. Graceful fallback illustration (matching Image 3) when no photos are uploaded yet.
 * 4. Multi-image carousel with previous/next controls and a full-screen Lightbox gallery.
 */
export function MosqueHeroBanner({
  mosque,
  images,
  directionsUrl,
  onSuggestEdit,
  onClaimMosque,
}: MosqueHeroBannerProps) {
  const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const favoriteMosqueIds = useFavoriteMosqueIds()
  const toggleFavorite = useToggleFavorite()
  const isFavorited = favoriteMosqueIds.has(mosque.id)

  const locationLine = [mosque.city, mosque.state, mosque.country].filter(Boolean).join(', ')

  function nextImage() {
    if (sortedImages.length <= 1) return
    setActiveImageIndex((prev) => (prev + 1) % sortedImages.length)
  }

  function prevImage() {
    if (sortedImages.length <= 1) return
    setActiveImageIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      nextImage()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prevImage()
    }
  }

  function handleToggleFavorite(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.info('Sign in to save mosques to your favorites.')
      return
    }
    toggleFavorite.mutate({ mosqueId: mosque.id, isFavorited })
  }

  async function handleShare(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: mosque.name, url })
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          toast.error("Couldn't share this page. Please try again.")
        }
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard.')
    } catch {
      toast.error("Couldn't copy link to clipboard.")
    }
  }

  const currentImage = sortedImages[activeImageIndex]

  return (
    <>
      <div
        className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 shadow-md min-h-[300px] sm:min-h-[360px] md:min-h-[400px] flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label={`${mosque.name} photo banner`}
      >
        {/* =========================================================================
            BACKGROUND: MOSQUE PHOTO OR CRAFTED PLACEHOLDER (IMAGE 3)
            ========================================================================= */}
        {sortedImages.length > 0 && currentImage ? (
          <img
            src={currentImage.imageUrl}
            alt={`${mosque.name} view ${activeImageIndex + 1}`}
            className="absolute inset-0 size-full object-cover transition-opacity duration-300"
          />
        ) : (
          /* Graceful Fallback for Mosques without photos (matching Image 3) */
          <div className="absolute inset-0 size-full bg-gradient-to-br from-[#1c3c3a] via-[#102b2e] to-[#091b1d] flex items-center justify-center">
            {/* Ambient soft glow aura */}
            <div className="pointer-events-none absolute size-72 rounded-full bg-primary/20 blur-3xl" />

            {/* Centered Mosque Emblem Badge (matching Image 3) */}
            <div className="relative flex flex-col items-center gap-2">
              <div className="flex size-20 sm:size-24 items-center justify-center rounded-3xl bg-primary/15 text-primary-foreground border border-teal-500/30 shadow-2xl backdrop-blur-md">
                <MosqueIcon className="size-11 sm:size-13 text-teal-300" aria-hidden="true" />
              </div>
            </div>
          </div>
        )}

        {/* Dark Gradient Scrim Overlay for high-contrast legibility (matching Image 2) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />

        {/* =========================================================================
            TOP ROW: PHOTO COUNTER & MORE OPTIONS MENU (IMAGE 2)
            ========================================================================= */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          {/* Photos Counter Badge (when multiple images exist) */}
          {sortedImages.length > 1 ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md transition-all hover:bg-black/60 shadow-sm"
            >
              <Camera className="size-3.5" aria-hidden="true" />
              <span>
                {activeImageIndex + 1} / {sortedImages.length}
              </span>
              <span className="hidden sm:inline text-white/70">· View all</span>
            </button>
          ) : sortedImages.length === 1 ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md transition-all hover:bg-black/60 shadow-sm"
            >
              <Images className="size-3.5" aria-hidden="true" />
              <span>Full photo</span>
            </button>
          ) : (
            <span />
          )}

          {/* Top-Right More Menu button [ ... ] (matching Image 2) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More actions"
                className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 shadow-sm"
              >
                <MoreHorizontal className="size-5" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onSuggestEdit} className="gap-2 cursor-pointer">
                <Pencil className="size-4" />
                <span>Suggest an edit</span>
              </DropdownMenuItem>
              {onClaimMosque && (
                <DropdownMenuItem onClick={onClaimMosque} className="gap-2 cursor-pointer">
                  <ShieldCheck className="size-4" />
                  <span>Claim this mosque</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={(e) => void handleShare(e)} className="gap-2 cursor-pointer">
                <Share2 className="size-4" />
                <span>Share link</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* =========================================================================
            CAROUSEL ARROWS (WHEN MULTIPLE IMAGES EXIST)
            ========================================================================= */}
        {sortedImages.length > 1 && (
          <div className="relative z-10 flex items-center justify-between pointer-events-none px-0">
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous photo"
              className="pointer-events-auto flex size-9 sm:size-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 hover:scale-105 active:scale-95 shadow-md -ml-1 sm:ml-0"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next photo"
              className="pointer-events-auto flex size-9 sm:size-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 hover:scale-105 active:scale-95 shadow-md -mr-1 sm:mr-0"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}

        {/* =========================================================================
            BOTTOM OVERLAY: MOSQUE DETAILS & ACTION BUTTONS (IMAGE 2)
            ========================================================================= */}
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pt-4">
          {/* Left: Mosque Name, Verified Badge, Rating, Location */}
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl tracking-tight drop-shadow-sm">
                {mosque.name}
              </h1>

              {/* Verified Badge (matching Image 2) */}
              {mosque.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/25 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/40 backdrop-blur-xs shadow-xs">
                  <Check className="size-3 stroke-[2.5]" aria-hidden="true" />
                  Verified
                </span>
              )}
            </div>

            {/* Subtitle: Rating · Location */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-white/85 font-medium">
              {mosque.rating != null ? (
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <span className="font-semibold text-white">{mosque.rating.toFixed(1)}</span>
                  <span className="text-white/70">
                    ({mosque.reviewCount ?? 0} {mosque.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </span>
              ) : (
                <span className="text-white/70">No reviews yet</span>
              )}

              <span className="text-white/40">·</span>

              {locationLine && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-white/85 hover:text-white hover:underline transition-colors"
                >
                  <MapPin className="size-3.5 text-teal-300 shrink-0" aria-hidden="true" />
                  <span>{locationLine}</span>
                  <ExternalLink className="size-3 text-white/50" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Right: Action Buttons (matching Image 2) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Favorite Button (matching dark round button with vivid pink/red heart) */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={toggleFavorite.isPending}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isFavorited}
              className={cn(
                'flex size-10 sm:size-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md shadow-md transition-all hover:bg-black/60 hover:scale-105 active:scale-95 disabled:opacity-60',
                isFavorited && 'bg-black/50 shadow-lg hover:bg-black/65',
              )}
            >
              <Heart
                className={cn(
                  'size-5 transition-colors',
                  isFavorited ? 'fill-[#ff2b54] text-[#ff2b54]' : 'text-white hover:text-rose-200',
                )}
                aria-hidden="true"
              />
            </button>

            {/* Share Button (matching dark round button) */}
            <button
              type="button"
              onClick={(e) => void handleShare(e)}
              aria-label="Share mosque"
              className="flex size-10 sm:size-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md shadow-md transition-all hover:bg-black/60 hover:scale-105 active:scale-95"
            >
              <Share2 className="size-5 text-white" aria-hidden="true" />
            </button>

            {/* Directions Button (primary deep teal / emerald button) */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-10 sm:h-11 items-center gap-2 rounded-xl sm:rounded-2xl bg-[#007378] hover:bg-[#005c60] px-4 sm:px-5 text-xs sm:text-sm font-semibold text-white shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <Navigation className="size-4 fill-current" aria-hidden="true" />
              <span>Directions</span>
            </a>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FULL-SCREEN LIGHTBOX GALLERY MODAL
          ========================================================================= */}
      {sortedImages.length > 0 && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-neutral-800 text-white rounded-2xl">
            <DialogTitle className="sr-only">{mosque.name} photo gallery</DialogTitle>

            <div className="relative flex flex-col items-center justify-center min-h-[60vh] max-h-[85vh] p-4">
              {/* Active Image */}
              <img
                src={sortedImages[activeImageIndex]?.imageUrl}
                alt={`${mosque.name} photo ${activeImageIndex + 1}`}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
              />

              {/* Prev / Next controls */}
              {sortedImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </>
              )}

              {/* Thumbnail Strip at Bottom */}
              {sortedImages.length > 1 && (
                <div className="mt-4 flex items-center gap-2 overflow-x-auto p-1 max-w-full">
                  {sortedImages.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={cn(
                        'size-12 sm:size-14 rounded-lg overflow-hidden border-2 transition-all shrink-0',
                        activeImageIndex === idx
                          ? 'border-primary scale-105 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100',
                      )}
                    >
                      <img src={img.imageUrl} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
