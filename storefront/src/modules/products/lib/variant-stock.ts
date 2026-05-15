/**
 * Variant stock-state helpers for the "may delay your order" warning UX.
 *
 * Reads `manage_inventory`, `inventory_quantity`, and `allow_backorder` from
 * the variant (populated via STORE_PRODUCT_FIELDS in `lib/data/products.ts`)
 * and classifies the variant into a kind that the UI maps to a tooltip:
 *
 *  - `unlimited`     — manage_inventory is off; nothing to warn about.
 *  - `in_stock`      — has stock above the low-stock threshold.
 *  - `low_stock`     — has stock but at or below the low-stock threshold.
 *  - `backorder`     — out of stock, but backorder is allowed (will ship late).
 *  - `out_of_stock`  — out of stock and no backorder; not orderable.
 *
 * The "delay" copy is intentionally generic ("may take longer to ship")
 * because neither supplier API exposes real restock ETAs. Tune the threshold
 * via the optional argument; default = 5.
 */
/**
 * Minimal shape of a variant for stock-state classification. Accepts both
 * full Medusa StoreProductVariant objects and the trimmed BundleProductVariant
 * shape used by the bundles store route — both populate these three fields
 * after the inventory-fields expansion.
 */
export type VariantStockInput = {
  manage_inventory?: boolean | null
  allow_backorder?: boolean | null
  inventory_quantity?: number | null
}

export type VariantStockKind =
  | "unlimited"
  | "in_stock"
  | "low_stock"
  | "backorder"
  | "out_of_stock"

export type VariantStockState = {
  kind: VariantStockKind
  /** Current inventory_quantity when known, else null. */
  quantity: number | null
  /** Variant has enough stock to cover `requestedQuantity` outright (false → some/all backordered). */
  fulfillableNow: boolean
}

type AnyVariant = VariantStockInput | undefined | null

/** Default cutoff below which we treat in-stock variants as "running low". */
export const DEFAULT_LOW_STOCK_THRESHOLD = 5

export function getVariantStockState(
  variant: AnyVariant,
  options: { requestedQuantity?: number; lowStockThreshold?: number } = {}
): VariantStockState {
  const threshold = options.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD
  const requested = Math.max(0, options.requestedQuantity ?? 0)

  if (!variant) {
    return { kind: "out_of_stock", quantity: null, fulfillableNow: false }
  }
  if (!variant.manage_inventory) {
    return { kind: "unlimited", quantity: null, fulfillableNow: true }
  }
  const qty = variant.inventory_quantity ?? 0
  if (qty <= 0) {
    return variant.allow_backorder
      ? { kind: "backorder", quantity: 0, fulfillableNow: requested <= 0 }
      : { kind: "out_of_stock", quantity: 0, fulfillableNow: false }
  }
  if (qty <= threshold) {
    return {
      kind: "low_stock",
      quantity: qty,
      fulfillableNow: requested <= qty,
    }
  }
  return { kind: "in_stock", quantity: qty, fulfillableNow: requested <= qty }
}

/**
 * Aggregate stock state for a colour swatch (any number of size variants share
 * the same colour). Used by colour pickers: the swatch shows a warning only
 * when *every* size for that colour is out of stock (and none are backorderable).
 */
export function aggregateStockKind(
  variants: VariantStockInput[]
): VariantStockKind {
  if (!variants.length) return "out_of_stock"
  let anyInStock = false
  let anyLow = false
  let anyBackorder = false
  let anyUnlimited = false
  for (const v of variants) {
    const s = getVariantStockState(v)
    if (s.kind === "unlimited") anyUnlimited = true
    else if (s.kind === "in_stock") anyInStock = true
    else if (s.kind === "low_stock") anyLow = true
    else if (s.kind === "backorder") anyBackorder = true
  }
  if (anyUnlimited || anyInStock) return "in_stock"
  if (anyLow) return "low_stock"
  if (anyBackorder) return "backorder"
  return "out_of_stock"
}

/**
 * Short customer-facing message for the hover/tooltip near a size or colour.
 * Returns null when no warning should be shown (in stock + above threshold).
 */
export function stockWarningMessage(state: VariantStockState): string | null {
  switch (state.kind) {
    case "unlimited":
    case "in_stock":
      return null
    case "low_stock":
      return state.quantity != null && state.quantity > 0
        ? `Only ${state.quantity} in stock — ordering more may add a few extra days to delivery.`
        : "Running low — ordering more may add a few extra days to delivery."
    case "backorder":
      return "Currently out of stock — you can still order, but it may take longer to ship while we restock."
    case "out_of_stock":
      return "Currently out of stock."
  }
}
