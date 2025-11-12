"use client"

import { useParams } from "next/navigation"
import { useMemo } from "react"
import { getLocaleFromCountryCode } from "../utils/get-locale"
import type { TranslationKeys } from "../config"

// Import translations statically for client components
import enTranslations from "../locales/en.json"
import bgTranslations from "../locales/bg.json"

const translationsMap: Record<string, TranslationKeys> = {
  en: enTranslations,
  bg: bgTranslations,
}

/**
 * React hook for translations in client components
 */
export function useTranslation() {
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "us"

  const locale = useMemo(() => {
    return getLocaleFromCountryCode(countryCode)
  }, [countryCode])

  const translations = useMemo(() => {
    return translationsMap[locale] || translationsMap.en
  }, [locale])

  const t = useMemo(() => {
    return (key: string): string => {
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
  }, [translations])

  return { t, locale, translations }
}

