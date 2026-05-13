import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import type { DetailWidgetProps, AdminProductVariant } from "@medusajs/framework/types"
import { withWidgetBoundary } from "../components/widget-error-boundary"

/**
 * Variant detail page — display the qty-band breakdown for the price set.
 *
 * Why: the stock Medusa admin Prices panel lists each AUD amount but does
 * NOT show which `min_quantity` / `max_quantity` band each amount applies
 * to, which makes it hard to verify tier ladders at a glance. This widget
 * reads `variant.metadata.bulk_pricing.tiers` (the canonical array shape
 * written by both the spreadsheet sync and the AS Colour/FashionBiz API
 * importers) and renders a table mapping qty range → unit price.
 *
 * Shape consumed (must match utils/bulk-tier-prices.ts → tierMinorToBulkPricingMetadata):
 *   metadata.bulk_pricing = {
 *     currency_code: "aud",
 *     tiers: [
 *       { min_quantity: 1,   max_quantity: 9,  amount: 15.29 },
 *       { min_quantity: 10,  max_quantity: 19, amount: 13.76 },
 *       ...
 *       { min_quantity: 100, amount: 11.47 },
 *     ],
 *   }
 *
 * Renders nothing when the variant has no bulk_pricing.tiers — the widget
 * is purely informational and shouldn't add visual noise on variants that
 * aren't part of the tier-ladder catalog.
 */

type Tier = {
  min_quantity: number
  max_quantity?: number
  amount: number
}

const parseTiers = (variant: AdminProductVariant | undefined): {
  currencyCode: string
  tiers: Tier[]
} => {
  const meta = ((variant?.metadata ?? {}) as Record<string, unknown>) ?? {}
  const bulk = (meta.bulk_pricing ?? {}) as Record<string, unknown>
  const rawTiers = Array.isArray(bulk.tiers) ? (bulk.tiers as Array<Record<string, unknown>>) : []
  const tiers: Tier[] = rawTiers
    .map((t) => {
      const min = Number(t.min_quantity)
      const max = Number(t.max_quantity)
      const amount = Number(t.amount)
      if (!Number.isFinite(min) || !Number.isFinite(amount)) return null
      return {
        min_quantity: min,
        max_quantity: Number.isFinite(max) ? max : undefined,
        amount,
      }
    })
    .filter((t): t is Tier => t !== null)
    .sort((a, b) => a.min_quantity - b.min_quantity)

  const currencyCode =
    typeof bulk.currency_code === "string" && bulk.currency_code.length
      ? String(bulk.currency_code).toUpperCase()
      : "AUD"

  return { currencyCode, tiers }
}

const formatRange = (tier: Tier): string =>
  typeof tier.max_quantity === "number"
    ? tier.min_quantity === tier.max_quantity
      ? `${tier.min_quantity}`
      : `${tier.min_quantity}–${tier.max_quantity}`
    : `${tier.min_quantity}+`

const formatAmount = (amount: number, currency: string): string =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

const VariantBulkPricingWidget = ({ data }: DetailWidgetProps<AdminProductVariant>) => {
  const { currencyCode, tiers } = parseTiers(data)

  // Nothing to show — render null so the widget zone collapses cleanly.
  if (!tiers.length) {
    return null
  }

  // Lowest-amount tier is the "best price" you can hit by ordering up.
  const lowestAmount = tiers.reduce(
    (acc, t) => (t.amount < acc ? t.amount : acc),
    tiers[0].amount
  )

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Bulk pricing</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Quantity-band breakdown — read from{" "}
            <code>metadata.bulk_pricing.tiers</code>
          </Text>
        </div>
        <Text size="small" className="text-ui-fg-subtle">
          Best price{" "}
          <span className="font-semibold text-ui-fg-base">
            {formatAmount(lowestAmount, currencyCode)}
          </span>
        </Text>
      </div>
      <div className="px-6 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ui-fg-subtle">
              <th className="pb-2 font-medium">Quantity</th>
              <th className="pb-2 font-medium text-right">Unit price ({currencyCode})</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => (
              <tr
                key={`${tier.min_quantity}-${tier.max_quantity ?? "max"}`}
                className="border-t border-ui-border-base"
              >
                <td className="py-2 font-medium text-ui-fg-base">
                  {formatRange(tier)} pcs
                </td>
                <td className="py-2 text-right font-mono tabular-nums text-ui-fg-base">
                  {formatAmount(tier.amount, currencyCode)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_variant.details.after",
})

export default withWidgetBoundary(VariantBulkPricingWidget, "variant-bulk-pricing")
