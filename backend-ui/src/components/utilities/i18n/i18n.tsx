import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import { defaultI18nOptions } from "../../../i18n/config"
import { useExtension } from "../../../providers/extension-provider"

export const I18n = () => {
  const { getI18nResources } = useExtension()

  if (i18n.isInitialized) {
    return null
  }

  const resources = getI18nResources()
  i18n
    .use(
      new LanguageDetector(null, {
        lookupCookie: "lng",
        lookupLocalStorage: "lng",
      })
    )
    .use(initReactI18next)
    .init({
      ...defaultI18nOptions,
      resources,
      supportedLngs: Object.keys(resources),
    })

  return null
}

export { i18n }
