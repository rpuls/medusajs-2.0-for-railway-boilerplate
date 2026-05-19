import type { BundleWithProducts } from "@lib/data/bundles"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import BundleWizard from "@modules/bundles/components/bundle-wizard"

const DECORATION_ICONS: Record<string, string> = {
  embroidery: "🪡",
  print: "🖨️",
  none: "",
}

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

export default function BundleDetail({ bundle }: { bundle: BundleWithProducts }) {
  const items = [...bundle.items].sort((a, b) => a.position - b.position)

  return (
    <>
      {/* Hero */}
      <section className="content-container py-10 small:py-14">
        <LocalizedClientLink
          href="/bundles"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ui-fg-base underline underline-offset-4 transition hover:text-[var(--brand-secondary)]"
        >
          <ArrowLeftIcon className="transition-transform group-hover:-translate-x-0.5" />
          All bundles
        </LocalizedClientLink>

        <div className="mt-8 grid grid-cols-1 gap-10 large:grid-cols-2 large:gap-16">
          {/* Thumbnail */}
          {bundle.thumbnail_url ? (
            <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-ui-border-base bg-ui-bg-subtle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bundle.thumbnail_url}
                alt={bundle.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-ui-border-base bg-ui-bg-subtle">
              <span className="text-6xl" aria-hidden>📦</span>
            </div>
          )}

          {/* Info */}
          <div className="flex flex-col gap-y-6">
            <header className="border-l-4 border-[var(--brand-secondary)] pl-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
                Uniform pack
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ui-fg-base small:text-4xl">
                {bundle.title}
              </h1>
              {bundle.subtitle ? (
                <p className="mt-3 text-base text-ui-fg-subtle small:text-lg">
                  &ldquo;{bundle.subtitle}&rdquo;
                </p>
              ) : null}
            </header>

            {/* Composition list */}
            <div className="rounded-2xl border border-ui-border-base bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
                Composition
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ui-fg-base">
                What&apos;s included
              </h2>
              <ul className="mt-4 flex list-none flex-col gap-y-3 p-0">
                {items.map((item, i) => (
                  <li key={i} className="flex items-center gap-x-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-secondary)]/15 text-xs font-semibold text-[var(--brand-secondary)]">
                      {item.quantity_per_unit}×
                    </span>
                    <span className="flex-1 text-sm text-ui-fg-base small:text-base">
                      {item.label}
                    </span>
                    {item.decoration_type !== "none" ? (
                      <span className="ml-auto shrink-0 text-xs text-ui-fg-muted">
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
                  Quantities scale per person &mdash; you&apos;ll set the
                  number of crew members in the next step.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Wizard */}
      <section className="border-t border-ui-border-base bg-ui-bg-subtle py-12 small:py-16">
        <div className="content-container">
          <div className="mx-auto max-w-2xl">
            <header className="mb-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
                Configure
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ui-fg-base small:text-3xl">
                Configure your pack
              </h2>
            </header>
            <div className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
              <BundleWizard bundle={bundle} />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
