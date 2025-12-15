import { getBaseURL } from "@lib/util/env"
import { listRegions } from "@lib/data/regions"
import { getLocaleFromCountryCode } from "@lib/i18n/utils/get-locale"

export type HreflangLink = {
  hreflang: string
  href: string
}

/**
 * Generate hreflang alternate links for a page
 */
export async function generateHreflangLinks(
  path: string,
  currentCountryCode: string
): Promise<HreflangLink[]> {
  const baseUrl = getBaseURL()
  const regions = await listRegions()
  
  if (!regions) {
    return []
  }

  const links: HreflangLink[] = []
  
  // Collect all country codes and their locales
  const countryLocales = new Map<string, string>()
  
  regions.forEach((region) => {
    region.countries?.forEach((country) => {
      if (country.iso_2) {
        const locale = getLocaleFromCountryCode(country.iso_2)
        countryLocales.set(country.iso_2.toLowerCase(), locale)
      }
    })
  })

  // Generate hreflang links for each country
  countryLocales.forEach((locale, countryCode) => {
    const url = `${baseUrl}/${countryCode}${path}`
    links.push({
      hreflang: `${locale}-${countryCode.toUpperCase()}`,
      href: url,
    })
  })

  // Add x-default pointing to the default region (or current if no default)
  const defaultCountryCode = currentCountryCode || "us"
  links.push({
    hreflang: "x-default",
    href: `${baseUrl}/${defaultCountryCode}${path}`,
  })

  return links
}

/**
 * Generate hreflang metadata for Next.js Metadata API
 */
export async function generateHreflangMetadata(
  path: string,
  currentCountryCode: string
): Promise<Record<string, string>> {
  const links = await generateHreflangLinks(path, currentCountryCode)
  const alternates: Record<string, string> = {}
  
  links.forEach((link) => {
    alternates[link.hreflang] = link.href
  })
  
  return alternates
}


