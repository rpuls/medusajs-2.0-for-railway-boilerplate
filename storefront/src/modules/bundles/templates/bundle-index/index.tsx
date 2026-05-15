import type { Bundle } from "@lib/data/bundles"
import BundleCard from "@modules/bundles/components/bundle-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function BundleIndex({ bundles }: { bundles: Bundle[] }) {
  return (
    <>
      <section className="content-container border-b border-ui-border-base py-10 small:py-14">
        <div className="flex flex-col gap-3">
          <LocalizedClientLink
            href="/"
            className="text-sm text-ui-fg-muted hover:text-ui-fg-base"
          >
            ← Back to home
          </LocalizedClientLink>
          <h1 className="text-3xl font-semibold tracking-tight text-ui-fg-base">
            Uniform Bundles
          </h1>
          <p className="max-w-2xl text-base text-ui-fg-subtle">
            Pre-configured packs for tradies, crews, and businesses. Everything
            your team needs, sorted in one order — printed and embroidered to
            your spec.
          </p>
        </div>
      </section>

      {bundles.length === 0 ? (
        <section className="content-container py-20 text-center">
          <p className="text-ui-fg-muted">No bundles available yet. Check back soon.</p>
        </section>
      ) : (
        <section className="content-container py-12 small:py-16">
          <div className="grid grid-cols-1 gap-6 small:grid-cols-2 large:grid-cols-3">
            {bundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-ui-border-base bg-ui-bg-subtle py-14">
        <div className="content-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-xl font-semibold text-ui-fg-base">
              Need something custom?
            </h2>
            <p className="mt-3 text-ui-fg-subtle">
              Don&rsquo;t see the exact pack you need? We can build a custom
              bundle tailored to your team size and garment preferences.
            </p>
            <LocalizedClientLink
              href="/contact"
              className="mt-6 inline-flex rounded-full border border-ui-border-base bg-ui-bg-base px-6 py-2.5 text-sm font-medium text-ui-fg-base hover:bg-ui-bg-subtle-hover"
            >
              Get in touch
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </>
  )
}
