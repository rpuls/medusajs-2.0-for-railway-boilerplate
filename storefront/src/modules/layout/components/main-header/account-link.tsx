"use client"

import { User } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useTranslation } from "@lib/i18n/hooks/use-translation"

const AccountLink = () => {
  const { t } = useTranslation()

  return (
    <LocalizedClientLink
      href="/account"
      className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
      data-testid="nav-account-link"
    >
      <User className="w-5 h-5" />
      <span className="hidden md:inline text-sm font-medium">
        {t("common.registration") || "Registration"}
      </span>
    </LocalizedClientLink>
  )
}

export default AccountLink

