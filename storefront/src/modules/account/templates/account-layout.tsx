import React from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
)

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 small:py-12" data-testid="account-page">
      <div className="content-container mx-auto flex h-full max-w-5xl flex-1 flex-col bg-white">
        <div className="grid grid-cols-1 py-12 small:grid-cols-[240px_1fr]">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1">{children}</div>
        </div>
        <div className="flex flex-col items-start justify-between gap-6 border-t border-ui-border-base py-12 small:flex-row small:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              Help
            </p>
            <h3 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
              Got questions?
            </h3>
            <p className="mt-2 max-w-md text-sm text-ui-fg-subtle small:text-base">
              Need help with your account or an order? Reach out to our
              support team.
            </p>
          </div>
          <LocalizedClientLink
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Contact support
            <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
