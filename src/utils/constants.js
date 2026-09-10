// Constants for the OpenMosque application

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const ROUTES = {
  HOME: '/',
  DIRECTORY: '/mosques',
  MOSQUE_DETAIL: '/mosques/:id',
  ADD_MOSQUE: '/mosques/add',
  SUGGEST_EDIT: '/mosques/:id/edit',
  CLAIM_MOSQUE: '/mosques/:id/claim',
  FAVORITES: '/favorites',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN_DASHBOARD: '/admin',
  MODERATOR_DASHBOARD: '/moderator',
  ABOUT: '/about',
  CONTACT: '/contact',
  EVENTS: '/events',
  ANNOUNCEMENTS: '/announcements',
  JUMAH: '/jumah',
  PRIVACY: '/privacy',
  TERMS: '/terms',
};

export const FACILITIES = [
  { id: 'WUDU_AREA', label: 'Wudu Area', icon: 'Droplets', description: 'Dedicated ablution facilities' },
  { id: 'WOMENS_SECTION', label: "Women's Section", icon: 'Users', description: 'Dedicated hall with separate entrance' },
  { id: 'WHEELCHAIR_ACCESSIBILITY', label: 'Wheelchair Accessible', icon: 'Accessibility', description: 'Ramps, elevators, and accessible prayer area' },
  { id: 'PARKING', label: 'Parking', icon: 'Car', description: 'On-site or adjacent parking lot' },
  { id: 'LIBRARY', label: 'Library', icon: 'BookOpen', description: 'Collection of Islamic books & study space' },
  { id: 'AIR_CONDITIONING', label: 'Air Conditioning', icon: 'Wind', description: 'Climate-controlled prayer hall' },
  { id: 'DAILY_HALAQAH', label: 'Daily Halaqah', icon: 'School', description: 'Daily lectures and study circles' },
  { id: 'QURAN_CLASSES', label: 'Quran Classes', icon: 'BookOpen', description: 'Tajweed and Hifz classes for all ages' },
  { id: 'YOUTH_PROGRAMS', label: 'Youth Programs', icon: 'GraduationCap', description: 'Youth club and sports mentorship' },
  { id: 'COMMUNITY_HALL', label: 'Community Hall', icon: 'Building', description: 'Multi-purpose hall for events' },
  { id: 'JANAZAH_SERVICES', label: 'Janazah Services', icon: 'HeartHandshake', description: 'Funeral washing & preparation' },
];

export const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Jumuah'];

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe' },
];

export const MOSQUE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ACTIVE: 'ACTIVE',
};

export const ROLES = {
  USER: 'USER',
  CONTRIBUTOR: 'CONTRIBUTOR',
  MOSQUE_ADMIN: 'MOSQUE_ADMIN',
  MODERATOR: 'MODERATOR',
  SUPER_ADMIN: 'SUPER_ADMIN',
};
