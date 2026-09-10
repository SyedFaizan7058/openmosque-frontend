import { Link } from 'react-router-dom';
import { Clock, Users, BookOpen, CheckCircle2, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function Jumah() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Friday Jumu&apos;ah Prayer Guide &amp; Batches
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
          Detailed schedules for Friday sermons (Khutbah), multi-batch timings, languages, and sunnah etiquettes across verified mosques.
        </p>
      </div>

      {/* Typical Multi-Batch Timetable Guide */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="text-primary-500" size={24} />
          Standard Friday Batch Schedules
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Due to high attendance, many metropolitan mosques host two to three congregational shifts:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-primary-50/50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/50 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">1st Congregation</span>
            <h4 className="text-xl font-extrabold text-gray-900 dark:text-white">12:30 PM - 1:15 PM</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">Khutbah in Arabic &amp; English. Ideal for local residents and early attendees.</p>
          </div>

          <div className="p-5 rounded-2xl bg-primary-50/50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/50 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">2nd Congregation</span>
            <h4 className="text-xl font-extrabold text-gray-900 dark:text-white">1:30 PM - 2:15 PM</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">Main congregation for working professionals and university students.</p>
          </div>

          <div className="p-5 rounded-2xl bg-primary-50/50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/50 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">3rd Congregation (Select Mosques)</span>
            <h4 className="text-xl font-extrabold text-gray-900 dark:text-white">2:30 PM - 3:00 PM</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">Express congregation accommodating late-shift workers.</p>
          </div>
        </div>
      </div>

      {/* Friday Sunnah Etiquettes */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="text-primary-500" size={24} />
          Sunnah Etiquettes of Friday (Yawm al-Jumu&apos;ah)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40">
            <CheckCircle2 size={18} className="text-primary-500 shrink-0 mt-0.5" />
            <span><strong>Ghusl (Bath):</strong> Purify oneself before arriving at the mosque.</span>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40">
            <CheckCircle2 size={18} className="text-primary-500 shrink-0 mt-0.5" />
            <span><strong>Clean Attire &amp; Perfume:</strong> Wear one&apos;s best clean clothes and non-alcoholic fragrance (Ittar).</span>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40">
            <CheckCircle2 size={18} className="text-primary-500 shrink-0 mt-0.5" />
            <span><strong>Surah Al-Kahf:</strong> Recite or listen to Surah Al-Kahf during Friday daylight.</span>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40">
            <CheckCircle2 size={18} className="text-primary-500 shrink-0 mt-0.5" />
            <span><strong>Listening Attentively:</strong> Maintain silence while the Imam delivers the Khutbah.</span>
          </div>
        </div>
      </div>

      {/* Directory Link */}
      <div className="text-center py-6">
        <Link
          to="/mosques"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
        >
          <span>Find Friday Prayers Near Me</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
