/**
 * i18n Configuration
 * Currently only supports English, but structured for future multi-language support
 */

export const defaultLocale = 'en' as const;
export const locales = ['en'] as const;

export type Locale = typeof locales[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  // Future: Add more languages here
  // de: 'Deutsch',
  // es: 'Español',
};
