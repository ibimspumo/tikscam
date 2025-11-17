/**
 * i18n utilities and hooks
 */

import { en } from './locales/en';
import type { TranslationKey } from './locales/en';
import { defaultLocale, type Locale } from './config';

// Translation dictionary
const translations = {
  en,
  // Future: Add more languages here
  // de: deTranslations,
} as const;

/**
 * Get nested value from object using dot notation
 * e.g. "streamInfo.title" => translations.en.streamInfo.title
 */
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

/**
 * Get translation for a given key
 * @param key - Translation key in dot notation (e.g., "streamInfo.title")
 * @param locale - Locale to use (defaults to 'en')
 * @returns Translated string
 */
export function getTranslation(key: string, locale: Locale = defaultLocale): string {
  const translation = translations[locale];
  return getNestedValue(translation, key);
}

/**
 * React hook for using translations
 * Returns a function to get translations by key
 */
export function useTranslation(locale: Locale = defaultLocale) {
  const t = (key: string): string => {
    return getTranslation(key, locale);
  };

  return { t, locale };
}

// Export types and config
export type { TranslationKey, Locale };
export { defaultLocale, locales } from './config';
