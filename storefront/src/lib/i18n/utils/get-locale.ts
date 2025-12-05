/**
 * Get locale from country code
 * Maps country codes to locales
 */

const countryToLocaleMap: Record<string, string> = {
  bg: "bg", // Bulgarian
  us: "en", // English (US)
  gb: "en", // English (UK)
  ca: "en", // English (Canada)
  au: "en", // English (Australia)
  // Add more mappings as needed
}

/**
 * Get locale from country code
 * @param countryCode - ISO 2-letter country code
 * @returns locale code (defaults to 'en')
 */
export function getLocaleFromCountryCode(countryCode: string): string {
  if (!countryCode || typeof countryCode !== 'string') {
    return "en"
  }
  return countryToLocaleMap[countryCode.toLowerCase()] || "en"
}

/**
 * Get all available locales
 */
export function getAvailableLocales(): string[] {
  return ["en", "bg"] // Add more as translations are added
}

