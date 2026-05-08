import type {
  Breakdown,
  PricingConfig,
  QuantityTier,
  StitchTier,
} from "./types"

/**
 * Customer-facing rate card. Quantity tiers and stitch tiers come straight
 * from the SC Prints embroidery price sheet — see CLAUDE.md (embroidery
 * pricing) for the source. Wholesale tier was deprecated in favour of a
 * single rate applied to everyone.
 *
 * The pricing matrix below is effectively:
 *
 *                         1–25  26–50  51–100  101–250  251–500  501+
 *   up to 3,000 stitches  10.50  9.50   7.50    5.50     4.50    3.50
 *   up to 4,000           10.75  9.75   7.75    5.75     4.75    3.75
 *   up to 5,000           11.00 10.00   8.00    6.00     5.00    4.00
 *   up to 6,000           11.25 10.25   8.25    6.25     5.25    4.25
 *   up to 7,000           11.50 10.50   8.50    6.50     5.50    4.50
 *   up to 8,000           11.75 10.75   8.75    6.75     5.75    4.75
 *   up to 9,000           12.00 11.00   9.00    7.00     6.00    5.00
 *   up to 10,000          12.25 11.25   9.25    7.25     6.25    5.25
 *   up to 11,000          12.50 11.50   9.50    7.50     6.50    5.50
 *   up to 12,000          12.75 11.75   9.75    7.75     6.75    5.75
 *   12,000+               POA   POA    POA     POA      POA     POA
 */
const QUANTITY_TIERS: QuantityTier[] = [
  { minQuantity: 1, label: "1–25" },
  { minQuantity: 26, label: "26–50" },
  { minQuantity: 51, label: "51–100" },
  { minQuantity: 101, label: "101–250" },
  { minQuantity: 251, label: "251–500" },
  { minQuantity: 501, label: "501+" },
]

const STITCH_TIERS: StitchTier[] = [
  { maxStitches: 3000, prices: [10.5, 9.5, 7.5, 5.5, 4.5, 3.5] },
  { maxStitches: 4000, prices: [10.75, 9.75, 7.75, 5.75, 4.75, 3.75] },
  { maxStitches: 5000, prices: [11.0, 10.0, 8.0, 6.0, 5.0, 4.0] },
  { maxStitches: 6000, prices: [11.25, 10.25, 8.25, 6.25, 5.25, 4.25] },
  { maxStitches: 7000, prices: [11.5, 10.5, 8.5, 6.5, 5.5, 4.5] },
  { maxStitches: 8000, prices: [11.75, 10.75, 8.75, 6.75, 5.75, 4.75] },
  { maxStitches: 9000, prices: [12.0, 11.0, 9.0, 7.0, 6.0, 5.0] },
  { maxStitches: 10000, prices: [12.25, 11.25, 9.25, 7.25, 6.25, 5.25] },
  { maxStitches: 11000, prices: [12.5, 11.5, 9.5, 7.5, 6.5, 5.5] },
  { maxStitches: 12000, prices: [12.75, 11.75, 9.75, 7.75, 6.75, 5.75] },
  // Anything past 12,000 stitches is "Price on application" — pricing is
  // unavailable on the storefront and the cart layer must redirect the
  // customer to a quote form.
  { maxStitches: null, prices: [], isPoaRow: true },
]

/** Standard customer-facing embroidery rate. Single price level (wholesale dropped). */
export const STANDARD_CONFIG: PricingConfig = {
  id: "standard",
  label: "Standard",
  minimumQuantity: 1,
  digitizingFee: 60,
  quantityTiers: QUANTITY_TIERS,
  stitchTiers: STITCH_TIERS,
}

/**
 * Back-compat aliases. Older callers reference RETAIL_CONFIG / WHOLESALE_CONFIG
 * by name; both now resolve to the single STANDARD_CONFIG until those call sites
 * migrate. PRICE_LEVELS is similarly collapsed to one entry.
 */
export const RETAIL_CONFIG = STANDARD_CONFIG
export const WHOLESALE_CONFIG = STANDARD_CONFIG
export const PRICE_LEVELS: PricingConfig[] = [STANDARD_CONFIG]
export const DEFAULT_PRICING_CONFIG = STANDARD_CONFIG

/** Maximum auto-priceable stitch count. Above this the breakdown sets `requiresQuote: true`. */
export const MAX_AUTO_PRICED_STITCHES = 12000

const findQuantityTierIndex = (config: PricingConfig, quantity: number) => {
  let index = 0
  for (let i = 0; i < config.quantityTiers.length; i++) {
    if (quantity >= config.quantityTiers[i].minQuantity) {
      index = i
    }
  }
  return index
}

const findFlatStitchTier = (config: PricingConfig, stitches: number) => {
  return config.stitchTiers.find(
    (tier) =>
      !tier.isIncrementalRow &&
      !tier.isPoaRow &&
      tier.maxStitches !== null &&
      stitches <= tier.maxStitches
  )
}

const findHighestFlatTier = (config: PricingConfig) => {
  const flatTiers = config.stitchTiers.filter(
    (tier): tier is StitchTier & { maxStitches: number } =>
      !tier.isIncrementalRow && !tier.isPoaRow && tier.maxStitches !== null
  )
  return flatTiers[flatTiers.length - 1]
}

const findIncrementalTier = (config: PricingConfig) =>
  config.stitchTiers.find((tier) => tier.isIncrementalRow)

const hasPoaRow = (config: PricingConfig) =>
  config.stitchTiers.some((tier) => tier.isPoaRow)

export type CalculatePriceInput = {
  config?: PricingConfig
  stitchCount: number
  quantity: number
  /** When true, treat orderQuantity as already-consolidated across placements. */
  consolidatedQuantity?: boolean
  includeDigitizing?: boolean
}

export const calculatePrice = ({
  config = DEFAULT_PRICING_CONFIG,
  stitchCount,
  quantity,
  consolidatedQuantity = false,
  includeDigitizing = true,
}: CalculatePriceInput): Breakdown => {
  const safeStitches = Math.max(0, Math.round(stitchCount))
  const safeQuantity = Math.max(1, Math.round(quantity))
  const effectiveQuantity = consolidatedQuantity ? safeQuantity : safeQuantity
  const tierIndex = findQuantityTierIndex(config, effectiveQuantity)
  const appliedTier = config.quantityTiers[tierIndex]

  // POA path: no flat tier matches AND the config has a POA row. Bail out
  // with zeroes + requiresQuote so the cart layer can swap "Add to cart"
  // for a quote CTA instead of letting the customer check out.
  const flatTier = findFlatStitchTier(config, safeStitches)
  if (!flatTier && hasPoaRow(config)) {
    return {
      level: config,
      stitchCount: safeStitches,
      quantity: safeQuantity,
      effectiveQuantity,
      appliedTier,
      unitDecorationPrice: 0,
      decorationSubtotal: 0,
      digitizingFee: 0,
      total: 0,
      belowMinimum: safeQuantity < config.minimumQuantity,
      consolidatedQuantity,
      requiresQuote: true,
    }
  }

  let unitDecorationPrice = 0
  if (flatTier) {
    unitDecorationPrice = flatTier.prices[tierIndex]
  } else {
    const highest = findHighestFlatTier(config)
    const incremental = findIncrementalTier(config)
    if (highest && incremental && highest.maxStitches !== null) {
      const overflow = Math.max(0, safeStitches - highest.maxStitches)
      const blocks = Math.ceil(overflow / 1000)
      unitDecorationPrice =
        highest.prices[tierIndex] + blocks * incremental.prices[tierIndex]
    } else {
      unitDecorationPrice = 0
    }
  }

  const decorationSubtotal = unitDecorationPrice * safeQuantity
  const digitizingFee = includeDigitizing ? config.digitizingFee : 0
  const total = decorationSubtotal + digitizingFee

  return {
    level: config,
    stitchCount: safeStitches,
    quantity: safeQuantity,
    effectiveQuantity,
    appliedTier,
    unitDecorationPrice,
    decorationSubtotal,
    digitizingFee,
    total,
    belowMinimum: safeQuantity < config.minimumQuantity,
    consolidatedQuantity,
    requiresQuote: false,
  }
}

/** Returns the rendered price grid for display. Each cell is per-unit decoration price. */
export const buildPriceTable = (config: PricingConfig = DEFAULT_PRICING_CONFIG) => ({
  quantityTiers: config.quantityTiers,
  rows: config.stitchTiers.map((tier) => ({
    label: tier.isIncrementalRow
      ? "+1,000 stitches"
      : tier.isPoaRow
      ? "12,000+ (Price on application)"
      : tier.maxStitches !== null
      ? `Up to ${tier.maxStitches.toLocaleString()}`
      : "",
    isIncrementalRow: Boolean(tier.isIncrementalRow),
    isPoaRow: Boolean(tier.isPoaRow),
    prices: tier.prices,
  })),
})
