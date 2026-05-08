import { calculatePrice as calcEmbroidery, RETAIL_CONFIG } from "@modules/embroidery/lib/pricing"
import type { PricingConfig } from "@modules/embroidery/lib/types"
import { splitGst } from "../gst"
import { getRushSurcharge } from "../rush"
import type { Breakdown, RushTier } from "../types"

export type EmbroideryInput = {
  stitchCount: number
  quantity: number
  config?: PricingConfig
  consolidatedQuantity?: boolean
  includeDigitizing?: boolean
  rushTier?: RushTier
  reorder?: boolean
}

/** Adapter to the existing embroidery pricing model — kept as the source of truth. */
export const calculateEmbroideryPrice = ({
  stitchCount,
  quantity,
  config = RETAIL_CONFIG,
  consolidatedQuantity = false,
  includeDigitizing = true,
  rushTier = "standard",
  reorder = false,
}: EmbroideryInput): Breakdown => {
  const inner = calcEmbroidery({
    config,
    stitchCount,
    quantity,
    consolidatedQuantity,
    includeDigitizing: includeDigitizing && !reorder,
  })

  const rushSurcharge = getRushSurcharge("embroidery", rushTier)
  const subtotalExGstRaw = inner.decorationSubtotal + inner.digitizingFee + rushSurcharge
  const { exGst, gst, incGst } = splitGst(subtotalExGstRaw)

  const notes: string[] = []
  if (inner.digitizingFee > 0) notes.push(`$${inner.digitizingFee} digitizing fee (waived on reorders).`)
  if (inner.belowMinimum) notes.push(`Quantity below minimum (${config.minimumQuantity}).`)

  return {
    method: "embroidery",
    unitPrice: inner.unitDecorationPrice,
    quantity: inner.quantity,
    decorationSubtotal: inner.decorationSubtotal,
    setupTotal: inner.digitizingFee,
    rushSurcharge,
    subtotalExGst: exGst,
    gst,
    totalIncGst: incGst,
    belowMinimum: inner.belowMinimum,
    rushTier,
    notes: notes.length ? notes : undefined,
    requiresQuote: inner.requiresQuote,
  }
}

export { RETAIL_CONFIG, WHOLESALE_CONFIG, PRICE_LEVELS } from "@modules/embroidery/lib/pricing"
