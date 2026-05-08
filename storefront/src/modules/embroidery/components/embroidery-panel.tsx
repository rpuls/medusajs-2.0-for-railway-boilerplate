"use client"

import React, { useMemo, useState } from "react"
import StitchEstimator from "./stitch-estimator"
import type { EmbroideryDesign } from "../lib/types"
import {
  addEmbroideryLineItemToCartSafe,
} from "@lib/data/cart"
import { buildEmbroideryMetadata } from "@modules/embroidery/lib/metadata"
import type { DecorationDesign } from "@modules/decoration/lib/types"

type EmbroideryPanelProps = {
  /**
   * Optional cart wiring. When all three are supplied the panel renders an
   * "Add to cart" button under the estimator and posts to the embroidery
   * line-item route. Without them the panel is preview-only — useful in
   * marketing pages and the legacy /customizer route.
   */
  variantId?: string | null
  countryCode?: string
  onAdded?: () => void
  onDesignChange?: (design: EmbroideryDesign | null) => void
}

const EmbroideryPanel: React.FC<EmbroideryPanelProps> = ({
  variantId,
  countryCode,
  onAdded,
  onDesignChange,
}) => {
  const [quantity, setQuantity] = useState(24)
  const [design, setDesign] = useState<EmbroideryDesign | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleDesignChange = (next: EmbroideryDesign | null) => {
    setDesign(next)
    onDesignChange?.(next)
  }

  const cartReady = Boolean(variantId && countryCode)
  const requiresQuote = design?.pricing.requiresQuote === true
  const hasStitches = (design?.stitchCount ?? 0) > 0

  const addToCartDisabled =
    !cartReady ||
    !design ||
    submitting ||
    requiresQuote ||
    !hasStitches ||
    quantity < 1

  // Disable reason — surfaced in the button title so customers know why
  // the CTA is greyed out without a separate inline error.
  const disabledReason = useMemo(() => {
    if (submitting) return "Adding to cart..."
    if (!cartReady) return "Pick a variant first."
    if (requiresQuote) return "Designs over 12,000 stitches need a manual quote."
    if (!hasStitches) return "Build your design or enter a stitch count first."
    if (quantity < 1) return "Quantity must be at least 1."
    return ""
  }, [cartReady, hasStitches, quantity, requiresQuote, submitting])

  const handleAddToCart = async () => {
    if (!cartReady || !design || !variantId || !countryCode) return
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      // Build cart-line metadata from the unified DecorationDesign shape so
      // both admin and storefront read it via `getDecorationMetadata`.
      const decoration: DecorationDesign = {
        method: "embroidery",
        // Server will overwrite the breakdown with its own authoritative copy
        // (see /store/carts/:id/embroidery-line-items). Client-side breakdown
        // is informational only — what reaches the cart line is whatever the
        // backend route writes.
        breakdown: {
          method: "embroidery",
          unitPrice: design.pricing.unitDecorationPrice,
          quantity: design.pricing.quantity,
          decorationSubtotal: design.pricing.decorationSubtotal,
          setupTotal: design.pricing.digitizingFee,
          rushSurcharge: 0,
          subtotalExGst: design.pricing.total,
          gst: 0,
          totalIncGst: design.pricing.total,
          belowMinimum: design.pricing.belowMinimum,
          rushTier: "standard",
          requiresQuote: design.pricing.requiresQuote,
        },
        rushTier: "standard",
        details: { method: "embroidery", stitchCount: design.stitchCount },
      }
      const metadata = buildEmbroideryMetadata(design, decoration)
      const result = await addEmbroideryLineItemToCartSafe({
        variantId,
        quantity,
        countryCode,
        metadata,
        stitchCount: design.stitchCount,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSuccess(`Added ${quantity} × embroidery line to your cart.`)
      onAdded?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add to cart.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-3 text-sm">
        <span className="w-28 text-ui-fg-subtle">Quantity</span>
        <input
          type="number"
          min={1}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="w-28 rounded-md border border-ui-border-base px-3 py-2"
        />
      </label>
      <StitchEstimator quantity={quantity} onDesignChange={handleDesignChange} />

      {/*
        Cart-add CTA only renders when the parent supplied variant + country.
        Marketing surfaces (services pages, legacy /customizer route) embed
        the panel as preview-only and can ignore this entirely.
      */}
      {cartReady ? (
        <div className="flex flex-col gap-2">
          {error ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {success}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={addToCartDisabled}
            title={disabledReason || undefined}
            className="w-full rounded-xl bg-ui-fg-base px-4 py-3 text-base font-semibold text-ui-bg-base shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Adding to cart..." : "Add embroidery to cart"}
          </button>
          {disabledReason && !success ? (
            <p className="text-xs text-ui-fg-subtle">{disabledReason}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default EmbroideryPanel
