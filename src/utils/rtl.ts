// packages/components/src/utils/rtl.ts

/**
 * @fileoverview RTL Language Detection Utilities
 * @description RTL language detection utility. Primarily used for setting the dir attribute on document.documentElement.
 *
 * IMPORTANT: For component RTL support, use native CSS with [dir='rtl'] selectors instead of JavaScript detection.
 * - Radix UI components automatically handle RTL when using 'start'/'end' alignment props
 * - Use CSS logical properties and [dir='rtl'] selectors for styling
 * - Only use isRTLLanguage() when you need to set the dir attribute (e.g., in languageSelector)
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

// RTL language codes
const RTL_LANGUAGES = [
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Persian/Farsi
  'ur', // Urdu
  'ps', // Pashto
  'sd', // Sindhi
  'yi', // Yiddish
  'ku', // Kurdish
  'dv', // Divehi
] as const;

/**
 * Detects if a language is RTL
 * @param language - Optional language code. If not provided, detects from current DOM
 * @returns boolean indicating if the language is RTL
 *
 * NOTE: This function should primarily be used for setting the dir attribute on document.documentElement.
 * For component logic, prefer checking document.documentElement.dir directly or using CSS [dir='rtl'] selectors.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export const isRTLLanguage = (language?: string): boolean => {
  // If language parameter provided, check that specific language
  if (language) {
    return RTL_LANGUAGES.includes(language as (typeof RTL_LANGUAGES)[number]);
  }

  // SSR-safe: always return false during SSR to prevent hydration mismatches
  if (typeof window === 'undefined') return false;

  // First check if dir attribute is set (most reliable)
  const dir = document.documentElement.dir;
  if (dir === 'rtl') return true;
  if (dir === 'ltr') return false;

  // Fallback to language detection
  const currentLang =
    document.documentElement.lang || navigator.language.split('-')[0];
  return RTL_LANGUAGES.includes(currentLang as (typeof RTL_LANGUAGES)[number]);
};
