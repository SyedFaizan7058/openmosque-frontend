import type { SVGProps } from 'react'

interface MosqueHeroGraphicProps extends SVGProps<SVGSVGElement> {
  className?: string
}

/**
 * A handcrafted, majestic Mosque vector illustration tailored for OpenMosque.
 * Designed using the Deep Teal brand palette (#007378) with soft gradients,
 * layered architectural silhouettes (domes, soaring minarets, grand iwan portal,
 * colonnaded arcades, and crescent moon), and seamless responsive scaling.
 */
export function MosqueHeroGraphic({ className = '', ...props }: MosqueHeroGraphicProps) {
  return (
    <svg
      viewBox="0 0 1200 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYEnd meet"
      className={`w-full select-none pointer-events-none ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        {/* Sky / Ambient radial glow behind the grand dome */}
        <radialGradient
          id="om-hero-glow"
          cx="600"
          cy="150"
          r="400"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#007378" stopOpacity="0.22" />
          <stop offset="50%" stopColor="#007378" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#007378" stopOpacity="0" />
        </radialGradient>

        {/* Crescent moon soft aura */}
        <radialGradient
          id="om-moon-glow"
          cx="880"
          cy="75"
          r="80"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#20b2aa" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#20b2aa" stopOpacity="0" />
        </radialGradient>

        {/* Central Dome Gradient */}
        <linearGradient id="om-dome-grad" x1="480" y1="70" x2="720" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1bb3ba" />
          <stop offset="45%" stopColor="#007378" />
          <stop offset="100%" stopColor="#00484b" />
        </linearGradient>

        {/* Flanking Domes Gradient */}
        <linearGradient id="om-flank-dome-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14989e" />
          <stop offset="60%" stopColor="#007378" />
          <stop offset="100%" stopColor="#003e41" />
        </linearGradient>

        {/* Wall & Facade Gradient */}
        <linearGradient id="om-facade-grad" x1="600" y1="180" x2="600" y2="390" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#007378" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#00383a" stopOpacity="0.98" />
        </linearGradient>

        {/* Minaret Shaft Gradient */}
        <linearGradient id="om-minaret-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#008085" />
          <stop offset="35%" stopColor="#10989f" />
          <stop offset="70%" stopColor="#007378" />
          <stop offset="100%" stopColor="#004346" />
        </linearGradient>

        {/* Inner Arch Shade Gradient */}
        <linearGradient id="om-arch-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#002b2d" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#001819" stopOpacity="0.99" />
        </linearGradient>

        {/* Warm Golden/Amber Lantern Glow */}
        <radialGradient id="om-lantern-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde047" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#eab308" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
        </radialGradient>

        {/* Courtyard Terrace Gradient */}
        <linearGradient id="om-terrace-grad" x1="600" y1="360" x2="600" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#005d61" />
          <stop offset="60%" stopColor="#003a3c" />
          <stop offset="100%" stopColor="#002527" stopOpacity="0.9" />
        </linearGradient>

        {/* Base fade into background */}
        <linearGradient id="om-base-fade" x1="600" y1="360" x2="600" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="transparent" stopOpacity="0" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* =========================================================================
          LAYER 1: ATMOSPHERE & CELESTIAL ELEMENTS
          ========================================================================= */}
      {/* Ambient soft glow aura behind the center of the mosque */}
      <ellipse cx="600" cy="190" rx="420" ry="180" fill="url(#om-hero-glow)" />

      {/* Crescent Moon & Radiant Aura (Upper Right Sky) */}
      <circle cx="880" cy="75" r="50" fill="url(#om-moon-glow)" />
      <path
        d="M 892 56 C 876 62 866 77 868 94 C 870 110 884 122 900 122 C 906 122 912 120 916 117 C 900 118 884 107 882 91 C 880 77 888 64 892 56 Z"
        fill="#20b2aa"
        fillOpacity="0.85"
      />

      {/* Subtle twinkling stars */}
      <g fill="#20b2aa" opacity="0.6">
        {/* Star 1 */}
        <path d="M 320 60 Q 320 68 328 68 Q 320 68 320 76 Q 320 68 312 68 Q 320 68 320 60 Z" opacity="0.75" />
        {/* Star 2 */}
        <path d="M 230 110 Q 230 115 235 115 Q 230 115 230 120 Q 230 115 225 115 Q 230 115 230 110 Z" opacity="0.5" />
        {/* Star 3 */}
        <path d="M 980 90 Q 980 96 986 96 Q 980 96 980 102 Q 980 96 974 96 Q 980 96 980 90 Z" opacity="0.7" />
        {/* Star 4 */}
        <path d="M 780 50 Q 780 55 785 55 Q 780 55 780 60 Q 780 55 775 55 Q 780 55 780 50 Z" opacity="0.6" />
        {/* Star 5 */}
        <circle cx="430" cy="85" r="1.5" opacity="0.4" />
        <circle cx="680" cy="45" r="2" opacity="0.5" />
        <circle cx="1040" cy="130" r="1.5" opacity="0.4" />
        <circle cx="160" cy="140" r="1.5" opacity="0.4" />
      </g>

      {/* Distant palm tree silhouettes on far sides */}
      <g fill="#007378" opacity="0.18">
        {/* Far left palm */}
        <path d="M 70 380 Q 75 300 90 260 Q 55 245 40 265 Q 65 240 92 258 Q 80 230 100 235 Q 92 245 93 258 Q 115 235 130 250 Q 105 255 94 262 Q 120 270 125 295 Q 105 280 93 266 Q 80 300 76 380 Z" />
        {/* Far right palm */}
        <path d="M 1130 380 Q 1125 300 1110 260 Q 1145 245 1160 265 Q 1135 240 1108 258 Q 1120 230 1100 235 Q 1108 245 1107 258 Q 1085 235 1070 250 Q 1095 255 1106 262 Q 1080 270 1075 295 Q 1095 280 1107 266 Q 1120 300 1124 380 Z" />
      </g>

      {/* Distant background dome silhouettes (soft depth layer) */}
      <g fill="#007378" opacity="0.2">
        <path d="M 180 380 L 180 300 C 180 270 210 240 240 240 C 270 240 300 270 300 300 L 300 380 Z" />
        <path d="M 900 380 L 900 300 C 900 270 930 240 960 240 C 990 240 1020 270 1020 300 L 1020 380 Z" />
      </g>

      {/* =========================================================================
          LAYER 2: MAIN MOSQUE ARCHITECTURE
          ========================================================================= */}

      {/* --- REAR / FLANKING DOMES --- */}

      {/* Outer Left Small Dome (Center X = 250) */}
      <g>
        {/* Drum */}
        <rect x="220" y="275" width="60" height="25" fill="#006064" />
        {/* Drum molding */}
        <rect x="216" y="272" width="68" height="4" fill="#007c82" />
        {/* Dome */}
        <path
          d="M 220 275 C 208 255 218 220 250 185 C 282 220 292 255 280 275 Z"
          fill="url(#om-flank-dome-grad)"
        />
        {/* Dome highlight curve */}
        <path
          d="M 228 273 C 220 256 228 228 250 187 C 242 224 236 256 242 273 Z"
          fill="#18a2a8"
          opacity="0.35"
        />
        {/* Finial */}
        <line x1="250" y1="185" x2="250" y2="158" stroke="#1bb3ba" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="250" cy="172" r="3" fill="#1bb3ba" />
        <circle cx="250" cy="164" r="2" fill="#1bb3ba" />
        {/* Crescent */}
        <path d="M 252 153 C 248 155 246 159 248 163 C 251 161 254 161 256 163 C 254 158 252 156 252 153 Z" fill="#1bb3ba" />
      </g>

      {/* Outer Right Small Dome (Center X = 950) */}
      <g>
        {/* Drum */}
        <rect x="920" y="275" width="60" height="25" fill="#006064" />
        <rect x="916" y="272" width="68" height="4" fill="#007c82" />
        {/* Dome */}
        <path
          d="M 920 275 C 908 255 918 220 950 185 C 982 220 992 255 980 275 Z"
          fill="url(#om-flank-dome-grad)"
        />
        <path
          d="M 928 273 C 920 256 928 228 950 187 C 942 224 936 256 942 273 Z"
          fill="#18a2a8"
          opacity="0.35"
        />
        {/* Finial */}
        <line x1="950" y1="185" x2="950" y2="158" stroke="#1bb3ba" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="950" cy="172" r="3" fill="#1bb3ba" />
        <circle cx="950" cy="164" r="2" fill="#1bb3ba" />
        {/* Crescent */}
        <path d="M 952 153 C 948 155 946 159 948 163 C 951 161 954 161 956 163 C 954 158 952 156 952 153 Z" fill="#1bb3ba" />
      </g>

      {/* Mid Left Dome (Center X = 405) */}
      <g>
        {/* Drum */}
        <rect x="355" y="245" width="100" height="30" fill="#00575b" />
        <rect x="350" y="241" width="110" height="5" fill="#007c82" />
        {/* Drum Arched Windows */}
        <path d="M 373 268 L 373 255 C 373 250 383 250 383 255 L 383 268 Z" fill="#003538" />
        <path d="M 400 268 L 400 255 C 400 250 410 250 410 255 L 410 268 Z" fill="#003538" />
        <path d="M 427 268 L 427 255 C 427 250 437 250 437 255 L 437 268 Z" fill="#003538" />
        {/* Dome */}
        <path
          d="M 355 245 C 338 220 352 175 405 130 C 458 175 472 220 455 245 Z"
          fill="url(#om-flank-dome-grad)"
        />
        {/* Dome Ribs */}
        <path d="M 405 130 C 382 165 372 210 375 245" stroke="#1bb3ba" strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M 405 130 C 428 165 438 210 435 245" stroke="#00383b" strokeWidth="1.5" strokeOpacity="0.5" />
        {/* Finial */}
        <line x1="405" y1="130" x2="405" y2="95" stroke="#1bb3ba" strokeWidth="3" strokeLinecap="round" />
        <circle cx="405" cy="115" r="4.5" fill="#1bb3ba" />
        <circle cx="405" cy="105" r="3" fill="#1bb3ba" />
        {/* Crescent */}
        <path d="M 407 90 C 401 92 399 98 402 104 C 406 101 410 101 413 104 C 410 97 407 94 407 90 Z" fill="#1bb3ba" />
      </g>

      {/* Mid Right Dome (Center X = 795) */}
      <g>
        {/* Drum */}
        <rect x="745" y="245" width="100" height="30" fill="#00575b" />
        <rect x="740" y="241" width="110" height="5" fill="#007c82" />
        {/* Drum Arched Windows */}
        <path d="M 763 268 L 763 255 C 763 250 773 250 773 255 L 773 268 Z" fill="#003538" />
        <path d="M 790 268 L 790 255 C 790 250 800 250 800 255 L 800 268 Z" fill="#003538" />
        <path d="M 817 268 L 817 255 C 817 250 827 250 827 255 L 827 268 Z" fill="#003538" />
        {/* Dome */}
        <path
          d="M 745 245 C 728 220 742 175 795 130 C 848 175 862 220 845 245 Z"
          fill="url(#om-flank-dome-grad)"
        />
        {/* Dome Ribs */}
        <path d="M 795 130 C 772 165 762 210 765 245" stroke="#1bb3ba" strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M 795 130 C 818 165 828 210 825 245" stroke="#00383b" strokeWidth="1.5" strokeOpacity="0.5" />
        {/* Finial */}
        <line x1="795" y1="130" x2="795" y2="95" stroke="#1bb3ba" strokeWidth="3" strokeLinecap="round" />
        <circle cx="795" cy="115" r="4.5" fill="#1bb3ba" />
        <circle cx="795" cy="105" r="3" fill="#1bb3ba" />
        {/* Crescent */}
        <path d="M 797 90 C 791 92 789 98 792 104 C 796 101 800 101 803 104 C 800 97 797 94 797 90 Z" fill="#1bb3ba" />
      </g>

      {/* --- GRAND CENTRAL DOME (Center X = 600) --- */}
      <g>
        {/* Octagonal Drum Structure */}
        <path d="M 480 245 L 485 205 L 715 205 L 720 245 Z" fill="#004c50" />
        {/* Upper Cornice / Molding */}
        <rect x="475" y="200" width="250" height="7" rx="2" fill="#008085" />
        <rect x="470" y="204" width="260" height="3" fill="#10989f" opacity="0.7" />

        {/* Drum Arched Windows with warm interior light */}
        <g>
          {/* Win 1 */}
          <path d="M 505 235 L 505 218 C 505 212 517 212 517 218 L 517 235 Z" fill="#002b2d" />
          <path d="M 508 233 L 508 220 C 508 215 514 215 514 220 L 514 233 Z" fill="#fde047" opacity="0.45" />
          {/* Win 2 */}
          <path d="M 535 235 L 535 218 C 535 212 547 212 547 218 L 547 235 Z" fill="#002b2d" />
          <path d="M 538 233 L 538 220 C 538 215 544 215 544 220 L 544 233 Z" fill="#fde047" opacity="0.5" />
          {/* Win 3 (Center) */}
          <path d="M 565 235 L 565 218 C 565 212 577 212 577 218 L 577 235 Z" fill="#002b2d" />
          <path d="M 568 233 L 568 220 C 568 215 574 215 574 220 L 574 233 Z" fill="#fde047" opacity="0.65" />
          {/* Win 4 */}
          <path d="M 595 235 L 595 218 C 595 212 607 212 607 218 L 607 235 Z" fill="#002b2d" />
          <path d="M 598 233 L 598 220 C 598 215 604 215 604 220 L 604 233 Z" fill="#fde047" opacity="0.65" />
          {/* Win 5 */}
          <path d="M 625 235 L 625 218 C 625 212 637 212 637 218 L 637 235 Z" fill="#002b2d" />
          <path d="M 628 233 L 628 220 C 628 215 634 215 634 220 L 634 233 Z" fill="#fde047" opacity="0.6" />
          {/* Win 6 */}
          <path d="M 655 235 L 655 218 C 655 212 667 212 667 218 L 667 235 Z" fill="#002b2d" />
          <path d="M 658 233 L 658 220 C 658 215 664 215 664 220 L 664 233 Z" fill="#fde047" opacity="0.5" />
          {/* Win 7 */}
          <path d="M 685 235 L 685 218 C 685 212 697 212 697 218 L 697 235 Z" fill="#002b2d" />
          <path d="M 688 233 L 688 220 C 688 215 694 215 694 220 L 694 233 Z" fill="#fde047" opacity="0.45" />
        </g>

        {/* Majestic Grand Dome Shape (Classical Ogee Onion Curve) */}
        <path
          d="M 485 202 C 460 168 495 105 600 52 C 705 105 740 168 715 202 Z"
          fill="url(#om-dome-grad)"
        />

        {/* Dome Shading & Rib Meridians (3D Volumetric Depth) */}
        {/* Left specular highlight */}
        <path
          d="M 495 200 C 475 170 505 115 600 53 C 555 95 520 155 530 200 Z"
          fill="#20b2aa"
          opacity="0.3"
        />
        {/* Right cast shadow */}
        <path
          d="M 705 200 C 725 170 695 115 600 53 C 645 95 680 155 670 200 Z"
          fill="#002b2d"
          opacity="0.45"
        />

        {/* Elegant Rib Lines */}
        <path d="M 600 52 L 600 200" stroke="#1bb3ba" strokeWidth="1.8" strokeOpacity="0.4" />
        <path d="M 600 52 C 570 95 550 155 555 201" stroke="#20b2aa" strokeWidth="1.5" strokeOpacity="0.5" />
        <path d="M 600 52 C 630 95 650 155 645 201" stroke="#003538" strokeWidth="1.5" strokeOpacity="0.6" />
        <path d="M 600 52 C 540 105 515 160 520 201" stroke="#20b2aa" strokeWidth="1.2" strokeOpacity="0.35" />
        <path d="M 600 52 C 660 105 685 160 680 201" stroke="#003033" strokeWidth="1.2" strokeOpacity="0.5" />

        {/* Grand Crescent Finial (Alam / Hilal) */}
        <line x1="600" y1="52" x2="600" y2="12" stroke="#20b2aa" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="600" cy="38" r="6" fill="#20b2aa" />
        <circle cx="600" cy="27" r="4.5" fill="#20b2aa" />
        <circle cx="600" cy="18" r="3" fill="#20b2aa" />
        {/* Majestic Upright Crescent Moon */}
        <path
          d="M 603 5 C 594 7 590 16 595 24 C 600 20 606 20 611 24 C 606 14 602 10 603 5 Z"
          fill="#20b2aa"
        />
        {/* Tiny star inside or beside crescent */}
        <circle cx="606" cy="14" r="1.5" fill="#fde047" />
      </g>

      {/* --- COLONNADES & WINGS (Left & Right Arcades) --- */}

      {/* Left Colonnade Building Wing */}
      <g>
        <rect x="150" y="270" width="360" height="110" fill="url(#om-facade-grad)" />
        {/* Parapet Crenellations (Stepped Islamic Merlons) */}
        <path
          d="M 150 270 L 150 263 L 158 263 L 158 270 L 166 270 L 166 263 L 174 263 L 174 270 L 182 270 L 182 263 L 190 263 L 190 270 L 198 270 L 198 263 L 206 263 L 206 270 L 214 270 L 214 263 L 222 263 L 222 270 L 230 270 L 230 263 L 238 263 L 238 270 L 246 270 L 246 263 L 254 263 L 254 270 L 262 270 L 262 263 L 270 263 L 270 270 L 278 270 L 278 263 L 286 263 L 286 270 L 294 270 L 294 263 L 302 263 L 302 270 L 310 270 L 310 263 L 318 263 L 318 270 L 326 270 L 326 263 L 334 263 L 334 270 L 342 270 L 342 263 L 350 263 L 350 270 L 358 270 L 358 263 L 366 263 L 366 270 L 374 270 L 374 263 L 382 263 L 382 270 L 390 270 L 390 263 L 398 263 L 398 270 L 406 270 L 406 263 L 414 263 L 414 270 L 422 270 L 422 263 L 430 263 L 430 270 L 438 270 L 438 263 L 446 263 L 446 270 L 454 270 L 454 263 L 462 263 L 462 270 L 470 270 L 470 263 L 478 263 L 478 270 L 486 270 L 486 263 L 494 263 L 494 270 L 502 270 L 502 263 L 510 263 L 510 270 Z"
          fill="#008085"
        />
        {/* Cornice Molding */}
        <rect x="150" y="270" width="360" height="5" fill="#14989e" opacity="0.6" />

        {/* 6 Pointed/Horseshoe Gallery Arches */}
        {[175, 230, 285, 340, 395, 450].map((archX) => (
          <g key={`l-arch-${archX}`}>
            {/* Outer Arch Relief */}
            <path
              d={`M ${archX} 370 L ${archX} 310 C ${archX} 290, ${archX + 22} 280, ${archX + 22} 280 C ${archX + 22} 280, ${archX + 44} 290, ${archX + 44} 310 L ${archX + 44} 370 Z`}
              fill="#002b2d"
            />
            {/* Inner Backlight glow */}
            <path
              d={`M ${archX + 4} 370 L ${archX + 4} 312 C ${archX + 4} 295, ${archX + 22} 286, ${archX + 22} 286 C ${archX + 22} 286, ${archX + 40} 295, ${archX + 40} 312 L ${archX + 40} 370 Z`}
              fill="#001d1f"
            />
            {/* Jali Lattice Screen Pattern inside upper arch */}
            <circle cx={archX + 22} cy={305} r={7} stroke="#007378" strokeWidth="1" fill="none" opacity="0.5" />
            <path
              d={`M ${archX + 15} 305 L ${archX + 29} 305 M ${archX + 22} 298 L ${archX + 22} 312`}
              stroke="#007378"
              strokeWidth="1"
              opacity="0.5"
            />
            {/* Arch Framing Stroke */}
            <path
              d={`M ${archX - 2} 370 L ${archX - 2} 308 C ${archX - 2} 286, ${archX + 22} 276, ${archX + 22} 276 C ${archX + 22} 276, ${archX + 46} 286, ${archX + 46} 308 L ${archX + 46} 370`}
              stroke="#008a90"
              strokeWidth="2"
              fill="none"
            />
          </g>
        ))}
      </g>

      {/* Right Colonnade Building Wing */}
      <g>
        <rect x="690" y="270" width="360" height="110" fill="url(#om-facade-grad)" />
        {/* Parapet Crenellations */}
        <path
          d="M 690 270 L 690 263 L 698 263 L 698 270 L 706 270 L 706 263 L 714 263 L 714 270 L 722 270 L 722 263 L 730 263 L 730 270 L 738 270 L 738 263 L 746 263 L 746 270 L 754 270 L 754 263 L 762 263 L 762 270 L 770 270 L 770 263 L 778 263 L 778 270 L 786 270 L 786 263 L 794 263 L 794 270 L 802 270 L 802 263 L 810 263 L 810 270 L 818 270 L 818 263 L 826 263 L 826 270 L 834 270 L 834 263 L 842 263 L 842 270 L 850 270 L 850 263 L 858 263 L 858 270 L 866 270 L 866 263 L 874 263 L 874 270 L 882 270 L 882 263 L 890 263 L 890 270 L 898 270 L 898 263 L 906 263 L 906 270 L 914 270 L 914 263 L 922 263 L 922 270 L 930 270 L 930 263 L 938 263 L 938 270 L 946 270 L 946 263 L 954 263 L 954 270 L 962 270 L 962 263 L 970 263 L 970 270 L 978 270 L 978 263 L 986 263 L 986 270 L 994 270 L 994 263 L 1002 263 L 1002 270 L 1010 270 L 1010 263 L 1018 263 L 1018 270 L 1026 270 L 1026 263 L 1034 263 L 1034 270 L 1042 270 L 1042 263 L 1050 263 L 1050 270 Z"
          fill="#008085"
        />
        {/* Cornice Molding */}
        <rect x="690" y="270" width="360" height="5" fill="#14989e" opacity="0.6" />

        {/* 6 Pointed/Horseshoe Gallery Arches */}
        {[705, 760, 815, 870, 925, 980].map((archX) => (
          <g key={`r-arch-${archX}`}>
            {/* Outer Arch Relief */}
            <path
              d={`M ${archX} 370 L ${archX} 310 C ${archX} 290, ${archX + 22} 280, ${archX + 22} 280 C ${archX + 22} 280, ${archX + 44} 290, ${archX + 44} 310 L ${archX + 44} 370 Z`}
              fill="#002b2d"
            />
            {/* Inner Backlight glow */}
            <path
              d={`M ${archX + 4} 370 L ${archX + 4} 312 C ${archX + 4} 295, ${archX + 22} 286, ${archX + 22} 286 C ${archX + 22} 286, ${archX + 40} 295, ${archX + 40} 312 L ${archX + 40} 370 Z`}
              fill="#001d1f"
            />
            {/* Jali Lattice Screen Pattern inside upper arch */}
            <circle cx={archX + 22} cy={305} r={7} stroke="#007378" strokeWidth="1" fill="none" opacity="0.5" />
            <path
              d={`M ${archX + 15} 305 L ${archX + 29} 305 M ${archX + 22} 298 L ${archX + 22} 312`}
              stroke="#007378"
              strokeWidth="1"
              opacity="0.5"
            />
            {/* Arch Framing Stroke */}
            <path
              d={`M ${archX - 2} 370 L ${archX - 2} 308 C ${archX - 2} 286, ${archX + 22} 276, ${archX + 22} 276 C ${archX + 22} 276, ${archX + 46} 286, ${archX + 46} 308 L ${archX + 46} 370`}
              stroke="#008a90"
              strokeWidth="2"
              fill="none"
            />
          </g>
        ))}
      </g>

      {/* --- MONUMENTAL CENTRAL PORTAL (PISHTAQ & GRAND IWAN) --- */}
      <g>
        {/* Elevated Monumental Rectangular Pishtaq */}
        <path d="M 510 380 L 510 235 L 690 235 L 690 380 Z" fill="#005256" />

        {/* Decorative Top Cresting / Parapet */}
        <rect x="506" y="230" width="188" height="6" rx="2" fill="#008b92" />
        <rect x="510" y="236" width="180" height="3" fill="#14989e" opacity="0.6" />

        {/* Outer Inlaid Inscription / Geometric Band Frame */}
        <rect x="522" y="246" width="156" height="134" stroke="#008085" strokeWidth="2.5" fill="none" />
        <rect x="526" y="250" width="148" height="130" stroke="#009ea6" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.6" />

        {/* Grand Iwan Vault Arch (Outer Pointed Arch) */}
        <path
          d="M 534 380 L 534 290 C 534 252, 570 248, 600 244 C 630 248, 666 252, 666 290 L 666 380 Z"
          fill="url(#om-arch-inner)"
        />
        <path
          d="M 534 380 L 534 290 C 534 252, 570 248, 600 244 C 630 248, 666 252, 666 290 L 666 380"
          stroke="#10989f"
          strokeWidth="3.5"
          fill="none"
        />

        {/* Intermediate Recessed Arch (Muqarnas Effect) */}
        <path
          d="M 548 380 L 548 302 C 548 272, 575 268, 600 264 C 625 268, 652 272, 652 302 L 652 380 Z"
          fill="#001416"
        />
        <path
          d="M 548 380 L 548 302 C 548 272, 575 268, 600 264 C 625 268, 652 272, 652 302 L 652 380"
          stroke="#007378"
          strokeWidth="2"
          fill="none"
        />

        {/* Muqarnas Geometric Stepped Brackets (Decorative Vaulting) */}
        <path d="M 570 276 L 600 286 L 630 276" stroke="#20b2aa" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M 580 286 L 600 294 L 620 286" stroke="#20b2aa" strokeWidth="1.2" fill="none" opacity="0.6" />
        <circle cx="600" cy="272" r="3" fill="#20b2aa" opacity="0.8" />

        {/* Carved Double-Leaf Wooden Doors */}
        <g>
          {/* Outer door frame */}
          <path
            d="M 565 380 L 565 325 C 565 308, 582 302, 600 300 C 618 302, 635 308, 635 325 L 635 380 Z"
            fill="#002224"
            stroke="#1bb3ba"
            strokeWidth="1.5"
          />
          {/* Center Door Seam */}
          <line x1="600" y1="300" x2="600" y2="380" stroke="#007378" strokeWidth="1.5" />

          {/* Left Door Carved Panels */}
          <rect x="571" y="328" width="23" height="22" stroke="#20b2aa" strokeWidth="1" fill="#001c1e" opacity="0.7" />
          <rect x="571" y="354" width="23" height="24" stroke="#20b2aa" strokeWidth="1" fill="#001c1e" opacity="0.7" />
          <circle cx="582" cy="339" r="4" stroke="#fde047" strokeWidth="0.8" fill="none" opacity="0.6" />
          {/* Left Door Brass Ring */}
          <circle cx="592" cy="350" r="1.5" fill="#fde047" />

          {/* Right Door Carved Panels */}
          <rect x="606" y="328" width="23" height="22" stroke="#20b2aa" strokeWidth="1" fill="#001c1e" opacity="0.7" />
          <rect x="606" y="354" width="23" height="24" stroke="#20b2aa" strokeWidth="1" fill="#001c1e" opacity="0.7" />
          <circle cx="618" cy="339" r="4" stroke="#fde047" strokeWidth="0.8" fill="none" opacity="0.6" />
          {/* Right Door Brass Ring */}
          <circle cx="608" cy="350" r="1.5" fill="#fde047" />

          {/* Warm Welcoming Ambient Threshold Light */}
          <ellipse cx="600" cy="380" rx="35" ry="8" fill="url(#om-lantern-glow)" opacity="0.5" />
        </g>
      </g>

      {/* --- FOUR SOARING MINARETS --- */}

      {/* 1. Far Left Minaret (Center X = 130) */}
      <g key="minaret-far-left">
        {/* Base Pedestal */}
        <rect x="110" y="340" width="40" height="40" fill="#004346" />
        <rect x="107" y="336" width="46" height="5" fill="#00666a" />
        {/* Lower Octagonal Shaft */}
        <rect x="115" y="220" width="30" height="116" fill="url(#om-minaret-grad)" />
        {/* Vertical Shaft Fluting */}
        <line x1="125" y1="220" x2="125" y2="336" stroke="#1bb3ba" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="135" y1="220" x2="135" y2="336" stroke="#002d2f" strokeWidth="1" strokeOpacity="0.6" />
        {/* 1st Muezzin Balcony (Corbelled Gallery) */}
        <path d="M 105 220 L 115 225 L 145 225 L 155 220 L 155 210 L 105 210 Z" fill="#008085" />
        {/* Balustrade lattice */}
        <rect x="106" y="210" width="48" height="6" fill="#14989e" />
        <line x1="106" y1="216" x2="154" y2="216" stroke="#003538" strokeWidth="1" />
        {/* Mid Shaft */}
        <rect x="118" y="135" width="24" height="75" fill="url(#om-minaret-grad)" />
        {/* Mid Arched Window Niche */}
        <path d="M 126 175 L 126 160 C 126 155 134 155 134 160 L 134 175 Z" fill="#002527" />
        <circle cx="130" cy="165" r="1.5" fill="#fde047" opacity="0.7" />
        {/* 2nd Balcony */}
        <path d="M 111 135 L 118 139 L 142 139 L 149 135 L 149 127 L 111 127 Z" fill="#008085" />
        <rect x="112" y="127" width="36" height="5" fill="#14989e" />
        {/* Open Pavilion / Lantern Colonnade */}
        <rect x="120" y="85" width="20" height="42" fill="#003235" />
        {/* Lantern Arches (Sky visible through) */}
        <path d="M 122 125 L 122 100 C 122 93 128 93 128 100 L 128 125 Z" fill="#001819" />
        <path d="M 132 125 L 132 100 C 132 93 138 93 138 100 L 138 125 Z" fill="#001819" />
        {/* Conical Spire */}
        <path d="M 115 85 L 130 35 L 145 85 Z" fill="url(#om-flank-dome-grad)" />
        {/* High Spire & Crescent Finial */}
        <line x1="130" y1="35" x2="130" y2="8" stroke="#20b2aa" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="130" cy="24" r="3.5" fill="#20b2aa" />
        <circle cx="130" cy="16" r="2.5" fill="#20b2aa" />
        {/* Crescent */}
        <path d="M 132 5 C 127 7 125 12 128 17 C 131 14 135 14 137 17 C 134 11 132 8 132 5 Z" fill="#20b2aa" />
      </g>

      {/* 2. Inner Left Minaret (Center X = 325) */}
      <g key="minaret-inner-left">
        <rect x="307" y="340" width="36" height="40" fill="#004346" />
        <rect x="304" y="336" width="42" height="5" fill="#00666a" />
        <rect x="312" y="200" width="26" height="136" fill="url(#om-minaret-grad)" />
        <line x1="320" y1="200" x2="320" y2="336" stroke="#1bb3ba" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="330" y1="200" x2="330" y2="336" stroke="#002d2f" strokeWidth="1" strokeOpacity="0.6" />
        {/* 1st Balcony */}
        <path d="M 303 200 L 312 205 L 338 205 L 347 200 L 347 192 L 303 192 Z" fill="#008085" />
        <rect x="304" y="192" width="42" height="5" fill="#14989e" />
        {/* Mid Shaft */}
        <rect x="314" y="125" width="22" height="67" fill="url(#om-minaret-grad)" />
        <path d="M 321 160 L 321 148 C 321 144 329 144 329 148 L 329 160 Z" fill="#002527" />
        {/* 2nd Balcony */}
        <path d="M 307 125 L 314 129 L 336 129 L 343 125 L 343 118 L 307 118 Z" fill="#008085" />
        <rect x="308" y="118" width="34" height="4" fill="#14989e" />
        {/* Lantern */}
        <rect x="316" y="80" width="18" height="38" fill="#003235" />
        <path d="M 319 116 L 319 94 C 319 88 331 88 331 94 L 331 116 Z" fill="#001819" />
        {/* Spire */}
        <path d="M 312 80 L 325 32 L 338 80 Z" fill="url(#om-flank-dome-grad)" />
        <line x1="325" y1="32" x2="325" y2="6" stroke="#20b2aa" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="325" cy="22" r="3.5" fill="#20b2aa" />
        <circle cx="325" cy="14" r="2.5" fill="#20b2aa" />
        <path d="M 327 3 C 322 5 320 10 323 15 C 326 12 330 12 332 15 C 329 9 327 6 327 3 Z" fill="#20b2aa" />
      </g>

      {/* 3. Inner Right Minaret (Center X = 875) */}
      <g key="minaret-inner-right">
        <rect x="857" y="340" width="36" height="40" fill="#004346" />
        <rect x="854" y="336" width="42" height="5" fill="#00666a" />
        <rect x="862" y="200" width="26" height="136" fill="url(#om-minaret-grad)" />
        <line x1="870" y1="200" x2="870" y2="336" stroke="#1bb3ba" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="880" y1="200" x2="880" y2="336" stroke="#002d2f" strokeWidth="1" strokeOpacity="0.6" />
        {/* 1st Balcony */}
        <path d="M 853 200 L 862 205 L 888 205 L 897 200 L 897 192 L 853 192 Z" fill="#008085" />
        <rect x="854" y="192" width="42" height="5" fill="#14989e" />
        {/* Mid Shaft */}
        <rect x="864" y="125" width="22" height="67" fill="url(#om-minaret-grad)" />
        <path d="M 871 160 L 871 148 C 871 144 879 144 879 148 L 879 160 Z" fill="#002527" />
        {/* 2nd Balcony */}
        <path d="M 857 125 L 864 129 L 886 129 L 893 125 L 893 118 L 857 118 Z" fill="#008085" />
        <rect x="858" y="118" width="34" height="4" fill="#14989e" />
        {/* Lantern */}
        <rect x="866" y="80" width="18" height="38" fill="#003235" />
        <path d="M 869 116 L 869 94 C 869 88 881 88 881 94 L 881 116 Z" fill="#001819" />
        {/* Spire */}
        <path d="M 862 80 L 875 32 L 888 80 Z" fill="url(#om-flank-dome-grad)" />
        <line x1="875" y1="32" x2="875" y2="6" stroke="#20b2aa" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="875" cy="22" r="3.5" fill="#20b2aa" />
        <circle cx="875" cy="14" r="2.5" fill="#20b2aa" />
        <path d="M 877 3 C 872 5 870 10 873 15 C 876 12 880 12 882 15 C 879 9 877 6 877 3 Z" fill="#20b2aa" />
      </g>

      {/* 4. Far Right Minaret (Center X = 1070) */}
      <g key="minaret-far-right">
        <rect x="1050" y="340" width="40" height="40" fill="#004346" />
        <rect x="1047" y="336" width="46" height="5" fill="#00666a" />
        <rect x="1055" y="220" width="30" height="116" fill="url(#om-minaret-grad)" />
        <line x1="1065" y1="220" x2="1065" y2="336" stroke="#1bb3ba" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="1075" y1="220" x2="1075" y2="336" stroke="#002d2f" strokeWidth="1" strokeOpacity="0.6" />
        {/* 1st Balcony */}
        <path d="M 1045 220 L 1055 225 L 1085 225 L 1095 220 L 1095 210 L 1045 210 Z" fill="#008085" />
        <rect x="1046" y="210" width="48" height="6" fill="#14989e" />
        <line x1="1046" y1="216" x2="1094" y2="216" stroke="#003538" strokeWidth="1" />
        {/* Mid Shaft */}
        <rect x="1058" y="135" width="24" height="75" fill="url(#om-minaret-grad)" />
        <path d="M 1066 175 L 1066 160 C 1066 155 1074 155 1074 160 L 1074 175 Z" fill="#002527" />
        <circle cx="1070" cy="165" r="1.5" fill="#fde047" opacity="0.7" />
        {/* 2nd Balcony */}
        <path d="M 1051 135 L 1058 139 L 1082 139 L 1089 135 L 1089 127 L 1051 127 Z" fill="#008085" />
        <rect x="1052" y="127" width="36" height="5" fill="#14989e" />
        {/* Lantern */}
        <rect x="1060" y="85" width="20" height="42" fill="#003235" />
        <path d="M 1062 125 L 1062 100 C 1062 93 1068 93 1068 100 L 1068 125 Z" fill="#001819" />
        <path d="M 1072 125 L 1072 100 C 1072 93 1078 93 1078 100 L 1078 125 Z" fill="#001819" />
        {/* Spire */}
        <path d="M 1055 85 L 1070 35 L 1085 85 Z" fill="url(#om-flank-dome-grad)" />
        <line x1="1070" y1="35" x2="1070" y2="8" stroke="#20b2aa" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="1070" cy="24" r="3.5" fill="#20b2aa" />
        <circle cx="1070" cy="16" r="2.5" fill="#20b2aa" />
        {/* Crescent */}
        <path d="M 1072 5 C 1067 7 1065 12 1068 17 C 1071 14 1075 14 1077 17 C 1074 11 1072 8 1072 5 Z" fill="#20b2aa" />
      </g>

      {/* =========================================================================
          LAYER 3: FOREGROUND COURTYARD TERRACE & STEPS
          ========================================================================= */}
      {/* Stone Courtyard Terrace Base */}
      <rect x="60" y="375" width="1080" height="25" fill="url(#om-terrace-grad)" />
      <rect x="50" y="370" width="1100" height="5" rx="1" fill="#10858b" />

      {/* Grand Central Marble Steps leading up to the mosque */}
      <g>
        {/* Step 1 (Top) */}
        <rect x="460" y="375" width="280" height="5" fill="#007378" />
        {/* Step 2 */}
        <rect x="440" y="380" width="320" height="6" fill="#005d61" />
        {/* Step 3 */}
        <rect x="415" y="386" width="370" height="7" fill="#004a4e" />
        {/* Step 4 (Bottom) */}
        <rect x="390" y="393" width="420" height="8" fill="#003b3e" />
      </g>

      {/* Courtyard Symmetrical Ornamental Lanterns */}
      {/* Left Lantern Post */}
      <g>
        <rect x="424" y="362" width="6" height="13" fill="#002d2f" />
        <path d="M 420 362 L 427 352 L 434 362 Z" fill="#007378" />
        <circle cx="427" cy="358" r="4" fill="url(#om-lantern-glow)" />
      </g>
      {/* Right Lantern Post */}
      <g>
        <rect x="770" y="362" width="6" height="13" fill="#002d2f" />
        <path d="M 766 362 L 773 352 L 780 362 Z" fill="#007378" />
        <circle cx="773" cy="358" r="4" fill="url(#om-lantern-glow)" />
      </g>

      {/* Base Fade gradient overlay ensuring soft blend into the page */}
      <rect x="0" y="390" width="1200" height="30" fill="url(#om-base-fade)" />
    </svg>
  )
}
