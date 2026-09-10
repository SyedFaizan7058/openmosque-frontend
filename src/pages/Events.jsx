import { Calendar, Clock, MapPin, Users, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const UPCOMING_EVENTS = [
  {
    id: 1,
    title: 'Weekly Community Tafsir Circle',
    mosque: 'East London Mosque & London Muslim Centre',
    city: 'London',
    date: 'Every Saturday',
    time: 'After Maghrib (19:45)',
    category: 'Education',
    speaker: 'Sheikh Abdul Qadir',
    description: 'A structured verse-by-verse exploration of Surah Al-Kahf with reflection and practical life applications.',
  },
  {
    id: 2,
    title: 'Youth Leadership & Mentorship Halaqah',
    mosque: 'Islamic Cultural Center of New York',
    city: 'New York',
    date: 'Sundays',
    time: '14:00 - 16:00',
    category: 'Youth',
    speaker: 'Ustadh Zayd Tariq',
    description: 'Empowering high school and university students with moral grounding, professional networking, and teamwork skills.',
  },
  {
    id: 3,
    title: 'Annual Community Quran Competition',
    mosque: 'Masjid Toronto Downtown',
    city: 'Toronto',
    date: 'October 15, 2026',
    time: '10:00 AM - 4:00 PM',
    category: 'Competition',
    speaker: 'Panel of Certified Huffaz',
    description: 'Youth recitation categories for Juz Amma, 5 Juz, and Full Quran with certificates and prizes for participants.',
  },
  {
    id: 4,
    title: 'Sisters Halaqah & Family Tea',
    mosque: 'Birmingham Central Mosque',
    city: 'Birmingham',
    date: 'First Saturday of every month',
    time: '11:00 AM',
    category: 'Sisters',
    speaker: 'Ustadha Fatima Al-Husseini',
    description: 'A welcoming space for sisters of all ages featuring inspirational talks, Q&A, and community tea.',
  },
];

export default function Events() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Community Events & Lectures
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Discover Quran study circles, youth workshops, and family gatherings happening at local mosques.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {UPCOMING_EVENTS.map((event) => (
          <div
            key={event.id}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:border-primary-400 transition-colors flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300">
                  {event.category}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={13} /> {event.date}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                {event.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {event.description}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-primary-500" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-primary-500" />
                <span className="truncate">{event.mosque} ({event.city})</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-primary-500" />
                <span>Instructor: {event.speaker}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
