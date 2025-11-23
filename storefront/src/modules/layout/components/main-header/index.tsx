import { Suspense } from "react"
import { Phone } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SearchBar from "./search-bar"
import HeaderLinks from "./header-links"
import AccountLink from "./account-link"
import { getTranslations } from "@lib/i18n/server"

const MainHeader = async ({ countryCode }: { countryCode: string }) => {
  const translations = await getTranslations(countryCode)

  return (
    <div className="w-full bg-background-base border-b border-border-base">
      {/* Top Row: Contact & Info Links */}
      <div className="content-container py-2 border-b border-border-base">
        <div className="flex items-center justify-between text-sm text-text-secondary">
          {/* Left: Email */}
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <a
              href="mailto:orders@phytolife.bg"
              className="hover:text-text-primary transition-colors"
            >
              orders@phytolife.bg
            </a>
          </div>

          {/* Right: FAQ, Reviews, Blog */}
          <HeaderLinks />
        </div>
      </div>

      {/* Bottom Row: Logo, Search, Actions */}
      <div className="content-container py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <LocalizedClientLink
              href="/"
              className="text-3xl md:text-4xl font-bold text-text-primary hover:opacity-80 transition-opacity"
              data-testid="nav-store-link"
            >
              MStore
            </LocalizedClientLink>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <SearchBar />
          </div>

          {/* Right: Phone, Account, Cart */}
          <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
            {/* Phone */}
            <div className="hidden md:flex items-center gap-2 text-text-secondary">
              <Phone className="w-5 h-5" />
              <a
                href="tel:00877300815"
                className="hover:text-text-primary transition-colors text-sm font-medium"
              >
                00877 300 815
              </a>
            </div>

            {/* Registration/Account */}
            <AccountLink />

            {/* Cart */}
            <Suspense
              fallback={
                <div className="flex items-center gap-2 text-text-secondary">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span className="hidden md:inline text-sm">0.00 {translations.cartButton.currency}</span>
                </div>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainHeader

