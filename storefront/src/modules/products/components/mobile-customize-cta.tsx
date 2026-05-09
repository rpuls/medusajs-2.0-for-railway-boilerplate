"use client"

import { useEffect, useState } from "react"

/**
 * Mobile-only sticky "Customize this product" CTA pinned to the bottom
 * of the viewport. The embedded customizer's primary CTA lives inside
 * step 1 of the wizard, which on mobile sits below ProductInfo +
 * Specifications/Shipping tabs — that's a long scroll for someone
 * landing on the page who just wants to customise.
 *
 * This sticky button stays visible until the customer has scrolled the
 * customizer mount-point (`#product-customizer`) into view — at which
 * point the in-flow primary CTA is right in front of them and the
 * sticky one would just clutter the bottom of the screen.
 *
 * Hidden entirely on lg+ screens because desktop has the customizer in
 * the right column, on screen at all times, no scroll required.
 */
export default function MobileCustomizeCta() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    const target = document.getElementById("product-customizer")
    if (!target) return

    // IntersectionObserver: hide the sticky CTA when ~25% of the
    // customizer is on screen. The customer can see the in-flow button
    // at that point, so the sticky one is redundant.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting)
      },
      { threshold: 0.05 }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  if (!visible) return null

  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 pointer-events-none">
      <div
        className="pointer-events-auto mx-auto max-w-md p-3"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={() => {
            const target = document.getElementById("product-customizer")
            if (!target) return
            // iOS Safari sometimes ignores smooth scroll under specific
            // overflow combos — try smooth first, then fall back to a
            // forced jump if we haven't moved 350ms later.
            target.scrollIntoView({ behavior: "smooth", block: "start" })
            window.setTimeout(() => {
              const t = document.getElementById("product-customizer")
              if (!t) return
              const rect = t.getBoundingClientRect()
              if (Math.abs(rect.top) > 80) {
                window.scrollTo({
                  top: window.scrollY + rect.top - 16,
                  behavior: "smooth",
                })
              }
            }, 350)
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary,#e11d48)] px-4 py-3.5 text-base font-bold uppercase tracking-wide text-white shadow-2xl shadow-rose-500/40 ring-1 ring-rose-400/40 transition-transform active:scale-[0.99]"
          aria-label="Jump to the product customizer"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
          Customize this product
          <span aria-hidden className="text-lg leading-none">↓</span>
        </button>
      </div>
    </div>
  )
}
