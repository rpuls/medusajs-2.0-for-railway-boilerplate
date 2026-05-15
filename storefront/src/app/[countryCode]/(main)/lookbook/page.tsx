import { Metadata } from "next"

import { getLookbookItems } from "@lib/data/lookbook"

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Real SC PRINTS jobs in the wild — see what we make.",
}

export default async function LookbookPage() {
  const items = await getLookbookItems()
  const tags = Array.from(
    new Set(items.flatMap((i) => i.tags ?? []).filter(Boolean))
  ).sort()

  return (
    <div className="content-container py-12">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-secondary)]">
          See what we make
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--brand-primary)] small:text-5xl">
          Lookbook
        </h1>
        <p className="mt-3 text-sm text-ui-fg-subtle small:text-base">
          Real jobs from real teams. Browse for inspiration, or steal an idea
          for your next kit.
        </p>
      </div>

      {tags.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full bg-ui-bg-subtle px-3 py-1 text-xs text-[var(--brand-primary)]"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-ui-border-base p-10 text-center">
          <p className="text-sm text-ui-fg-subtle">
            We&apos;re still building this gallery — check back soon, or reach
            out for our portfolio.
          </p>
        </div>
      ) : (
        <ul
          className="mt-8 columns-2 gap-4 small:columns-3 large:columns-4"
          style={{ columnFill: "balance" }}
        >
          {items.map((item) => (
            <li
              key={item.id}
              className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-[rgba(26,26,46,0.06)] bg-white shadow-sm"
            >
              <img
                src={item.image_url}
                alt={item.title}
                loading="lazy"
                className="block w-full"
              />
              <div className="p-3">
                <p className="text-sm font-semibold text-[var(--brand-primary)]">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="mt-1 text-xs text-ui-fg-subtle">
                    {item.description}
                  </p>
                ) : null}
                {item.attribution ? (
                  <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-ui-fg-muted">
                    Photo by {item.attribution}
                  </p>
                ) : null}
                {item.tags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex rounded bg-ui-bg-subtle px-2 py-0.5 text-[10px] text-[var(--brand-primary)]"
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
