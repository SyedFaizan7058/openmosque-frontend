import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Users, Globe, BookOpen, Compass, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 text-xs font-semibold border border-primary-200 dark:border-primary-800">
          <Globe size={14} className="text-primary-500" />
          <span>Our Community Mission</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Connecting the Global Ummah to Every Local Mosque
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          OpenMosque is an open-source, community-driven platform built to ensure every Muslim, traveler, and seeker can find accurate prayer times, verified congregation Iqamah schedules, and welcoming places of worship.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-4">
            <Compass size={24} />
          </div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Accurate Geospatial Data</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            High-precision PostGIS coordinates, verified street directions, and detailed amenity mappings for wheelchair access and women&apos;s halls.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-4">
            <Users size={24} />
          </div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Crowdsourced Power</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Worshippers earn reward points for submitting new mosques, updating prayer times, and keeping information fresh and reliable.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Moderation & Verification</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Verified mosque trustees and community moderators review submissions and claims to ensure authenticity and trust.
          </p>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">How are prayer times calculated?</h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
              Astronomical Adhan timings are computed according to official recognized calculation methods (such as Muslim World League, ISNA, Umm Al-Qura, and Karachi). Iqamah timings reflect the congregation schedules set by each mosque.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Can Imams and committee members manage their mosque profile?</h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
              Yes. Committee members and Imams can click the &quot;Claim Mosque&quot; button on their mosque profile. Once approved by moderators, they receive administrative access to update Iqamah times and announcements directly.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Is OpenMosque free to use?</h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
              OpenMosque is completely free, non-profit, and open-source for the entire global community.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ready to explore or contribute?</h3>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/mosques"
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-md"
          >
            Find Mosques
          </Link>
          <Link
            to="/contact"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
