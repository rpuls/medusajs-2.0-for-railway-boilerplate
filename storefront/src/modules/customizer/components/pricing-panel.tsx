"use client"

import { useMemo } from "react"

import { convertToLocale } from "@lib/util/money"
import FlyToCartAddButton from "@modules/common/components/fly-to-cart-add-button"
import {
  SCP_BLANK_ALIGNED_QUANTITY_TIERS,
  SCP_PRINT_SIZE_OPTIONS,
  resolveScpTierIndexForQuantity,
  scpPrintTotalMajorPerGarmentForSides,
  resolveScpPrintSizeForSide,
  scpPrintUnitMajorForTier,
  type ScpPrintSizeId,
} from "@modules/customizer/lib/scp-dtf-print-pricing"
import { GarmentSide, PricingBreakdown, SizeQuantity } from "@modules/customizer/lib/types"

type PricingPanelProps = {
  currencyCode: string
  pricing: PricingBreakdown
  sizes: SizeQuantity[]
  onChangeSizeQty: (size: string, quantity: number) => void
  onAddToCart: () => Promise<void>
  isSubmitting: boolean
  /** PDP embed: single size row, shorter copy. */
  embeddedOnPdp?: boolean
  /** When set, Add to cart uses the PDP fly + squish interaction (see fly-to-cart-add-button). */
  flyImageSrc?: string
  /**
   * SCP / DTF tier reference block. Set via product metadata `show_dtf_tier_estimator: true`.
   */
  showDtfTierEstimator?: boolean
  /** Shown with `embeddedOnPdp` as the step index before "Quantity & checkout" (2 or 3). */
  embedPdpQuantityStepNumber?: number
  /** Selected SCP print size (must align with cart pricing). */
  scpPrintSizeId: ScpPrintSizeId
  onScpPrintSizeIdChange: (id: ScpPrintSizeId) => void
  /** Decorated sides used for SCP totals (matches customizer canvas). */
  decoratedSides: GarmentSide[]
  /** When true, breakdown labels reflect SCP tiered print dollars instead of the legacy flat surcharge. */
  scpPricingEnabled?: boolean
  /** Hide the built-in print-size dropdown (when an external picker controls scpPrintSizeId). */
  hidePrintSizeSelector?: boolean
  /** Hide the panel header (when caller renders its own step heading). */
  hideHeader?: boolean
  /** Override the primary CTA label (e.g. "Update cart" in edit-from-cart mode). */
  primaryCtaLabel?: string
  /** Override the busy/loading CTA label. */
  primaryCtaLoadingLabel?: string
  /** Optional secondary action — when provided, renders a "Save design" button below add-to-cart. */
  onSaveDesign?: () => Promise<void>
  /** Whether the save-design action is currently running. */
  isSavingDesign?: boolean
}

const formatMoney = (amount: number, currencyCode: string) =>
  convertToLocale({ amount, currency_code: currencyCode })

const formatTierRange = (minQuantity: number, maxQuantity?: number) =>
  typeof maxQuantity === "number" ? `${minQuantity}-${maxQuantity}` : `${minQuantity}+`

const ExpandCollapsePlus = () => (
  <span className="relative h-5 w-5">
    <span className="absolute inset-y-[31.75%] left-[48%] right-1/2 w-[1.5px] rounded-full bg-ui-fg-subtle transition-all duration-300 group-open:rotate-90" />
    <span className="absolute inset-x-[31.75%] bottom-1/2 top-[48%] h-[1.5px] rounded-full bg-ui-fg-subtle transition-all duration-300 group-open:left-1/2 group-open:right-1/2 group-open:rotate-90" />
  </span>
)

export default function PricingPanel({
  currencyCode,
  pricing,
  sizes,
  onChangeSizeQty,
  onAddToCart,
  isSubmitting,
  embeddedOnPdp = false,
  flyImageSrc,
  showDtfTierEstimator = false,
  embedPdpQuantityStepNumber = 3,
  scpPrintSizeId,
  onScpPrintSizeIdChange,
  decoratedSides,
  scpPricingEnabled = true,
  hidePrintSizeSelector = false,
  hideHeader = false,
  primaryCtaLabel,
  primaryCtaLoadingLabel,
  onSaveDesign,
  isSavingDesign = false,
}: PricingPanelProps) {
  const ctaLabel = primaryCtaLabel ?? "Add to cart"
  const ctaLoadingLabel = primaryCtaLoadingLabel ?? "Adding..."
  const quantity = sizes.reduce((total, entry) => total + entry.quantity, 0)
  const safeEstimatorQuantity = Math.max(1, quantity)

  const safeSides = Array.isArray(decoratedSides) ? decoratedSides.length : 0

  const scpTierIndex = resolveScpTierIndexForQuantity(safeEstimatorQuantity)

  const printUnitMajorPerLocation = useMemo(() => {
    if (safeSides <= 0) {
      return 0
    }
    const firstSide = decoratedSides[0] ?? "front"
    const sizeForFirstSide = resolveScpPrintSizeForSide(firstSide, scpPrintSizeId)
    return scpPrintUnitMajorForTier(sizeForFirstSide, scpTierIndex)
  }, [decoratedSides, scpPrintSizeId, scpTierIndex, safeSides])

  const printPerGarmentMajor = useMemo(
    () =>
      scpPrintTotalMajorPerGarmentForSides({
        selectedPrintSizeId: scpPrintSizeId,
        tierIndex: scpTierIndex,
        decoratedSides,
      }),
    [decoratedSides, scpPrintSizeId, scpTierIndex]
  )

  const estimatedPrintJobMajor = printPerGarmentMajor * safeEstimatorQuantity

  const checkoutTotalCents = pricing.totalPriceCents
  const checkoutUnitCents = pricing.discountedUnitPriceCents

  const printSizeSelect = (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-ui-fg-subtle">Print size (SCP digital)</label>
      <select
        className="w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm"
        value={scpPrintSizeId}
        onChange={(event) => onScpPrintSizeIdChange(event.target.value as ScpPrintSizeId)}
      >
        {SCP_PRINT_SIZE_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label} ({option.dimensionsLabel})
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="space-y-4 rounded-xl border border-ui-border-base bg-ui-bg-base p-4">
      {hideHeader ? null : (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ui-fg-base">
            {embeddedOnPdp
              ? `${embedPdpQuantityStepNumber}. Quantity & checkout`
              : "Size & quantity"}
          </h3>
          <p className="mt-1 text-xs text-ui-fg-subtle">
            Set quantities per size. Totals update with print locations and blank volume tiers.
          </p>
        </div>
      )}

      {hidePrintSizeSelector ? null : printSizeSelect}

      <div className="space-y-2">
        <label className="text-xs font-medium text-ui-fg-subtle">Sizes</label>
        <div className="grid grid-cols-2 gap-2">
          {sizes.map((sizeEntry) => (
            <label
              key={sizeEntry.size}
              className="flex items-center gap-2 rounded-md border border-ui-border-base px-2 py-1.5"
            >
              <span className="w-9 text-xs font-medium">{sizeEntry.size}</span>
              <input
                type="number"
                min={0}
                max={999}
                value={sizeEntry.quantity}
                onFocus={(event) => event.currentTarget.select()}
                onChange={(event) =>
                  onChangeSizeQty(sizeEntry.size, Number(event.target.value))
                }
                className="w-full rounded-md border border-ui-border-base px-2 py-1 text-sm"
              />
            </label>
          ))}
        </div>
      </div>

      {pricing.hasBulkPricing && pricing.bulkPricingTiers?.length ? (
        (() => {
          const tiers = pricing.bulkPricingTiers
          const currentTierIdx = (() => {
            const safeQty = Math.max(1, quantity)
            const idx = tiers.findIndex(
              (t) =>
                safeQty >= t.minQuantity &&
                (typeof t.maxQuantity !== "number" || safeQty <= t.maxQuantity)
            )
            return idx >= 0 ? idx : 0
          })()
          const currentTier = tiers[currentTierIdx]
          const nextTier = tiers[currentTierIdx + 1]
          const unitsToNext = nextTier ? Math.max(0, nextTier.minQuantity - quantity) : 0
          const savings =
            nextTier && currentTier
              ? Math.max(0, currentTier.amountCents - nextTier.amountCents)
              : 0
          return (
            <div className="space-y-2 rounded-lg border border-ui-border-base bg-ui-bg-subtle/40 p-3">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-ui-fg-base">
                  Bulk discounts
                </p>
                {nextTier && unitsToNext > 0 && quantity > 0 ? (
                  <p className="text-[11px] text-emerald-700">
                    Add {unitsToNext} more to save {formatMoney(savings, currencyCode)}/ea
                  </p>
                ) : null}
              </div>
              <ul className="grid grid-cols-1 gap-1 text-xs">
                {tiers.map((tier, idx) => {
                  const isCurrent = idx === currentTierIdx && quantity > 0
                  return (
                    <li
                      key={`${tier.minQuantity}-${tier.maxQuantity ?? "max"}`}
                      className={`flex items-center justify-between rounded px-2 py-1 transition-colors ${
                        isCurrent
                          ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
                          : "text-ui-fg-subtle"
                      }`}
                    >
                      <span className={isCurrent ? "font-semibold" : ""}>
                        {formatTierRange(tier.minQuantity, tier.maxQuantity)} pcs
                      </span>
                      <span className={isCurrent ? "font-semibold" : ""}>
                        {formatMoney(tier.amountCents, currencyCode)} / ea
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })()
      ) : null}

      <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle/60 px-3 py-2.5">
        <p className="flex justify-between text-xs">
          <span className="text-ui-fg-subtle">Unit</span>
          <span className="font-medium text-ui-fg-base">{formatMoney(checkoutUnitCents, currencyCode)}</span>
        </p>
        <p className="mt-1.5 flex justify-between text-sm font-semibold">
          <span className="text-ui-fg-base">
            {quantity > 0 ? `Checkout total (${quantity})` : "Estimated total (qty 1)"}
          </span>
          <span className="text-ui-fg-base">{formatMoney(checkoutTotalCents, currencyCode)}</span>
        </p>
      </div>

      {showDtfTierEstimator ? (
        <details className="group rounded-lg border border-ui-border-base bg-ui-bg-subtle/40 p-3">
          <summary className="cursor-pointer list-none text-xs font-semibold text-ui-fg-base marker:hidden [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-2">
              SCP print tier reference
              <ExpandCollapsePlus />
            </span>
          </summary>
          <div className="mt-3 space-y-3 border-t border-ui-border-base pt-3">
            <div>
              <p className="mt-1 text-xs text-ui-fg-subtle">
                Per garment, per print location. Quantity tiers match blank bulk bands (1–9, 10–19,
                20–49, 50–99, 100+).
              </p>
            </div>

            <p className="flex justify-between text-xs">
              <span className="text-ui-fg-subtle">Applied tier</span>
              <span className="font-medium text-ui-fg-base">
                {SCP_BLANK_ALIGNED_QUANTITY_TIERS[scpTierIndex]?.label ?? "Qty 1–9"}
              </span>
            </p>
            <p className="flex justify-between text-xs">
              <span className="text-ui-fg-subtle">Print / location (this tier)</span>
              <span className="font-medium text-ui-fg-base">
                {formatMoney(printUnitMajorPerLocation, currencyCode)}
              </span>
            </p>
            <p className="flex justify-between text-xs">
              <span className="text-ui-fg-subtle">Print total / garment ({safeSides} loc.)</span>
              <span className="font-medium text-ui-fg-base">
                {formatMoney(printPerGarmentMajor, currencyCode)}
              </span>
            </p>
            <p className="flex justify-between text-sm font-semibold">
              <span className="text-ui-fg-base">Est. print fees ({safeEstimatorQuantity} pcs)</span>
              <span className="text-ui-fg-base">{formatMoney(estimatedPrintJobMajor, currencyCode)}</span>
            </p>
          </div>
        </details>
      ) : null}

      <details className="group rounded-lg border border-ui-border-base bg-ui-bg-subtle/50">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-semibold text-ui-fg-base marker:hidden [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            Price breakdown
            <ExpandCollapsePlus />
          </span>
        </summary>
        <div className="space-y-1 border-t border-ui-border-base px-3 pb-3 pt-2 text-xs">
          <p className="flex justify-between">
            <span>Base unit</span>
            <span>{formatMoney(pricing.baseUnitPriceCents, currencyCode)}</span>
          </p>
          <p className="flex justify-between">
            <span>{scpPricingEnabled ? "SCP print (all locations) / garment" : "Print location surcharge / unit"}</span>
            <span>{formatMoney(pricing.sideSurchargePerUnitCents, currencyCode)}</span>
          </p>
          <p className="flex justify-between">
            <span>Discount</span>
            <span>{Math.round(pricing.quantityDiscountRate * 100)}%</span>
          </p>
          <p className="flex justify-between font-medium">
            <span>Unit after discount</span>
            <span>{formatMoney(pricing.discountedUnitPriceCents, currencyCode)}</span>
          </p>
          <p className="flex justify-between font-semibold text-sm">
            <span>Total ({quantity})</span>
            <span>{formatMoney(pricing.totalPriceCents, currencyCode)}</span>
          </p>
        </div>
      </details>

      {flyImageSrc ? (
        <FlyToCartAddButton
          onAddToCart={() => {
            void onAddToCart()
          }}
          disabled={isSubmitting || quantity <= 0}
          isLoading={isSubmitting}
          className="w-full rounded-xl px-4 py-3.5 text-base font-semibold shadow-sm transition hover:opacity-95 disabled:opacity-50"
          flyImageSrc={flyImageSrc}
        >
          {isSubmitting ? ctaLoadingLabel : ctaLabel}
        </FlyToCartAddButton>
      ) : (
        <button
          type="button"
          onClick={() => {
            void onAddToCart()
          }}
          disabled={isSubmitting || quantity <= 0}
          className="w-full rounded-xl bg-ui-fg-base px-4 py-3.5 text-base font-semibold text-ui-bg-base shadow-sm transition hover:opacity-95 disabled:opacity-50"
        >
          {isSubmitting ? ctaLoadingLabel : ctaLabel}
        </button>
      )}

      {onSaveDesign ? (
        <button
          type="button"
          onClick={() => {
            void onSaveDesign()
          }}
          disabled={isSavingDesign || isSubmitting}
          className="w-full rounded-xl border border-ui-border-base bg-ui-bg-base px-4 py-2.5 text-sm font-medium text-ui-fg-base transition hover:bg-ui-bg-subtle disabled:opacity-50"
        >
          {isSavingDesign ? "Saving design…" : "Save to my designs"}
        </button>
      ) : null}
    </div>
  )
}
