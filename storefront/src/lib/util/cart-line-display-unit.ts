import { HttpTypes } from "@medusajs/types"

import { getDisplayUnitMinorForVariant, getPricesForVariant } from "@lib/util/get-product-price"

/** Merge common PDP fallbacks so AS Colour pricing finalizers still run on cart lines. */
export function variantWithInferredHandleForLineItem(
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
): unknown {
  const itemRecord = item as unknown as {
    variant?: Record<string, unknown> & { product?: { handle?: string } }
    product_handle?: string
    metadata?: Record<string, unknown>
  }
  const inferredHandle =
    (typeof itemRecord.variant?.product?.handle === "string" &&
      itemRecord.variant.product.handle) ||
    (typeof itemRecord.product_handle === "string" && itemRecord.product_handle) ||
    (typeof itemRecord.metadata?.product_handle === "string" &&
      (itemRecord.metadata.product_handle as string)) ||
    undefined
  const variantForPricing = inferredHandle
    ? {
        ...(itemRecord.variant as Record<string, unknown>),
        product: {
          ...(itemRecord.variant?.product ?? {}),
          handle: inferredHandle,
        },
      }
    : itemRecord.variant
  return variantForPricing
}

/** Cart line added via SCP `/store/carts/:id/scp-line-items` carries Medusa custom unit pricing. */
export function cartLineUsesExplicitUnitPrice(
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
): boolean {
  const rec = item as {
    is_custom_price?: boolean
    unit_price?: unknown
    metadata?: Record<string, unknown> | null
  }
  const validUnitPrice =
    typeof rec.unit_price === "number" && Number.isFinite(rec.unit_price)
  if (!validUnitPrice) return false
  // Path A: Medusa explicitly flagged the line as having a custom price.
  if (rec.is_custom_price === true) return true
  // Path B: the cart-retrieve response doesn't always carry `is_custom_price`
  // (Medusa's default field selection trims it on some payloads, especially
  // at checkout where enrichLineItems replaces the variant). For SCP
  // customizer lines we can still recognise the line by its server-stamped
  // pricing block on metadata — and we MUST honour `unit_price` there,
  // because it bundles the print surcharge that the variant's
  // `calculated_price` alone doesn't know about. Without this fallback,
  // checkout silently strips the print component from the customer total.
  const customizerDesign = rec.metadata?.customizerDesign as
    | Record<string, unknown>
    | undefined
  if (customizerDesign && typeof customizerDesign === "object") {
    const pricing = customizerDesign.pricing as Record<string, unknown> | undefined
    if (pricing?.server && typeof pricing.server === "object") return true
  }
  return false
}

export function resolveCartLineDisplayUnitMinor(
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem,
  variantForPricing: unknown
): number {
  if (cartLineUsesExplicitUnitPrice(item)) {
    const v = (item as { unit_price: number }).unit_price
    return typeof v === "number" && Number.isFinite(v) ? v : 0
  }
  const v = variantForPricing as {
    calculated_price?: { calculated_amount?: number }
  }
  if (!v?.calculated_price?.calculated_amount) {
    return 0
  }
  return getDisplayUnitMinorForVariant(v)
}

/** Locale + comparison helpers for components that previously called `getPricesForVariant` directly. */
export function getPricesForCartLineVariant(variantForPricing: unknown) {
  return getPricesForVariant(variantForPricing)
}
