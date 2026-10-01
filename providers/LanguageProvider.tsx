'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Locale, DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from '@/lib/i18n/types';
import { getTranslation, getDictionary, Translations } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dictionary: Translations;
  isMounted: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize from localStorage or navigator.language
  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (savedLocale && SUPPORTED_LOCALES.some((l) => l.code === savedLocale)) {
        setLocaleState(savedLocale);
      } else if (typeof navigator !== 'undefined') {
        const browserLang = navigator.language.slice(0, 2).toLowerCase();
        if (browserLang === 'ru') {
          setLocaleState('ru');
        } else if (browserLang === 'kk' || browserLang === 'kz') {
          setLocaleState('kk');
        }
      }
    } catch {
      // Ignore localStorage errors in restricted environments
    }
    setIsMounted(true);
  }, []);

  // Sync document <html lang="..."> attribute and localStorage
  useEffect(() => {
    if (!isMounted) return;

    try {
      document.documentElement.lang = locale;
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Ignore storage errors
    }
  }, [locale, isMounted]);

  const setLocale = useCallback((newLocale: Locale) => {
    if (SUPPORTED_LOCALES.some((l) => l.code === newLocale)) {
      setLocaleState(newLocale);
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return getTranslation(locale, key, params);
    },
    [locale]
  );

  const dictionary = useMemo(() => getDictionary(locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      dictionary,
      isMounted,
    }),
    [locale, setLocale, t, dictionary, isMounted]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export const useTranslation = useLanguage;
