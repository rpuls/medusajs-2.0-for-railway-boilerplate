import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { Bundle } from "@lib/data/bundles"

export default function BundleCard({ bundle }: { bundle: Bundle }) {
  const itemCount = bundle.items?.length ?? 0

  return (
    <LocalizedClientLink href={`/bundles/${bundle.handle}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-ui-border-base bg-ui-bg-base transition hover:border-ui-border-interactive hover:shadow-md">
        {bundle.thumbnail_url ? (
          <div className="aspect-[16/9] overflow-hidden bg-ui-bg-subtle">
            <img
              src={bundle.thumbnail_url}
              alt={bundle.title}
              className="h-full w-full object-cover transition group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center bg-ui-bg-subtle">
            <span className="text-4xl">📦</span>
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between gap-x-3">
            <h3 className="font-semibold text-ui-fg-base text-base leading-snug group-hover:text-ui-fg-interactive">
              {bundle.title}
            </h3>
            <span className="shrink-0 rounded-full bg-ui-bg-subtle px-2 py-0.5 text-xs text-ui-fg-muted">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </span>
          </div>

          {bundle.subtitle ? (
            <p className="mt-2 text-sm text-ui-fg-subtle line-clamp-2">
              {bundle.subtitle}
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-between">
            {bundle.quantity_multiplier_label ? (
              <span className="text-xs text-ui-fg-muted">Per person pricing</span>
            ) : (
              <span className="text-xs text-ui-fg-muted">Fixed pack</span>
            )}
            <span className="text-xs font-medium text-ui-fg-interactive group-hover:underline">
              View pack →
            </span>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
