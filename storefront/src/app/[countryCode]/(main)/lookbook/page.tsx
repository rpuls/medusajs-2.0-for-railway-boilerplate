import { Metadata } from "next"

import { getLookbookItems } from "@lib/data/lookbook"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Real SC PRINTS jobs in the wild — see what we make.",
}

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

export default async function LookbookPage() {
  const items = await getLookbookItems()
  const tags = Array.from(
    new Set(items.flatMap((i) => i.tags ?? []).filter(Boolean))
  ).sort()

  return (
    <div className="content-container py-14 small:py-20">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
          See what we make
        </p>
        <h1 className="page-title-marketing mt-3 tracking-tight">Lookbook</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ui-fg-subtle small:text-lg">
          Real jobs from real teams. Browse for inspiration, or steal an idea
          for your next kit.
        </p>
      </header>

      {tags.length > 0 ? (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full border border-ui-border-base bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--brand-primary)]/80"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-dashed border-ui-border-base bg-white p-10 text-center">
          <p className="text-sm text-ui-fg-subtle small:text-base">
            We&apos;re still building this gallery &mdash; check back soon, or
            reach out for our portfolio.
          </p>
          <div className="mt-6 flex justify-center">
            <LocalizedClientLink
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              Request the portfolio
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </LocalizedClientLink>
          </div>
        </div>
      ) : (
        <ul
          className="mt-10 columns-2 gap-4 small:columns-3 large:columns-4"
          style={{ columnFill: "balance" }}
        >
          {items.map((item) => (
            <li
              key={item.id}
              className="group mb-4 break-inside-avoid overflow-hidden rounded-xl border border-ui-border-base bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-secondary)]/40 hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url}
                alt={item.title}
                loading="lazy"
                className="block w-full"
              />
              <div className="p-4">
                <p className="text-sm font-semibold text-ui-fg-base">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="mt-1 text-xs text-ui-fg-subtle">
                    {item.description}
                  </p>
                ) : null}
                {item.attribution ? (
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ui-fg-muted">
                    Photo by {item.attribution}
                  </p>
                ) : null}
                {item.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex rounded-full border border-ui-border-base bg-ui-bg-subtle px-2 py-0.5 text-[10px] font-medium text-ui-fg-subtle"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
