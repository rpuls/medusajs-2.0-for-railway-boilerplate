import type { Bundle } from "@lib/data/bundles"
import BundleCard from "@modules/bundles/components/bundle-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <path d="M13 8H3M7 4L3 8l4 4" />
  </svg>
)

export default function BundleIndex({ bundles }: { bundles: Bundle[] }) {
  return (
    <>
      <section className="content-container py-14 small:py-20">
        <LocalizedClientLink
          href="/"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ui-fg-base underline underline-offset-4 transition hover:text-[var(--brand-secondary)]"
        >
          <ArrowLeftIcon className="transition-transform group-hover:-translate-x-0.5" />
          Back to home
        </LocalizedClientLink>

        <header className="mt-8 mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
            Uniform packs
          </p>
          <h1 className="page-title-marketing mt-3 tracking-tight">
            Uniform Bundles
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ui-fg-subtle small:text-lg">
            Pre-configured packs for tradies, crews, and businesses.
            Everything your team needs, sorted in one order &mdash; printed
            and embroidered to your spec.
          </p>
        </header>
      </section>

      {bundles.length === 0 ? (
        <section className="content-container pb-16">
          <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-ui-border-base bg-white p-10 text-center">
            <p className="text-sm text-ui-fg-subtle small:text-base">
              No bundles available yet &mdash; check back soon, or get in touch
              to build a custom pack.
            </p>
            <div className="mt-6 flex justify-center">
              <LocalizedClientLink
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                Talk to our team
                <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
              </LocalizedClientLink>
            </div>
          </div>
        </section>
      ) : (
        <section className="content-container pb-14 small:pb-16">
          <div className="grid grid-cols-1 gap-6 small:grid-cols-2 large:grid-cols-3">
            {bundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-ui-border-base bg-ui-bg-subtle py-14 small:py-16">
        <div className="content-container">
          <div className="mx-auto max-w-2xl rounded-2xl border border-ui-border-base bg-white p-8 text-center small:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              Custom packs
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-ui-fg-base small:text-3xl">
              Need something custom?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-ui-fg-subtle">
              Don&rsquo;t see the exact pack you need? We can build a custom
              bundle tailored to your team size and garment preferences.
            </p>
            <div className="mt-6 flex justify-center">
              <LocalizedClientLink
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                Get in touch
                <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
