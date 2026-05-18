"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function HeroOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end pb-16 small:justify-center small:pb-0"
      aria-labelledby="hero-headline"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent"
        aria-hidden
      />

      <div className="content-container relative">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
            Custom Apparel · Victoria, AU
          </p>
          <h1
            id="hero-headline"
            className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-white small:text-5xl large:text-6xl"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.55)" }}
          >
            Custom print apparel for teams, brands &amp; events.
          </h1>
          <p
            className="mt-4 max-w-xl text-base text-white/85 small:text-lg"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.45)" }}
          >
            Screen print, embroidery, digital transfer &mdash; done in-house
            with proofs in 24 hours.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <LocalizedClientLink
              href="/store"
              className="pointer-events-auto inline-flex items-center rounded-lg bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              Shop the range
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/contact"
              className="pointer-events-auto inline-flex items-center rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              Get a quote
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}
