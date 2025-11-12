/**
 * i18n configuration
 */

import { getLocaleFromCountryCode } from "./utils/get-locale"

export type Locale = "en" | "bg"

export interface TranslationKeys {
  common: Record<string, string>
  cart: Record<string, string>
  product: Record<string, string>
  filters: Record<string, string>
  homepage: Record<string, any>
  checkout: Record<string, string>
}

/**
 * Load translations for a locale
 */
export async function loadTranslations(locale: Locale): Promise<TranslationKeys> {
  try {
    const translations = await import(`./locales/${locale}.json`)
    return translations.default
  } catch (error) {
    // Fallback to English if locale not found
    if (locale !== "en") {
      const translations = await import(`./locales/en.json`)
      return translations.default
    }
    throw error
  }
}

/**
 * Get locale from country code (server-side)
 */
export function getLocale(countryCode: string): Locale {
  const locale = getLocaleFromCountryCode(countryCode)
  return locale as Locale
}

