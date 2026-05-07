import { HttpTypes } from "@medusajs/types"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCustomizerMetadata } from "@modules/customizer/lib/metadata"

type Props = {
  order: HttpTypes.StoreOrder
}

const ReorderActions = ({ order }: Props) => {
  const customizerLines = (order.items ?? []).filter((item) =>
    Boolean(getCustomizerMetadata(item))
  )

  if (!customizerLines.length) {
    return null
  }

  return (
    <section
      className="bg-ui-bg-subtle rounded-xl p-5"
      data-testid="reorder-actions"
    >
      <h2 className="text-base font-semibold text-ui-fg-base mb-3">Re-order</h2>
      <p className="text-sm text-ui-fg-subtle mb-4">
        Open any of these designs in the customizer pre-loaded with the same artwork
        and settings. Tweak quantities or sizes if you want, then send back to cart.
      </p>
      <ul className="flex flex-col gap-y-2 list-none p-0 m-0">
        {customizerLines.map((line) => {
          const href = `/customizer?reorder=${encodeURIComponent(`${order.id}:${line.id}`)}`
          const label = line.product_title || line.title || "Custom design"
          const variantLabel = line.variant_title ? ` · ${line.variant_title}` : ""
          return (
            <li
              key={line.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-white border border-ui-border-base px-4 py-3"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-ui-fg-base">
                  {label}
                  <span className="text-ui-fg-subtle">{variantLabel}</span>
                </span>
                <span className="text-xs text-ui-fg-subtle">
                  Qty {line.quantity}
                </span>
              </div>
              <LocalizedClientLink
                href={href}
                className="inline-flex items-center justify-center rounded-md bg-[var(--brand-primary)] text-white px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                Re-order
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default ReorderActions
