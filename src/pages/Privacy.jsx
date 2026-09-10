import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center">
            <Shield size={20} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
        </div>
        <p className="text-sm text-gray-400">Effective Date: September 2026</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm space-y-6 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
        <section className="space-y-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">1. Commitment to User Privacy</h3>
          <p>
            OpenMosque (&quot;we&quot;, &quot;our&quot;, or &quot;the platform&quot;) respects the privacy of our community members. We do not sell, rent, or commercialize your personal data to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">2. Information We Collect</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Data:</strong> When registering via Google or email, we receive basic identifiers (name, email, and avatar).</li>
            <li><strong>Geospatial Location:</strong> If you explicitly click &quot;Near Me&quot; or provide GPS access, your coordinates are used solely in-browser to sort nearby mosques and are not persistently stored on our servers.</li>
            <li><strong>Community Contributions:</strong> Mosque submissions, reviews, and suggested edits submitted by you are visible publicly to benefit the community.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">3. Data Security</h3>
          <p>
            All network communication is secured over HTTPS / TLS. Passwords and authentication tokens are cryptographically verified using industry-standard Firebase and JWT specifications.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">4. Contacting Privacy Stewards</h3>
          <p>
            If you have questions regarding your data or wish to delete your contributor profile, please email <a href="mailto:privacy@openmosque.org" className="text-primary-600 dark:text-primary-400 underline">privacy@openmosque.org</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
