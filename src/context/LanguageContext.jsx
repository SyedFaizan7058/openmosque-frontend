import { createContext, useContext, useState, useCallback } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  }, []);

  // Translation helper
  const t = useCallback(
    (key) => {
      const keys = key.split('.');
      let value = translations[language] || translations.en;
      for (const k of keys) {
        value = value?.[k];
      }
      if (value === undefined) {
        // Fallback to English
        let fallback = translations.en;
        for (const k of keys) {
          fallback = fallback?.[k];
        }
        return fallback || key;
      }
      return value;
    },
    [language]
  );

  const dir = language === 'ar' || language === 'ur' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}

export default LanguageContext;
