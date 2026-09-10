import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Terms of Service
          </h1>
        </div>
        <p className="text-sm text-gray-400">Effective Date: September 2026</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm space-y-6 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
        <section className="space-y-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">1. Acceptance of Terms</h3>
          <p>
            By accessing or contributing to OpenMosque, you agree to abide by these community standards and platform terms.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">2. Contributor Guidelines &amp; Data Integrity</h3>
          <p>
            When adding a new mosque or suggesting edits, contributors pledge to provide truthful, respectful, and verified information. Spreading disinformation or vulgarity results in immediate account suspension.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">3. Mosque Administration Claims</h3>
          <p>
            Imams, trustees, and authorized mosque committees may claim administrative management of their listings by presenting verifiable charity registration or mosque committee identification.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">4. Prayer Time Disclaimers</h3>
          <p>
            Astronomical calculations are provided for convenience. Worshippers are advised to follow the official local Iqamah announcements announced at the respective mosque.
          </p>
        </section>
      </div>
    </div>
  );
}
