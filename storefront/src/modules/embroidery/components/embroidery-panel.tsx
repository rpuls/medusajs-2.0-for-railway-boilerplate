"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import StitchEstimator from "./stitch-estimator"
import { PRICE_LEVELS } from "../lib/pricing"
import type { EmbroideryDesign, EmbroideryPlacement } from "../lib/types"
import { placementCount as resolvePlacementCount } from "../lib/types"
import {
  addEmbroideryLineItemToCartSafe,
  retrieveCart,
} from "@lib/data/cart"
import { buildEmbroideryMetadata } from "@modules/embroidery/lib/metadata"
import type { DecorationDesign } from "@modules/decoration/lib/types"
import {
  extractCartDesigns,
  filterByKind,
  type CartDesignSource,
} from "@lib/util/cart-decorations"

/** Build a minimal EmbroideryDesign for re-seeding the StitchEstimator. */
function buildReusedInitialDesign(
  stitchCount: number
): EmbroideryDesign {
  const level = PRICE_LEVELS[0]
  return {
    type: "artwork",
    stitchCount,
    artwork: { manualStitchCount: stitchCount },
    pricing: {
      level,
      stitchCount,
      quantity: 1,
      effectiveQuantity: 1,
      appliedTier: level.quantityTiers[0],
      unitDecorationPrice: 0,
      decorationSubtotal: 0,
      digitizingFee: 0,
      total: 0,
      belowMinimum: false,
      consolidatedQuantity: false,
      requiresQuote: false,
    },
  }
}

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
  /**
   * When supplied, renders a placement picker above the estimator.
   * Beanies offer ["front", "back", "both"]; other embroidery products
   * default to front-only (omit the prop to hide the picker entirely).
   */
  availablePlacements?: EmbroideryPlacement[]
}

const PLACEMENT_LABEL: Record<EmbroideryPlacement, string> = {
  front: "Front",
  back: "Back",
  left: "Left side",
  right: "Right side",
  // Legacy — only ever rendered if a stale design is rehydrated. New
  // picker offerings split this into separate left/right placements.
  both: "Both sides",
}

const PLACEMENT_HINT: Record<EmbroideryPlacement, string> = {
  front: "Single embroidery on the front.",
  back: "Single embroidery on the back.",
  left: "Single embroidery on the left side.",
  right: "Single embroidery on the right side.",
  both: "Same design on front and back — decoration cost doubles, digitizing fee stays the same.",
}

const EmbroideryPanel: React.FC<EmbroideryPanelProps> = ({
  variantId,
  countryCode,
  onAdded,
  onDesignChange,
  availablePlacements,
}) => {
  // Default to 1 — the customer can scale up from there. Previously
  // defaulted to 24 (a sensible mid-tier number for the legacy wholesale
  // rate card) but that misleads single-piece shoppers into thinking
  // there's a minimum quantity, which there isn't on the new single-rate
  // card.
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [design, setDesign] = useState<EmbroideryDesign | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [placement, setPlacement] = useState<EmbroideryPlacement>(
    availablePlacements?.[0] ?? "front"
  )

  // "Reuse design from cart" wiring: load cart-side embroideries on mount,
  // then let the customer pick one to pre-fill stitch count + placement +
  // quantity. The StitchEstimator is uncontrolled so we bump `reuseKey` to
  // force remount with a fresh `initialDesign` whenever a pick happens.
  const [cartDesigns, setCartDesigns] = useState<CartDesignSource[]>([])
  const [reuseKey, setReuseKey] = useState(0)
  const [reusedInitialDesign, setReusedInitialDesign] =
    useState<EmbroideryDesign | null>(null)
  const [reusedFrom, setReusedFrom] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    void retrieveCart().then((cart) => {
      if (!cart) return
      setCartDesigns(filterByKind(extractCartDesigns(cart), ["embroidery"]))
    })
  }, [])

  const handleReuseDesign = (source: CartDesignSource) => {
    if (!source.embroidery) return
    const placementMatch = (availablePlacements ?? []).includes(
      source.embroidery.placement
    )
      ? source.embroidery.placement
      : (availablePlacements?.[0] ?? source.embroidery.placement)
    setPlacement(placementMatch)
    setReusedInitialDesign(buildReusedInitialDesign(source.embroidery.stitchCount))
    setReuseKey((k) => k + 1)
    setReusedFrom(source.bundleTitle ?? source.productTitle)
    setPickerOpen(false)
  }

  const showPlacementPicker = (availablePlacements?.length ?? 0) > 0
  const placementMultiplier = resolvePlacementCount(placement)

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
      // Stash the placement on the unified design payload so admin/order
      // views can read it without a second metadata key.
      const designWithPlacement: EmbroideryDesign = { ...design, placement }
      const metadata = buildEmbroideryMetadata(designWithPlacement, decoration)
      const result = await addEmbroideryLineItemToCartSafe({
        variantId,
        quantity,
        countryCode,
        metadata,
        stitchCount: design.stitchCount,
        placement,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSuccess(`Added ${quantity} × embroidery line to your cart.`)
      // revalidateTag("cart") on the server side invalidates the
      // fetch cache, but the navbar Cart counter is rendered with a
      // server-fetched snapshot taken on initial page load; without a
      // router.refresh() it keeps showing the stale "Cart (0)" until
      // the customer navigates. Same pattern the customizer uses.
      router.refresh()
      onAdded?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add to cart.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Reuse design from cart — only renders when the customer already has
          embroidery items in their cart. Picking one pre-fills stitch count
          and placement so they don't have to estimate twice. */}
      {cartDesigns.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-lg border border-ui-border-base bg-ui-bg-subtle/40 p-3">
          {!pickerOpen ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ui-fg-base">
                  Reuse a design from your cart
                </p>
                <p className="text-[11px] text-ui-fg-subtle mt-0.5">
                  Apply the same logo settings you&apos;ve already configured on another item.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="shrink-0 rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-1.5 text-xs font-semibold text-ui-fg-base hover:bg-ui-bg-subtle"
              >
                Browse →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-ui-fg-base">
                  Pick a design to reuse
                </p>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="text-[11px] text-ui-fg-muted hover:text-ui-fg-base"
                >
                  Close
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {cartDesigns.map((source) => (
                  <button
                    key={source.lineItemId}
                    type="button"
                    onClick={() => handleReuseDesign(source)}
                    className="flex items-center gap-2.5 rounded-md border border-ui-border-base bg-ui-bg-base p-2.5 text-left hover:border-ui-border-interactive hover:bg-ui-bg-subtle transition"
                  >
                    {source.thumbnail ? (
                      <img
                        src={source.thumbnail}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-md border border-ui-border-base bg-white object-contain"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle text-base">
                        🪡
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ui-fg-base truncate">
                        {source.bundleTitle ?? source.productTitle}
                      </p>
                      {source.embroidery ? (
                        <p className="text-[11px] text-ui-fg-muted">
                          {source.embroidery.stitchCount.toLocaleString()} stitches · {source.embroidery.placement}
                        </p>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {reusedFrom ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-ui-border-base bg-ui-bg-subtle/60 px-3 py-2 text-xs">
          <span className="text-ui-fg-base">
            ✓ Reusing design from <strong>{reusedFrom}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              setReusedFrom(null)
              setReusedInitialDesign(null)
              setReuseKey((k) => k + 1)
            }}
            className="text-ui-fg-muted hover:text-ui-fg-base"
          >
            Reset
          </button>
        </div>
      ) : null}

      {showPlacementPicker && availablePlacements ? (
        <div className="flex flex-col gap-2 rounded-lg border border-ui-border-base bg-ui-bg-subtle/40 p-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-ui-fg-base">
            Embroidery placement
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {availablePlacements.map((option) => {
              const selected = placement === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPlacement(option)}
                  className={`flex flex-col items-start gap-0.5 rounded-md border p-2.5 text-left text-sm transition-colors ${
                    selected
                      ? "border-ui-border-interactive bg-ui-bg-base-pressed"
                      : "border-ui-border-base bg-ui-bg-base hover:bg-ui-bg-subtle"
                  }`}
                >
                  <span className="font-semibold text-ui-fg-base">
                    {PLACEMENT_LABEL[option]}
                  </span>
                  <span className="text-[11px] text-ui-fg-subtle">
                    {option === "both" ? "2× decoration cost" : "1× decoration cost"}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-ui-fg-muted">{PLACEMENT_HINT[placement]}</p>
        </div>
      ) : null}

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
      <StitchEstimator
        key={reuseKey}
        initialDesign={reusedInitialDesign}
        quantity={quantity}
        onDesignChange={handleDesignChange}
        placementCount={placementMultiplier}
      />

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
