import { Link } from 'react-router-dom'
import { Heart, MapPin, Search, PlusCircle, ShieldCheck } from 'lucide-react'
import { MosqueIcon } from '@/components/icons/MosqueIcon'

interface FooterProps {
  variant?: 'full' | 'compact'
}

/**
 * Universal, theme-based footer for all pages in OpenMosque.
 * Rendered once within PublicLayout (full) and AppLayout (compact) for maximum reusability.
 */
export function Footer({ variant = 'full' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  if (variant === 'compact') {
    return (
      <footer className="shrink-0 border-t border-teal-900/50 bg-[#002326] text-teal-100/80 py-3.5 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded-md bg-white/10 text-teal-300">
              <MosqueIcon className="size-3.5" />
            </div>
            <span className="font-semibold text-white">OpenMosque</span>
            <span className="text-teal-400/60">·</span>
            <span>© {currentYear} Built for the community</span>
          </div>
          <div className="flex items-center gap-4 text-teal-200/80">
            <Link to="/search" className="hover:text-white transition-colors">
              Search Mosques
            </Link>
            <Link to="/nearby" className="hover:text-white transition-colors">
              Nearby
            </Link>
            <Link to="/submit-mosque" className="hover:text-white transition-colors">
              Add Mosque
            </Link>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="relative z-10 shrink-0 border-t border-teal-900/60 bg-gradient-to-b from-[#003438] via-[#002629] to-[#001719] text-white">
      {/* Subtle ambient glow aura */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-teal-500/10 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-10">
          {/* Brand Column (spans 2 cols on desktop) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="flex size-9 items-center justify-center rounded-xl bg-white/15 border border-white/20 text-white shadow-xs backdrop-blur-xs transition-transform group-hover:scale-105">
                <MosqueIcon className="size-5 text-teal-300 group-hover:text-white transition-colors" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-teal-200 transition-colors">
                OpenMosque
              </span>
            </Link>

            <p className="text-sm text-teal-100/80 leading-relaxed max-w-sm">
              A global, community-driven platform connecting Muslims to verified mosques, accurate prayer times, Friday khutbah schedules, and local facilities.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="size-3.5" />
                Community Verified
              </span>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-300">
              Explore
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-teal-100/75">
              <li>
                <Link to="/search" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Search className="size-3.5 text-teal-400/80 shrink-0" />
                  <span>Search Mosques</span>
                </Link>
              </li>
              <li>
                <Link to="/nearby" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-teal-400/80 shrink-0" />
                  <span>Nearby Mosques</span>
                </Link>
              </li>
              <li>
                <Link to="/search?q=" className="hover:text-white transition-colors">
                  Prayer Schedules
                </Link>
              </li>
              <li>
                <Link to="/search?q=" className="hover:text-white transition-colors">
                  Friday Khutbahs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Amenities */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-300">
              Amenities
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-teal-100/75">
              <li>
                <Link to="/search?facilities=WOMENS_SECTION" className="hover:text-white transition-colors">
                  Women's Section
                </Link>
              </li>
              <li>
                <Link to="/search?facilities=WHEELCHAIR_ACCESS" className="hover:text-white transition-colors">
                  Wheelchair Access
                </Link>
              </li>
              <li>
                <Link to="/search?facilities=WUDU_AREA" className="hover:text-white transition-colors">
                  Wudu Facilities
                </Link>
              </li>
              <li>
                <Link to="/search?facilities=PARKING" className="hover:text-white transition-colors">
                  On-site Parking
                </Link>
              </li>
              <li>
                <Link to="/search?facilities=JANAZAH" className="hover:text-white transition-colors">
                  Janazah Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Community */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-300">
              Community
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-teal-100/75">
              <li>
                <Link to="/submit-mosque" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <PlusCircle className="size-3.5 text-teal-400/80 shrink-0" />
                  <span>Add a Mosque</span>
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Heart className="size-3.5 text-rose-400/80 shrink-0" />
                  <span>Favorite Mosques</span>
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar Divider & Meta Links */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-teal-200/70">
          <p className="flex items-center gap-1 text-center sm:text-left">
            <span>© {currentYear} OpenMosque. Built for the Ummah, by the community.</span>
          </p>

          <div className="flex items-center gap-4 text-teal-100/70">
            <span className="hover:text-white cursor-pointer transition-colors">
              Terms of Service
            </span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Community Guidelines
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
