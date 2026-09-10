import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LANGUAGES } from '../../utils/constants';

export default function LanguageSettings() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Globe size={24} />
        Language
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
          Select your preferred language for the interface
        </div>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer ${
              language === lang.code ? 'bg-primary-50 dark:bg-primary-900/20' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{lang.label}</span>
              <span className="text-sm text-gray-400">({lang.nativeLabel})</span>
            </div>
            {language === lang.code && (
              <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
