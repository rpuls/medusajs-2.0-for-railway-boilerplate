import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Switch, Text, toast } from "@medusajs/ui"
import type { DetailWidgetProps, AdminProductVariant } from "@medusajs/framework/types"
import { useState } from "react"

import { withWidgetBoundary } from "../components/widget-error-boundary"

/**
 * Variant detail page — toggle cross-cart bulk-tier aggregation opt-out.
 *
 * The cart-wide aggregation defaults to including every variant that has
 * `metadata.bulk_pricing.tiers`. This widget lets staff opt a variant out
 * (DTF gang sheets, vectorization service, anything that shouldn't share a
 * tier with garments). Toggle stores `metadata.exclude_from_bulk_aggregation`
 * via POST /admin/variants/:id/bulk-aggregation.
 *
 * Renders only on variants whose bulk_pricing is set — there's nothing to
 * opt-out of when no tier ladder exists.
 */

const VariantBulkAggregationFlagWidget = ({
  data: variant,
}: DetailWidgetProps<AdminProductVariant>) => {
  const meta = (variant?.metadata ?? {}) as Record<string, unknown>
  const hasTiers =
    typeof meta.bulk_pricing === "object" &&
    meta.bulk_pricing !== null &&
    Array.isArray((meta.bulk_pricing as { tiers?: unknown }).tiers)

  const initialExcluded = meta.exclude_from_bulk_aggregation === true
  const [excluded, setExcluded] = useState<boolean>(initialExcluded)
  const [busy, setBusy] = useState(false)

  if (!hasTiers || !variant?.id) return null

  const handleToggle = async (next: boolean) => {
    setBusy(true)
    const previous = excluded
    setExcluded(next)
    try {
      const res = await fetch(`/admin/variants/${variant.id}/bulk-aggregation`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exclude_from_bulk_aggregation: next }),
      })
      if (!res.ok) {
        throw new Error(`Update failed (${res.status})`)
      }
      toast.success(
        next
          ? "Variant excluded from cross-cart bulk aggregation."
          : "Variant will aggregate with the rest of the cart."
      )
    } catch (error) {
      setExcluded(previous)
      toast.error(
        error instanceof Error ? error.message : "Could not update aggregation flag."
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="max-w-md">
          <Heading level="h2">Cross-cart bulk aggregation</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            When enabled, this variant's quantity counts toward the cart-wide
            bulk-tier discount and gets the aggregated tier price. Turn it off
            for niche SKUs (e.g. DTF gang sheet) that should always use their
            own per-line tier.
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <Text size="small" className="text-ui-fg-subtle">
            {excluded ? "Excluded" : "Included"}
          </Text>
          <Switch
            checked={!excluded}
            onCheckedChange={(checked) => handleToggle(!checked)}
            disabled={busy}
          />
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_variant.details.after",
})

export default withWidgetBoundary(
  VariantBulkAggregationFlagWidget,
  "variant-bulk-aggregation-flag"
)
