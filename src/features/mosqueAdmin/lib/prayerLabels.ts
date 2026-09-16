/** Display labels for the prayer-config enums — same "known code -> nice
 * label, unknown code -> raw value" fallback convention as
 * `FacilityBadges`'s `FACILITY_META`, so a method/rule the backend adds
 * later still renders (just less prettily) instead of disappearing. */
export const CALCULATION_METHOD_LABELS: Record<string, string> = {
  KARACHI: 'Karachi (Univ. of Islamic Sciences)',
  ISNA: 'ISNA (North America)',
  MUSLIM_WORLD_LEAGUE: 'Muslim World League',
  UMM_AL_QURA: 'Umm al-Qura (Makkah)',
  EGYPTIAN: 'Egyptian General Authority',
  TEHRAN: 'Tehran (Institute of Geophysics)',
  GULF: 'Gulf Region',
  KUWAIT: 'Kuwait',
  QATAR: 'Qatar',
  SINGAPORE: 'Singapore (MUIS)',
  FRANCE: 'France (UOIF)',
  TURKEY: 'Turkey (Diyanet)',
  RUSSIA: 'Russia',
  CUSTOM: 'Custom angles',
}

export const JURISTIC_SCHOOL_LABELS: Record<string, string> = {
  STANDARD: 'Standard (Shafi / Maliki / Hanbali)',
  HANAFI: 'Hanafi',
}

export const IQAMAH_TYPE_LABELS: Record<string, string> = {
  OFFSET_AFTER_ADHAN: 'Minutes after Adhan',
  FIXED_TIME: 'Fixed clock time',
}

export const IQAMAH_PRAYER_LABELS = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: "Isha'",
} as const
