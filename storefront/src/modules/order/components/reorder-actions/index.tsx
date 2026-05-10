"use client"

import { HttpTypes } from "@medusajs/types"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { phCapture } from "@lib/posthog"
import LineItemMockupPreview from "@modules/customizer/components/line-item-mockup-preview"
import {
  getCustomizerMetadata,
  getCustomizerMockupArtifacts,
  getCustomizerMockupUrls,
} from "@modules/customizer/lib/metadata"

type Props = {
  order: HttpTypes.StoreOrder
}

type AnyLineItem = NonNullable<HttpTypes.StoreOrder["items"]>[number]

type DesignGroup = {
  /** Stable key derived from product + uploaded files + render artifacts. */
  fingerprint: string
  /** Any line in the group — used for design metadata + the reorder deep-link. */
  representativeLine: AnyLineItem
  lines: AnyLineItem[]
  productHandle: string | null
  productTitle: string
  totalQty: number
}

/**
 * Identifies "the same design" across multiple cart line items. Two lines
 * placed in the same cart-add session — e.g. a size-matrix that picks up
 * 13 variants of the same tee — share the customer's uploaded files AND the
 * server-rendered artifact URLs (those URLs are computed once in
 * `addCustomizedToCart` and spread into every per-variant line). Different
 * sessions produce different file IDs (MinIO assigns fresh keys per upload)
 * and different artifact UUIDs, so we don't accidentally collapse re-uploads.
 *
 * Including BOTH file URLs and artifact URLs covers two cases:
 *  - upload-only design → file URLs identify it
 *  - text/shape-only design (no upload) → artifact URLs identify it
 */
function fingerprintDesign(line: AnyLineItem): string {
  const productId = (line as { product_id?: string }).product_id ?? ""
  const meta = getCustomizerMetadata(line)
  const fileUrls = (meta?.customerOriginalFiles ?? [])
    .map((f: unknown) => (f as { url?: string })?.url ?? "")
    .filter((url: string) => url.length > 0)
    .sort()
    .join("|")
  const artifactUrls = (meta?.artifacts ?? [])
    .map((a: unknown) => (a as { printUrl?: string; mockupUrl?: string })?.printUrl ?? "")
    .filter((url: string) => url.length > 0)
    .sort()
    .join("|")
  return `${productId}::${fileUrls}::${artifactUrls}`
}

function groupOrderLinesByDesign(items: AnyLineItem[]): DesignGroup[] {
  const groups = new Map<string, DesignGroup>()
  for (const line of items) {
    if (!getCustomizerMetadata(line)) continue
    const fingerprint = fingerprintDesign(line)
    const existing = groups.get(fingerprint)
    const qty = typeof line.quantity === "number" ? line.quantity : 0
    if (existing) {
      existing.lines.push(line)
      existing.totalQty += qty
    } else {
      groups.set(fingerprint, {
        fingerprint,
        representativeLine: line,
        lines: [line],
        productHandle:
          (line as { product_handle?: string | null }).product_handle ?? null,
        productTitle: line.product_title || line.title || "Custom design",
        totalQty: qty,
      })
    }
  }
  return Array.from(groups.values())
}

const formatQuantitySummary = (lines: AnyLineItem[], totalQty: number): string => {
  const variantCount = lines.length
  const variantWord = variantCount === 1 ? "variant" : "variants"
  const itemWord = totalQty === 1 ? "piece" : "pieces"
  return `${totalQty} ${itemWord} across ${variantCount} ${variantWord}`
}

const ReorderActions = ({ order }: Props) => {
  const groups = groupOrderLinesByDesign(order.items ?? [])
  if (!groups.length) return null

  return (
    <section
      className="bg-ui-bg-subtle rounded-xl p-5"
      data-testid="reorder-actions"
    >
      <h2 className="text-base font-semibold text-ui-fg-base mb-1">Re-order</h2>
      <p className="text-sm text-ui-fg-subtle mb-4">
        Open a saved design back up in the customizer to tweak it, or jump straight
        to the product page if you just want the blank garment again.
      </p>

      <ul className="flex flex-col gap-y-3 list-none p-0 m-0">
        {groups.map((group) => {
          const reorderHref = `/customizer?reorder=${encodeURIComponent(
            `${order.id}:${group.representativeLine.id}`
          )}`
          const productHref = group.productHandle
            ? `/products/${group.productHandle}`
            : null
          const mockupArtifacts = getCustomizerMockupArtifacts(
            group.representativeLine
          )
          const mockupUrls = getCustomizerMockupUrls(group.representativeLine)
          const showVariantsCollapsed = group.lines.length > 5

          return (
            <li
              key={group.fingerprint}
              className="rounded-xl bg-white border border-ui-border-base overflow-hidden"
              data-testid="reorder-design-card"
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                <div className="w-full sm:w-32 sm:flex-shrink-0">
                  <LineItemMockupPreview
                    mockups={mockupArtifacts}
                    mockupUrls={mockupUrls}
                    productThumbnail={group.representativeLine.thumbnail}
                    size="square"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ui-fg-base">
                    {group.productTitle}
                  </p>
                  <p className="text-xs text-ui-fg-subtle mt-0.5">
                    {formatQuantitySummary(group.lines, group.totalQty)}
                  </p>

                  <details
                    className="mt-3 group"
                    open={!showVariantsCollapsed}
                  >
                    <summary
                      className={[
                        "list-none cursor-pointer text-xs text-ui-fg-subtle hover:text-ui-fg-base select-none",
                        // Hide the disclosure caret when always-open (≤5 variants).
                        showVariantsCollapsed ? "" : "hidden",
                      ].join(" ")}
                    >
                      <span className="group-open:hidden">
                        Show {group.lines.length} variants
                      </span>
                      <span className="hidden group-open:inline">
                        Hide variants
                      </span>
                    </summary>
                    <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 list-none p-0 m-0">
                      {group.lines.map((line) => (
                        <li
                          key={line.id}
                          className="flex items-baseline justify-between gap-2 text-xs text-ui-fg-base"
                        >
                          <span className="truncate">
                            {line.variant_title || "Default"}
                          </span>
                          <span className="text-ui-fg-subtle whitespace-nowrap">
                            Qty {line.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </div>

              <div className="border-t border-ui-border-base bg-ui-bg-subtle/40 px-4 py-3 flex flex-col sm:flex-row sm:justify-end gap-2">
                {productHref ? (
                  <LocalizedClientLink
                    href={productHref}
                    className="inline-flex items-center justify-center rounded-md border border-ui-border-base bg-white px-4 py-2 text-sm font-medium text-ui-fg-base hover:bg-ui-bg-subtle"
                    data-testid="reorder-garment-link"
                    onClick={() => phCapture("reorder_garment_clicked", {
                      order_id: order.id,
                      product_handle: group.productHandle ?? undefined,
                    })}
                  >
                    Re-order garment
                  </LocalizedClientLink>
                ) : null}
                <LocalizedClientLink
                  href={reorderHref}
                  className="inline-flex items-center justify-center rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  data-testid="reorder-design-link"
                  onClick={() => phCapture("reorder_design_clicked", {
                    order_id: order.id,
                    product_title: group.productTitle,
                    total_qty: group.totalQty,
                  })}
                >
                  Re-order design
                </LocalizedClientLink>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default ReorderActions
