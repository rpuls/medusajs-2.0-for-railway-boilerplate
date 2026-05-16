import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { Badge, Container, Heading, Text } from "@medusajs/ui"
import { withWidgetBoundary } from "../components/widget-error-boundary"

import { HelpTooltip } from "../components/reports/help-tooltip"

/**
 * Per-order widget that surfaces — for every line item carrying
 * `metadata.customizerDesign` — (a) the print sizes the customer (or the
 * customizer's auto-snap) ended up with on each side, (b) the global
 * print size the customer picked in Step 3 of the wizard so any
 * discrepancy between the two is easy to spot, and (c) the cost
 * breakdown showing how much of each unit price is the garment vs. the
 * print decoration.
 *
 * Reads the order off `DetailWidgetProps.data` — no extra API round-trip.
 * Falls back gracefully when older orders don't carry the per-print
 * `prints[]` array (legacy v2 metadata only writes a single
 * `scpPrintSizeId`).
 */

// ──────────────────────────────────────────────────────────────────────────────
// Labels / orderings
// ──────────────────────────────────────────────────────────────────────────────

const SIDE_ORDER = [
  "front",
  "back",
  "left_sleeve",
  "right_sleeve",
  "printed_tag",
] as const

const SIDE_LABELS: Record<string, string> = {
  front: "Front",
  back: "Back",
  left_sleeve: "Left Sleeve",
  right_sleeve: "Right Sleeve",
  printed_tag: "Tag",
}

const SIZE_LABELS: Record<string, string> = {
  up_to_a6: "10×15 cm (A6)",
  up_to_a4: "21×30 cm (A4)",
  up_to_a3: "29×42 cm (A3)",
  oversize: "38×48 cm (Oversize)",
}

const SIZE_PRIORITY = ["up_to_a6", "up_to_a4", "up_to_a3", "oversize"]

// ──────────────────────────────────────────────────────────────────────────────
// Types (kept loose — `metadata` is unknown JSON at the runtime boundary)
// ──────────────────────────────────────────────────────────────────────────────

type PrintSpec = {
  objectId: string
  side: string
  sizeId: string
  manualSize?: boolean
  approxCm?: { width: number; height: number }
}

type PricingBreakdown = {
  baseUnitPriceCents: number
  sideSurchargePerUnitCents: number
  sideSurchargeTotalCents: number
  quantityDiscountRate: number
  discountedUnitPriceCents: number
  totalPriceCents: number
}

type CustomizerDesign = {
  prints?: PrintSpec[]
  scpPrintSizeId?: string
  pricing?: PricingBreakdown
  sideLayouts?: Array<{ side: string; objects: unknown[] }>
}

type AdminOrderItem = {
  id: string
  product_id?: string | null
  product_title?: string | null
  variant_title?: string | null
  title?: string | null
  quantity?: number | null
  metadata?: Record<string, unknown> | null
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function formatMoney(cents: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
    }).format(cents / 100)
  } catch {
    return `${(cents / 100).toFixed(2)} ${currencyCode.toUpperCase()}`
  }
}

function getDesign(item: AdminOrderItem): CustomizerDesign | null {
  const raw = item.metadata?.customizerDesign
  if (!raw || typeof raw !== "object") return null
  return raw as CustomizerDesign
}

function decoratedSidesFromLayouts(design: CustomizerDesign): string[] {
  if (!Array.isArray(design.sideLayouts)) return []
  return design.sideLayouts
    .filter((s) => Array.isArray(s.objects) && s.objects.length > 0)
    .map((s) => s.side)
}

/**
 * Compose the picture of which size applies to each decorated side:
 *   - snapped:  the per-side entry from prints[] (largest if multiple
 *               prints share a side), or null when prints[] is missing
 *               for that side.
 *   - global:   what the customer picked in Step 3 (scpPrintSizeId).
 *   - mismatch: true when both are present but disagree — surfaces the
 *               class of bug we're hunting for in the artwork PDF.
 */
function summariseSidesForDesign(design: CustomizerDesign) {
  const prints = Array.isArray(design.prints) ? design.prints : []
  const decoratedSides = decoratedSidesFromLayouts(design)
  // Sides that have at least one print spec OR an objects list
  const sidesUnion = new Set<string>([
    ...prints.map((p) => p.side),
    ...decoratedSides,
  ])

  const ordered = SIDE_ORDER.filter((s) => sidesUnion.has(s))
  // Append any non-canonical sides we don't know about (defensive)
  for (const s of sidesUnion) {
    if (!ordered.includes(s as (typeof SIDE_ORDER)[number])) {
      ordered.push(s as (typeof SIDE_ORDER)[number])
    }
  }

  return ordered.map((side) => {
    const sidePrints = prints.filter((p) => p.side === side)
    let snapped: string | null = null
    let approxCm: { width: number; height: number } | null = null
    if (sidePrints.length > 0) {
      const best = sidePrints.reduce((a, b) =>
        SIZE_PRIORITY.indexOf(b.sizeId) > SIZE_PRIORITY.indexOf(a.sizeId)
          ? b
          : a
      )
      snapped = best.sizeId
      approxCm = best.approxCm ?? null
    }
    const global = design.scpPrintSizeId ?? null
    const mismatch =
      snapped !== null && global !== null && snapped !== global
    return { side, snapped, global, approxCm, mismatch }
  })
}

// ──────────────────────────────────────────────────────────────────────────────
// Widget
// ──────────────────────────────────────────────────────────────────────────────

const OrderCustomizerPrintDetailsWidget = ({
  data,
}: DetailWidgetProps<AdminOrder>) => {
  const orderId = data?.id
  const items = (data?.items ?? []) as unknown as AdminOrderItem[]
  const currency = (data?.currency_code ?? "AUD").toUpperCase()

  if (!orderId) {
    return null
  }

  // Group by product_id — one design per product (matches the PDF grouping)
  const grouped = new Map<string, AdminOrderItem[]>()
  for (const item of items) {
    if (!getDesign(item)) continue
    const key = String(item.product_id ?? item.id)
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(item)
  }

  if (grouped.size === 0) {
    return null
  }

  return (
    <Container className="p-0 border-t border-ui-border-base">
      <div className="px-6 py-4">
        <Heading level="h2" className="flex items-center">
          Print details &amp; cost breakdown
          <HelpTooltip
            text={{
              title: "Print details & cost breakdown",
              body: "Per-line breakdown of print positions, physical dimensions from the customer's Step 3 size choice, and how each unit price splits between garment cost and print decoration.",
              bullets: [
                "Sizes come from the customer's Step 3 choice in the customizer (A6 / A4 / A3 / Oversize).",
                "The cost split is calculated from the product's bulk-pricing metadata — useful for quoting reprints.",
              ],
            }}
          />
        </Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          Per-side print sizes the customer ended up with, and how each unit
          price splits between garment cost and print decoration.
        </Text>
      </div>

      <div className="px-6 pb-5 flex flex-col gap-y-4">
        {Array.from(grouped.entries()).map(([key, groupItems]) => {
          const canonical =
            groupItems.find((it) => getDesign(it)) ?? groupItems[0]
          const design = getDesign(canonical)!
          const sideSummaries = summariseSidesForDesign(design)
          const totalQty = groupItems.reduce(
            (acc, it) => acc + (Number(it.quantity) || 0),
            0
          )
          const pricing = design.pricing
          const productTitle =
            canonical.product_title ?? canonical.title ?? "Product"

          return (
            <div
              key={key}
              className="rounded-md border border-ui-border-base bg-ui-bg-subtle px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Text size="small" weight="plus">
                  {productTitle}
                </Text>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  Total qty {totalQty}
                </Text>
              </div>

              {/* ── Print sizes ──────────────────────────────────────── */}
              <div className="mt-3">
                <Text size="xsmall" weight="plus">
                  Print sizes per side
                </Text>
                {sideSummaries.length === 0 ? (
                  <Text size="xsmall" className="text-ui-fg-subtle mt-1">
                    No decorated sides on record.
                  </Text>
                ) : (
                  <div className="mt-1 rounded-md bg-ui-bg-base">
                    <table className="w-full text-xsmall">
                      <thead className="text-ui-fg-subtle">
                        <tr>
                          <th className="text-left font-medium px-3 py-2">
                            Side
                          </th>
                          <th className="text-left font-medium px-3 py-2">
                            Auto-snapped (per print)
                          </th>
                          <th className="text-left font-medium px-3 py-2">
                            Customer global pick
                          </th>
                          <th className="text-left font-medium px-3 py-2">
                            Approx. (cm)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sideSummaries.map((row) => (
                          <tr
                            key={row.side}
                            className="border-t border-ui-border-base"
                          >
                            <td className="px-3 py-2">
                              {SIDE_LABELS[row.side] ?? row.side}
                            </td>
                            <td className="px-3 py-2">
                              {row.snapped ? (
                                <span className="flex items-center gap-2">
                                  {SIZE_LABELS[row.snapped] ?? row.snapped}
                                  {row.mismatch ? (
                                    <Badge size="2xsmall" color="orange">
                                      ≠ global
                                    </Badge>
                                  ) : null}
                                </span>
                              ) : (
                                <span className="text-ui-fg-muted">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {row.global ? (
                                SIZE_LABELS[row.global] ?? row.global
                              ) : (
                                <span className="text-ui-fg-muted">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-ui-fg-subtle">
                              {row.approxCm
                                ? `${row.approxCm.width} × ${row.approxCm.height}`
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!design.prints || design.prints.length === 0 ? (
                  <Text size="xsmall" className="text-ui-fg-subtle mt-2">
                    No per-print specs (<code>prints[]</code>) stored on this
                    order — only the global size was recorded. (Legacy v2
                    metadata behaves this way.)
                  </Text>
                ) : null}
              </div>

              {/* ── Cost breakdown ──────────────────────────────────── */}
              {pricing ? (
                <div className="mt-4">
                  <Text size="xsmall" weight="plus">
                    Cost breakdown (per unit)
                  </Text>
                  <div className="mt-1 rounded-md bg-ui-bg-base">
                    <table className="w-full text-xsmall">
                      <tbody>
                        <tr>
                          <td className="px-3 py-2 text-ui-fg-subtle">
                            Garment
                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatMoney(pricing.baseUnitPriceCents, currency)}
                          </td>
                        </tr>
                        <tr className="border-t border-ui-border-base">
                          <td className="px-3 py-2 text-ui-fg-subtle">
                            Print surcharge
                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatMoney(
                              pricing.sideSurchargePerUnitCents,
                              currency
                            )}
                          </td>
                        </tr>
                        {pricing.quantityDiscountRate > 0 ? (
                          <tr className="border-t border-ui-border-base">
                            <td className="px-3 py-2 text-ui-fg-subtle">
                              Quantity discount
                            </td>
                            <td className="px-3 py-2 text-right text-ui-fg-subtle">
                              −{(pricing.quantityDiscountRate * 100).toFixed(1)}
                              %
                            </td>
                          </tr>
                        ) : null}
                        <tr className="border-t border-ui-border-base">
                          <td className="px-3 py-2 font-medium">
                            Discounted unit price
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatMoney(
                              pricing.discountedUnitPriceCents,
                              currency
                            )}
                          </td>
                        </tr>
                        <tr className="border-t border-ui-border-base">
                          <td className="px-3 py-2 font-medium">
                            Line total ({totalQty}× units)
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatMoney(
                              pricing.discountedUnitPriceCents * totalQty,
                              currency
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <Text size="xsmall" className="text-ui-fg-subtle mt-2">
                    Print surcharge totals across all decorated sides at the
                    chosen print size. Garment portion is the variant&apos;s
                    list price at the active bulk tier (before the print
                    surcharge).
                  </Text>
                </div>
              ) : (
                <Text size="xsmall" className="text-ui-fg-subtle mt-3">
                  No pricing breakdown stored on this order line.
                </Text>
              )}
            </div>
          )
        })}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  /** Main column, after Summary; sits with the other customizer widgets. */
  zone: "order.details.after",
})

export default withWidgetBoundary(
  OrderCustomizerPrintDetailsWidget,
  "order-customizer-print-details"
)
