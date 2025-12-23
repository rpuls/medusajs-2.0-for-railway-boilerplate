/**
 * Server-side translation utilities
 */

import { loadTranslations, type TranslationKeys } from "./config"
import { getLocale } from "./config"

/**
 * Get translations for a country code (server component)
 * Translations are static files - can be cached
 */
export async function getTranslations(
  countryCode: string
): Promise<TranslationKeys> {
  "use cache"
  const locale = getLocale(countryCode)
  return await loadTranslations(locale)
}

/**
 * Get translation value by key path (e.g., "common.cart")
 */
export function getTranslation(
  translations: TranslationKeys,
  key: string
): string {
  const keys = key.split(".")
  let value: any = translations

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k]
    } else {
      return key // Return key if translation not found
    }
  }

  return typeof value === "string" ? value : key
}

