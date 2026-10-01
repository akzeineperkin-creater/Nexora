import { Locale, DEFAULT_LOCALE } from './types';
import { en } from './translations/en';
import { ru } from './translations/ru';
import { kk } from './translations/kk';

export * from './types';
export { en, ru, kk };

export type Translations = typeof en;

const translations: Record<Locale, any> = {
  en,
  ru,
  kk,
};

/**
 * Safely retrieves a nested translation by dot-path (e.g. "dashboard.welcomeBack").
 * Falls back to English if missing in target locale.
 * Replaces parameters like `{name}` or `{count}`.
 */
export function getTranslation(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const currentDict = translations[locale] || translations[DEFAULT_LOCALE];
  const fallbackDict = translations[DEFAULT_LOCALE];

  const value = resolveKey(currentDict, key) ?? resolveKey(fallbackDict, key) ?? key;

  if (typeof value !== 'string') {
    return key;
  }

  if (!params) {
    return value;
  }

  return Object.entries(params).reduce((acc, [paramKey, paramVal]) => {
    return acc.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
  }, value);
}

function resolveKey(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  const segments = path.split('.');
  let current = obj;
  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

export function getDictionary(locale: Locale): Translations {
  return translations[locale] || translations[DEFAULT_LOCALE];
}
