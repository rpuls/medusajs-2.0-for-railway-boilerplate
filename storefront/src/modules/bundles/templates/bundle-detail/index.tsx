import type { BundleWithProducts } from "@lib/data/bundles"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import BundleWizard from "@modules/bundles/components/bundle-wizard"

const DECORATION_ICONS: Record<string, string> = {
  embroidery: "🪡",
  print: "🖨️",
  none: "",
}

export default function BundleDetail({ bundle }: { bundle: BundleWithProducts }) {
  const items = [...bundle.items].sort((a, b) => a.position - b.position)

  return (
    <>
      {/* Hero */}
      <section className="content-container border-b border-ui-border-base py-10 small:py-14">
        <LocalizedClientLink
          href="/bundles"
          className="text-sm text-ui-fg-muted hover:text-ui-fg-base"
        >
          ← All bundles
        </LocalizedClientLink>

        <div className="mt-6 grid grid-cols-1 gap-10 large:grid-cols-2 large:gap-16">
          {/* Thumbnail */}
          {bundle.thumbnail_url ? (
            <div className="overflow-hidden rounded-2xl border border-ui-border-base bg-ui-bg-subtle aspect-[16/10]">
              <img
                src={bundle.thumbnail_url}
                alt={bundle.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-ui-border-base bg-ui-bg-subtle">
              <span className="text-6xl">📦</span>
            </div>
          )}

          {/* Info */}
          <div className="flex flex-col gap-y-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-ui-fg-base">
                {bundle.title}
              </h1>
              {bundle.subtitle ? (
                <p className="mt-3 text-lg text-ui-fg-subtle">
                  &ldquo;{bundle.subtitle}&rdquo;
                </p>
              ) : null}
            </div>

            {/* Composition list */}
            <div>
              <h2 className="text-sm font-medium text-ui-fg-muted uppercase tracking-wider">
                What&apos;s included
              </h2>
              <ul className="mt-3 flex flex-col gap-y-2">
                {items.map((item, i) => (
                  <li key={i} className="flex items-center gap-x-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ui-bg-subtle text-xs font-semibold text-ui-fg-base">
                      {item.quantity_per_unit}×
                    </span>
                    <span className="text-sm text-ui-fg-base">{item.label}</span>
                    {item.decoration_type !== "none" ? (
                      <span className="ml-auto text-xs text-ui-fg-muted shrink-0">
                        {DECORATION_ICONS[item.decoration_type] ?? ""}{" "}
                        {item.decoration_type}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            {bundle.quantity_multiplier_label ? (
              <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
                <p className="text-sm text-ui-fg-subtle">
                  Quantities scale per person — you&apos;ll set the number of crew
                  members in the next step.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Wizard */}
      <section className="content-container py-12 small:py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-xl font-semibold text-ui-fg-base mb-6">
            Configure your pack
          </h2>
          <BundleWizard bundle={bundle} />
        </div>
      </section>
    </>
  )
}
