import type { SVGProps } from 'react'

interface MosqueIconProps extends SVGProps<SVGSVGElement> {
  className?: string
}

/**
 * An architectural vector Mosque icon designed for OpenMosque.
 * Features dual minarets with balconies and spires, a grand ogee dome
 * with crescent finial, and a classic pointed mihrab arch portal.
 */
export function MosqueIcon({ className = '', ...props }: MosqueIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Central Dome Spire & Crescent Finial */}
      <path d="M12 5V2.5" />
      <path
        d="M12 1.5a1.4 1.4 0 0 0 1.2 1.4c.2 0 .4-.05.5-.15a1.4 1.4 0 1 1-1.7-1.25z"
        fill="currentColor"
        stroke="none"
      />

      {/* Central Ogee Dome */}
      <path d="M6.5 12.5c0-4 3-7 5.5-7.5 2.5.5 5.5 3.5 5.5 7.5" />

      {/* Dome Drum Windows */}
      <circle cx="12" cy="9.5" r="0.8" fill="currentColor" />

      {/* Main Building Facade */}
      <path d="M6.5 12.5h11V22h-11z" />

      {/* Grand Pointed Arch Portal (Mihrab / Iwan) */}
      <path d="M9.5 22v-4.5c0-1.8 1.5-2.8 2.5-3.2 1 .4 2.5 1.4 2.5 3.2V22" />

      {/* Left Minaret */}
      <path d="M2.5 7.5L4 4.2l1.5 3.3" />
      <path d="M4 4.2V2.8" />
      <path d="M2 10.5h4" />
      <path d="M2.5 7.5V22" />
      <path d="M5.5 7.5V22" />

      {/* Right Minaret */}
      <path d="M18.5 7.5L20 4.2l1.5 3.3" />
      <path d="M20 4.2V2.8" />
      <path d="M18 10.5h4" />
      <path d="M18.5 7.5V22" />
      <path d="M21.5 7.5V22" />

      {/* Ground Terrace Baseline */}
      <path d="M1 22h22" />
    </svg>
  )
}
