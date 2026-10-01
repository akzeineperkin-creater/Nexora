export type Locale = 'en' | 'ru' | 'kk';

export interface LanguageOption {
  code: Locale;
  label: string;
  shortLabel: string;
  flag: string;
}

export const SUPPORTED_LOCALES: LanguageOption[] = [
  { code: 'en', label: 'English', shortLabel: 'EN', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', shortLabel: 'RU', flag: '🇷🇺' },
  { code: 'kk', label: 'Қазақша', shortLabel: 'ҚАЗ', flag: '🇰🇿' },
];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_STORAGE_KEY = 'nexra-locale';
