"use client"

import { useEffect, useState } from "react"

import { convertMinorToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  total: number | null
  currencyCode: string
  checkoutHref: string
  /** DOM id of the in-page summary; sticky bar hides while that element is visible. */
  summaryAnchorId?: string
}

/**
 * Mobile-only sticky checkout bar pinned to the bottom of the viewport on
 * the cart page. Visible while the customer is scrolling the items list;
 * hides when the in-page Summary (with its own checkout button) is on
 * screen so the two CTAs don't fight for tap area.
 *
 * Mirrors the {@link MobileCustomizeCta} pattern: IntersectionObserver +
 * env(safe-area-inset-bottom) + lg:hidden.
 */
export default function MobileCheckoutBar({
  total,
  currencyCode,
  checkoutHref,
  summaryAnchorId = "cart-summary-anchor",
}: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    const target = document.getElementById(summaryAnchorId)
    if (!target) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.15 }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [summaryAnchorId])

  if (!visible) return null

  return (
    <div className="small:hidden fixed inset-x-0 bottom-0 z-40 pointer-events-none">
      <div
        className="pointer-events-auto border-t border-ui-border-base bg-white/95 backdrop-blur"
        style={{
          paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
        }}
      >
        <div className="content-container flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-ui-fg-subtle">
              Total
            </p>
            <p className="truncate text-lg font-semibold text-ui-fg-base">
              {convertMinorToLocale({
                amount: total ?? 0,
                currency_code: currencyCode,
              })}
            </p>
          </div>
          <LocalizedClientLink
            href={checkoutHref}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99]"
            data-testid="mobile-checkout-bar-button"
          >
            Checkout
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
