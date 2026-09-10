import { Megaphone, Bell, Calendar, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Ramadan 1448 AH Taraweeh Schedule & Khatm Al-Quran',
    category: 'Seasonal',
    date: 'Updated Recently',
    content: 'Participating mosques have updated their Taraweeh schedules. 20 Raka’at congregation followed by Witr prayer will begin 15 minutes after Isha Iqamah. Khatm Al-Quran dates are published on individual mosque profile pages.',
    badge: 'Important',
  },
  {
    id: 2,
    title: 'Eid Al-Fitr Prayer Timings & Outdoor Congregation Locations',
    category: 'Congregation',
    date: 'Seasonal Guide',
    content: 'Multiple prayer shifts will be hosted to accommodate all worshippers. Please arrive early, use designated park-and-ride facilities, and bring your own prayer mat for outdoor sports park congregations.',
    badge: 'Featured',
  },
  {
    id: 3,
    title: 'New PostGIS Geospatial Radius Filter Activated on OpenMosque',
    category: 'Platform Update',
    date: 'Platform Notice',
    content: 'Worshippers can now discover nearby mosques within a customized GPS radius (5km to 50km) with live distance indicators and driving directions directly connected to Google Maps.',
    badge: 'Update',
  },
  {
    id: 4,
    title: 'Mosque Administration & Claim Verification Portal Open',
    category: 'Mosque Committee',
    date: 'Notice',
    content: 'Trustees and Imams can claim their mosque profiles to configure daily Iqamah offsets, emergency closure notices, and Friday Jumu’ah batch times directly through the verified dashboard.',
    badge: 'Administration',
  },
];

export default function Announcements() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto">
          <Megaphone size={24} />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Community Announcements
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Stay informed with holiday schedules, platform enhancements, and important alerts from local mosques.
        </p>
      </div>

      <div className="space-y-6">
        {ANNOUNCEMENTS.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300">
                {item.badge}
              </span>
              <span className="text-xs text-gray-400">{item.date}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
