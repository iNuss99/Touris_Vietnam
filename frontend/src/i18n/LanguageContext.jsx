import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import translations from './translations';

// Context cho ngon ngu hien tai
const LanguageContext = createContext(null);

// Provider component — boc toan bo app de chia se trang thai ngon ngu
export function LanguageProvider({ children }) {
  // Doc ngon ngu da luu tu localStorage, mac dinh la 'en'
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('vnt-lang') || 'en';
    } catch {
      return 'en';
    }
  });

  // Khi ngon ngu thay doi: luu localStorage + cap nhat html lang attribute
  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem('vnt-lang', newLang);
    } catch {
      // localStorage khong kha dung (e.g. incognito) — bo qua
    }
    document.documentElement.lang = newLang;
  }, []);

  // Dong bo html lang attribute khi mount
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Helper lay text theo ngon ngu hien tai
  // Su dung: t('hero') => translations[lang].hero
  const t = useCallback((section) => {
    return translations[lang]?.[section] || translations['en']?.[section] || {};
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook de truy cap trang thai ngon ngu tu bat ky component nao
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
