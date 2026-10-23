import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, getDirection } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const readSavedLanguage = (): Language => {
  try {
    const saved = localStorage.getItem('portfolio-language');
    return saved === 'en' || saved === 'fr' || saved === 'ar' ? saved : 'en';
  } catch {
    return 'en';
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(readSavedLanguage);
  const t = translations[language];

  useEffect(() => {
    try {
      localStorage.setItem('portfolio-language', language);
    } catch {
      // The language still works for the current visit when storage is unavailable.
    }
    document.documentElement.dir = getDirection(language);
    document.documentElement.lang = language;
    document.title = t.documentTitle;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', t.documentDescription);
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', t.documentTitle);
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', t.documentDescription);
  }, [language, t]);

  const value = {
    language,
    setLanguage,
    t,
    direction: getDirection(language),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
