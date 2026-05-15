import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import { z } from "zod"

import {
  SCP_PRINT_PRICING_VERSION,
  SCP_BLANK_ALIGNED_QUANTITY_TIERS,
  decoratedLocationsFromLineMetadata,
  decoratedSidesFromLineMetadata,
  isScpPrintSizeId,
  resolveScpTierIndexForQuantity,
  scpPrintTotalMajorFromLocations,
  scpPrintTotalMajorPerGarmentForSides,
  type ScpPrintSizeId,
} from "../../../../../lib/scp-dtf-print-pricing"
import {
  EMBROIDERY_PRICING_VERSION,
  MAX_AUTO_PRICED_STITCHES,
  calculateEmbroideryUnitPriceMajor,
} from "../../../../../lib/embroidery-pricing"
import {
  RemoteJoinerGraphLike,
  resolveGarmentUnitAmountMajor,
} from "../../../../../lib/scp-resolve-garment-unit-price"
import { getPostHog } from "../../../../../lib/posthog"
import { recomputeScpCartPricing } from "../../../../../lib/recompute-scp-cart-pricing"
import {
  classifyCartAddError,
  extractWorkflowErrorMessage,
} from "../../../../../lib/cart-workflow-error"

const cartParamsSchema = z.object({
  id: z.string().min(1),
})

const scpPrintSchema = z.object({
  version: z.number().int().optional(),
  print_size_id: z
    .string()
    .min(1)
    .transform((v) => v.trim()),
})

const bodySchema = z.object({
  variant_id: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(999),
  metadata: z.record(z.string(), z.unknown()).optional(),
  scp_print: scpPrintSchema,
})

/**
 * POST /store/carts/:id/scp-line-items
 *
 * Adds one SCP-priced customizable line using server-computed `unit_price` (garment + tiered print),
 * aligned with blank bulk quantity tiers.
 *
 * QA checklist:
 * - Spot-check cart subtotal / checkout total vs payment intent (Stripe) for qty bands (9→10, 19→20, etc.).
 * - PDP: set product metadata `use_scp_dtf_cart_pricing: true` before expecting SCP pricing on overlay adds.
 * - Note: changing cart line quantity via core update-line-item does not yet recompute SCP `unit_price`.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    return await scpLineItemsPostHandler(req, res)
  } catch (error) {
    // The Medusa framework's default error handler swallows non-MedusaError
    // throws and returns a generic "An unknown error occurred." which makes
    // production failures impossible to diagnose from the storefront. Wrap
    // the whole handler so any plain Error preserves its actual message.
    if (error instanceof MedusaError) {
      throw error
    }
    const detail =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : typeof error === "string"
        ? error
        : "no detail"
    // eslint-disable-next-line no-console
    console.error("scp-line-items handler failed", error)
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `SCP cart-add failed: ${detail}`
    )
  }
}

async function scpLineItemsPostHandler(req: MedusaRequest, res: MedusaResponse) {
  const parsedParams = cartParamsSchema.safeParse(req.params ?? {})
  if (!parsedParams.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid cart id: ${parsedParams.error.message}`
    )
  }

  const parsedBody = bodySchema.safeParse(req.body ?? {})
  if (!parsedBody.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid payload: ${parsedBody.error.issues.map((i) => i.message).join(", ")}`
    )
  }

  const cartId = parsedParams.data.id
  const { variant_id: variantId, quantity, metadata: incomingMetadata, scp_print } = parsedBody.data

  const printSizeRaw = scp_print.print_size_id
  if (!isScpPrintSizeId(printSizeRaw)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Unknown print_size_id "${printSizeRaw}". Expected one of: up_to_a6, up_to_a4, up_to_a3, oversize.`
    )
  }
  const printSizeId: ScpPrintSizeId = printSizeRaw

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as RemoteJoinerGraphLike

  const { data: carts } = await query.graph({
    entity: "cart",
    filters: { id: cartId },
    fields: [
      "id",
      "currency_code",
      "region_id",
      "sales_channel_id",
      "completed_at",
      "region.id",
      "region.currency_code",
    ],
  })

  const cart = carts?.[0] as Record<string, unknown> | undefined
  if (!cart || typeof cart !== "object") {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Cart "${cartId}" was not found.`)
  }

  if (cart.completed_at) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Cannot modify a completed cart.")
  }

  const mergedMetadata: Record<string, unknown> = {
    ...(incomingMetadata ?? {}),
  }

  const decoratedSides = decoratedSidesFromLineMetadata(mergedMetadata)
  if (decoratedSides.length < 1) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "SCP cart pricing requires at least one decorated print location (customizerDesign.artifacts or printPlacement)."
    )
  }

  const tierIndex = resolveScpTierIndexForQuantity(quantity)
  const decoratedLocations = decoratedLocationsFromLineMetadata(mergedMetadata)

  // Read per-side decoration methods (v3 schema). v2 metadata has no
  // entries, so all sides default to "print" — preserves legacy behaviour.
  const customizerDesignForMethods =
    typeof mergedMetadata.customizerDesign === "object" &&
    mergedMetadata.customizerDesign !== null
      ? (mergedMetadata.customizerDesign as Record<string, unknown>)
      : {}
  const sideDecorationMethods =
    typeof customizerDesignForMethods.sideDecorationMethods === "object" &&
    customizerDesignForMethods.sideDecorationMethods !== null
      ? (customizerDesignForMethods.sideDecorationMethods as Record<string, string>)
      : {}
  const sideEmbroideryConfigs =
    typeof customizerDesignForMethods.sideEmbroideryConfigs === "object" &&
    customizerDesignForMethods.sideEmbroideryConfigs !== null
      ? (customizerDesignForMethods.sideEmbroideryConfigs as Record<
          string,
          { stitchCount?: number; includeDigitizingFee?: boolean }
        >)
      : {}

  const printSides = decoratedSides.filter(
    (side) => (sideDecorationMethods[side] ?? "print") === "print"
  )
  const embroiderySides = decoratedSides.filter(
    (side) => sideDecorationMethods[side] === "embroidery"
  )

  // Print pricing: only count print-method sides toward the SCP totals.
  // When per-print locations exist, filter to the print sides; otherwise
  // fall back to side-level totals across the print sides.
  const printLocations = decoratedLocations.filter((loc) => {
    const side = (loc as { side?: string }).side
    return !side || (sideDecorationMethods[side] ?? "print") === "print"
  })
  const printTotalMajor =
    printSides.length === 0
      ? 0
      : printLocations.length > 0
      ? scpPrintTotalMajorFromLocations({
          selectedPrintSizeId: printSizeId,
          tierIndex,
          locations: printLocations,
        })
      : scpPrintTotalMajorPerGarmentForSides({
          selectedPrintSizeId: printSizeId,
          tierIndex,
          decoratedSides: printSides,
        })

  // Embroidery pricing: sum per-side embroidery decoration costs (each
  // amortises its own digitizing fee across the order quantity). Sides
  // whose stitchCount exceeds MAX_AUTO_PRICED_STITCHES are skipped here
  // — production team will manually quote them (POA).
  let embroideryTotalMajor = 0
  const embroideryBreakdown: Array<{
    side: string
    stitchCount: number
    unitDecorationMajor: number
    digitizingFeeMajor: number
    unitPriceMajor: number
    requiresQuote: boolean
  }> = []
  for (const side of embroiderySides) {
    const cfg = sideEmbroideryConfigs[side]
    const stitchCount = Math.max(0, Math.floor(cfg?.stitchCount ?? 0))
    if (stitchCount <= 0) continue
    if (stitchCount > MAX_AUTO_PRICED_STITCHES) {
      embroideryBreakdown.push({
        side,
        stitchCount,
        unitDecorationMajor: 0,
        digitizingFeeMajor: 0,
        unitPriceMajor: 0,
        requiresQuote: true,
      })
      continue
    }
    const result = calculateEmbroideryUnitPriceMajor({
      stitchCount,
      quantity,
      includeDigitizing: cfg?.includeDigitizingFee !== false,
    })
    embroideryTotalMajor += result.unitPriceMajor
    embroideryBreakdown.push({
      side,
      stitchCount,
      unitDecorationMajor: result.unitDecorationMajor,
      digitizingFeeMajor: result.digitizingFeeMajor,
      unitPriceMajor: result.unitPriceMajor,
      requiresQuote: false,
    })
  }

  const garmentMajor = await resolveGarmentUnitAmountMajor({
    query,
    variantId,
    quantity,
    cart: cart as {
      id?: string
      currency_code?: string | null
      region_id?: string | null
      sales_channel_id?: string | null
      region?: { currency_code?: string | null } | null
    },
  })

  const round2 = (n: number) => Math.round(n * 100) / 100
  const unitPriceMajor = round2(
    Math.max(0, garmentMajor) +
      Math.max(0, printTotalMajor) +
      Math.max(0, embroideryTotalMajor)
  )

  const customizerDesignRaw = mergedMetadata.customizerDesign
  const customizerDesign =
    typeof customizerDesignRaw === "object" && customizerDesignRaw !== null
      ? (customizerDesignRaw as Record<string, unknown>)
      : {}

  const pricingRaw = customizerDesign.pricing
  const pricingExisting =
    typeof pricingRaw === "object" && pricingRaw !== null ? (pricingRaw as Record<string, unknown>) : {}

  const mergedCustomizerDesign: Record<string, unknown> = {
    ...customizerDesign,
    pricing: {
      ...pricingExisting,
      server: {
        mode: embroiderySides.length > 0 ? "scp_dtf_mixed" : "scp_dtf",
        version: SCP_PRINT_PRICING_VERSION,
        embroidery_version:
          embroiderySides.length > 0 ? EMBROIDERY_PRICING_VERSION : undefined,
        print_size_id: printSizeId,
        tier_index: tierIndex,
        quantity_tier_label: SCP_BLANK_ALIGNED_QUANTITY_TIERS[tierIndex]?.label ?? null,
        decorated_sides: decoratedSides.length,
        decorated_side_keys: decoratedSides,
        decorated_locations: decoratedLocations,
        print_side_keys: printSides,
        embroidery_side_keys: embroiderySides,
        garment_unit_major: garmentMajor,
        print_total_major_per_garment: printTotalMajor,
        embroidery_total_major_per_garment: embroideryTotalMajor,
        embroidery_breakdown: embroideryBreakdown,
        unit_price_major: unitPriceMajor,
      },
    },
  }

  mergedMetadata.customizerDesign = mergedCustomizerDesign

  // Capture the cart's existing line count so we can verify the workflow
  // actually appended a row. addToCartWorkflow can no-op silently in some
  // edge cases (variant unavailable in region, sales-channel mismatch,
  // calculated_price missing), returning success with the cart unchanged.
  // When that happens the storefront shows a green "added" toast but the
  // cart badge stays at 0. Surfacing it here as a 500 lets the customer
  // retry instead of silently losing the click.
  const beforeRows = await query.graph({
    entity: "cart",
    filters: { id: cartId },
    fields: ["items.id"],
  })
  const beforeCount = ((beforeRows.data?.[0] as { items?: unknown[] } | undefined)?.items ?? []).length

  // Wrap the workflow run so internal failures (workflow steps, DB errors,
  // anything that throws a plain `Error` rather than a `MedusaError`)
  // surface their actual message to the storefront. Without this wrap, the
  // Medusa framework error-handler middleware catches the un-typed error
  // and replies with the generic "An unknown error occurred." — which is
  // exactly what we were seeing in the customizer.
  try {
    await addToCartWorkflow(req.scope).run({
      input: {
        cart_id: cartId,
        items: [
          {
            variant_id: variantId,
            quantity,
            unit_price: unitPriceMajor,
            metadata: mergedMetadata,
          },
        ],
      },
    })
  } catch (workflowError) {
    // Full error (with stack) goes to the Railway logs for debugging; the
    // customer-facing message is sanitised by `classifyCartAddError` so we
    // never leak file paths or stack frames into the storefront UI.
    // eslint-disable-next-line no-console
    console.error(
      `addToCartWorkflow threw (variant=${variantId} qty=${quantity} unit_price=${unitPriceMajor}):`,
      workflowError
    )
    const rawMessage = extractWorkflowErrorMessage(workflowError)
    const { type, message } = classifyCartAddError(rawMessage)
    throw new MedusaError(type, message)
  }

  const afterRows = await query.graph({
    entity: "cart",
    filters: { id: cartId },
    fields: ["items.id", "items.variant_id"],
  })
  const afterItems = ((afterRows.data?.[0] as {
    items?: Array<{ id?: string; variant_id?: string }>
  } | undefined)?.items ?? [])
  const afterCount = afterItems.length
  const matchingItem = afterItems.find((it) => it.variant_id === variantId)

  if (afterCount <= beforeCount || !matchingItem) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `addToCartWorkflow ran but did not append the line (variant ${variantId}, qty ${quantity}, unit_price ${unitPriceMajor}). Cart had ${beforeCount} items before and ${afterCount} after. Likely cause: variant has no calculated_price for this region/currency, or the variant isn't on the cart's sales channel.`
    )
  }

  // Cross-cart bulk-tier aggregation. The just-added line is priced at its
  // own quantity above; this pass re-prices every eligible line (including
  // the new one) based on the total cart quantity of bulk-eligible garments.
  // Idempotent and loop-safe — see `lib/recompute-scp-cart-pricing.ts`.
  let aggregationSummary: { aggregated_quantity: number; updates: number } | undefined
  try {
    const result = await recomputeScpCartPricing(cartId, req.scope)
    aggregationSummary = {
      aggregated_quantity: result.aggregated_quantity,
      updates: result.updates.length,
    }
  } catch (aggError) {
    // Aggregation is a value-add, not load-bearing for the add itself. Log
    // and continue so a transient failure here doesn't break the cart add.
    // eslint-disable-next-line no-console
    console.error("recomputeScpCartPricing failed (non-fatal)", aggError)
  }

  // We don't try to verify the line's `quantity` or `unit_price` value here.
  // Medusa returns those as BigNumber-shaped objects whose runtime structure
  // (`value` vs `numeric` vs raw decimal) varies — every parser we tried
  // either rejected legitimate lines or accepted broken ones. The cart-level
  // assertion above (line appended for `variantId`, count went up) is enough
  // to rule out a silent no-op; storefront-side display issues are caught by
  // the `assertLineItemsLookHealthy` guard in `storefront/src/lib/data/cart.ts`.

  const distinctId = (req as any).auth_context?.actor_id ?? `cart_${cartId}`
  getPostHog()?.capture({
    distinctId,
    event: "scp line item added",
    properties: {
      cart_id: cartId,
      variant_id: variantId,
      quantity,
      unit_price_major: unitPriceMajor,
      print_size_id: printSizeId,
      tier_index: tierIndex,
      quantity_tier_label: SCP_BLANK_ALIGNED_QUANTITY_TIERS[tierIndex]?.label ?? null,
      decorated_sides: decoratedSides.length,
    },
  })

  return res.status(200).json({
    ok: true,
    cart_id: cartId,
    unit_price: unitPriceMajor,
    items_after: afterCount,
    line: {
      id: matchingItem.id ?? null,
    },
    aggregation: aggregationSummary ?? null,
  })
}
