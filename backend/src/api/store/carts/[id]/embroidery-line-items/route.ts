import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import { z } from "zod"

import {
  EMBROIDERY_PRICING_VERSION,
  MAX_AUTO_PRICED_STITCHES,
  calculateEmbroideryUnitPriceMajor,
  resolveEmbroideryQuantityTier,
} from "../../../../../lib/embroidery-pricing"
import {
  RemoteJoinerGraphLike,
  resolveGarmentUnitAmountMajor,
} from "../../../../../lib/scp-resolve-garment-unit-price"
import { getPostHog } from "../../../../../lib/posthog"

const cartParamsSchema = z.object({ id: z.string().min(1) })

const embroiderySchema = z.object({
  version: z.number().int().optional(),
  /** Total stitch count for the design. POA above MAX_AUTO_PRICED_STITCHES. */
  stitch_count: z.coerce.number().int().min(0),
  /** When false, skip the per-design digitizing fee (e.g. reorder of a previously digitized file). */
  include_digitizing: z.boolean().optional().default(true),
  /**
   * Where on the garment the embroidery sits. Each placement is a single
   * embroidery pass; the legacy "both" value (front + back) doubles the
   * decoration unit — kept for back-compat with cart lines created before
   * the picker was split into separate left/right options. New flows
   * never send "both". Defaults to "front" when the client doesn't supply
   * it (back-compat with single-placement embroidery).
   */
  placement: z
    .enum(["front", "back", "left", "right", "both"])
    .optional()
    .default("front"),
})

const bodySchema = z.object({
  variant_id: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(999),
  metadata: z.record(z.string(), z.unknown()).optional(),
  embroidery: embroiderySchema,
})

/**
 * POST /store/carts/:id/embroidery-line-items
 *
 * Adds one embroidery-priced line. Mirrors the SCP route's structure: pricing
 * is computed server-side from the rate card (single price level — wholesale
 * was deprecated), the garment base unit comes from the cart's region, and
 * the digitizing fee is amortised across `quantity` so unit_price stays a
 * single number Medusa can store. Designs above MAX_AUTO_PRICED_STITCHES
 * are rejected — they need a manual quote.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    return await embroideryLineItemsPostHandler(req, res)
  } catch (error) {
    // Same rationale as the SCP route — preserve the actual error message
    // instead of letting the framework swallow it as "An unknown error
    // occurred." Future failures stay diagnosable from the storefront.
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
    console.error("embroidery-line-items handler failed", error)
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Embroidery cart-add failed: ${detail}`
    )
  }
}

async function embroideryLineItemsPostHandler(req: MedusaRequest, res: MedusaResponse) {
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
  const {
    variant_id: variantId,
    quantity,
    metadata: incomingMetadata,
    embroidery,
  } = parsedBody.data

  if (embroidery.stitch_count > MAX_AUTO_PRICED_STITCHES) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Designs above ${MAX_AUTO_PRICED_STITCHES.toLocaleString()} stitches are priced on application — they cannot be added to cart automatically. Use the quote form instead.`
    )
  }

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

  // Per-garment embroidery price + amortised digitizing fee. Returning a
  // single unit_price keeps the Medusa storage model simple; the breakdown
  // lives in metadata so the storefront / admin can display it.
  const placementCountFor = embroidery.placement === "both" ? 2 : 1
  const { unitPriceMajor, unitDecorationMajor, digitizingFeeMajor, tierIndex, tierLabel } =
    calculateEmbroideryUnitPriceMajor({
      stitchCount: embroidery.stitch_count,
      quantity,
      includeDigitizing: embroidery.include_digitizing,
      placementCount: placementCountFor,
    })

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
  const finalUnitPriceMajor = round2(Math.max(0, garmentMajor) + Math.max(0, unitPriceMajor))

  // Stash a server-side breakdown alongside any client-side embroidery
  // metadata so the cart line carries everything an admin needs to invoice
  // correctly (stitch count, fee split, tier).
  const mergedMetadata: Record<string, unknown> = { ...(incomingMetadata ?? {}) }
  const decorationDesignRaw = mergedMetadata.decorationDesign
  const decorationDesign =
    typeof decorationDesignRaw === "object" && decorationDesignRaw !== null
      ? (decorationDesignRaw as Record<string, unknown>)
      : {}

  mergedMetadata.decorationDesign = {
    ...decorationDesign,
    method: "embroidery",
    placement: embroidery.placement,
    serverPricing: {
      mode: "embroidery",
      version: EMBROIDERY_PRICING_VERSION,
      stitch_count: embroidery.stitch_count,
      placement: embroidery.placement,
      placement_count: placementCountFor,
      tier_index: tierIndex,
      quantity_tier_label: tierLabel,
      unit_decoration_major: unitDecorationMajor,
      digitizing_fee_total_major: digitizingFeeMajor,
      digitizing_fee_amortised_per_unit_major:
        quantity > 0 ? round2(digitizingFeeMajor / quantity) : 0,
      garment_unit_major: garmentMajor,
      unit_price_major: finalUnitPriceMajor,
    },
  }

  const beforeRows = await query.graph({
    entity: "cart",
    filters: { id: cartId },
    fields: ["items.id"],
  })
  const beforeCount =
    ((beforeRows.data?.[0] as { items?: unknown[] } | undefined)?.items ?? []).length

  try {
    await addToCartWorkflow(req.scope).run({
      input: {
        cart_id: cartId,
        items: [
          {
            variant_id: variantId,
            quantity,
            unit_price: finalUnitPriceMajor,
            metadata: mergedMetadata,
          },
        ],
      },
    })
  } catch (workflowError) {
    const detail =
      workflowError instanceof Error
        ? `${workflowError.name}: ${workflowError.message}`
        : String(workflowError)
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `addToCartWorkflow failed for embroidery line (variant ${variantId}, qty ${quantity}, unit_price ${finalUnitPriceMajor}). ${detail}`
    )
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
      `Embroidery cart-add ran but did not append the line (variant ${variantId}, qty ${quantity}, unit_price ${finalUnitPriceMajor}).`
    )
  }

  const distinctId = (req as any).auth_context?.actor_id ?? `cart_${cartId}`
  getPostHog()?.capture({
    distinctId,
    event: "embroidery line item added",
    properties: {
      cart_id: cartId,
      variant_id: variantId,
      quantity,
      unit_price_major: finalUnitPriceMajor,
      stitch_count: embroidery.stitch_count,
      placement: embroidery.placement,
      tier_index: tierIndex,
      tier_label: tierLabel,
      include_digitizing: embroidery.include_digitizing,
    },
  })

  res.status(201).json({
    line_item_id: matchingItem.id,
    unit_price_major: finalUnitPriceMajor,
    breakdown: {
      stitch_count: embroidery.stitch_count,
      tier_index: tierIndex,
      tier_label: tierLabel,
      unit_decoration_major: unitDecorationMajor,
      digitizing_fee_total_major: digitizingFeeMajor,
      garment_unit_major: garmentMajor,
    },
  })
}
