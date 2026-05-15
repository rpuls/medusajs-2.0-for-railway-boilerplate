import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

import { useProductOptions } from "@modules/products/context/product-options-context"
import { sortGarmentColorLabels } from "@modules/products/lib/garment-color-order"
import { sortApparelSizeLabels } from "@modules/products/lib/apparel-size-order"
import { getColorSwatchImageMap } from "@modules/products/lib/color-swatch-images"
import { resolveGarmentSwatchColor } from "@modules/products/lib/garment-swatch-colors"
import { isColorOptionTitle, toTitleSlug } from "@modules/products/lib/variant-options"
import {
  aggregateStockKind,
  getVariantStockState,
  stockWarningMessage,
} from "@modules/products/lib/variant-stock"
import StockWarningIcon from "@modules/products/components/stock-warning-icon"

type OptionSelectProps = {
  product: HttpTypes.StoreProduct
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  product,
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const { setColorHoverPreview, options: selectedOptions } = useProductOptions()
  const rawOptionValues = option.values?.map((v) => v.value)
  const isColorOption = isColorOptionTitle(title)
  const isSizeOption = !isColorOption && /size/i.test(title)
  const stringValues = (rawOptionValues ?? []).filter(
    (v): v is string => v != null && v !== ""
  )
  const filteredOptions =
    isSizeOption && stringValues.length
      ? sortApparelSizeLabels([...stringValues])
      : isColorOption && stringValues.length
        ? sortGarmentColorLabels([...stringValues])
        : rawOptionValues
  const colorSwatchImageMap = isColorOption ? getColorSwatchImageMap(product, title) : null

  /**
   * Find every variant that matches a given (this option = this value)
   * AND every *other* selected option already chosen. Used to decide whether
   * a size pill or colour swatch deserves a stock-warning `!`.
   */
  const variantsForOptionValue = (value: string) => {
    const otherOptionTitles = (product.options ?? [])
      .map((o) => o.title ?? "")
      .filter((t) => t && t !== title)
    return (product.variants ?? []).filter((variant) => {
      const variantOptionValue = variant.options?.find(
        (vo) => vo.option_id === option.id
      )?.value
      if (variantOptionValue !== value) return false
      // Honour other already-selected options so e.g. picking "Black" then
      // viewing size pills only considers Black variants for stock.
      for (const otherTitle of otherOptionTitles) {
        const otherSelected = selectedOptions[otherTitle]
        if (!otherSelected) continue
        const otherOpt = product.options?.find((o) => o.title === otherTitle)
        if (!otherOpt) continue
        const variantOtherValue = variant.options?.find(
          (vo) => vo.option_id === otherOpt.id
        )?.value
        if (variantOtherValue !== otherSelected) return false
      }
      return true
    })
  }

  return (
    <div
      className={clx("flex flex-wrap gap-2 text-small-regular pt-2 pb-1 overflow-visible", {
        "justify-start": isColorOption,
        "justify-between": !isColorOption,
      })}
      data-testid={dataTestId}
      onPointerLeave={
        isColorOption
          ? () => {
              setColorHoverPreview(null)
            }
          : undefined
    }
    >
      {filteredOptions?.map((v) => {
        const isSelected = v === current
        const normalizedValue = toTitleSlug(v ?? "")
        const swatchImage = colorSwatchImageMap?.get(normalizedValue)

        // Stock-warning resolution. Sizes use the single matching variant
        // (per other selected options) and pull a per-size message from
        // `getVariantStockState`. Colour swatches aggregate across all sizes
        // for that colour and only warn when the *whole colour* is gone /
        // backorder-only — per-size nuance comes from the size pickers.
        const matchingVariants =
          v != null && v !== "" ? variantsForOptionValue(v) : []
        let stockWarning: { message: string; kind: ReturnType<typeof aggregateStockKind> } | null = null
        if (matchingVariants.length > 0) {
          if (isColorOption) {
            const aggKind = aggregateStockKind(matchingVariants)
            if (aggKind === "out_of_stock") {
              stockWarning = {
                message: "All sizes in this colour are out of stock.",
                kind: aggKind,
              }
            } else if (aggKind === "backorder") {
              stockWarning = {
                message:
                  "Currently out of stock — you can still order, but it may take longer to ship while we restock.",
                kind: aggKind,
              }
            }
          } else {
            // Sizes / other options: use the single matching variant.
            const state = getVariantStockState(matchingVariants[0])
            const msg = stockWarningMessage(state)
            if (msg) stockWarning = { message: msg, kind: state.kind }
          }
        }

        if (isColorOption) {
          return (
            <div key={v} className="group/swatch relative overflow-visible">
              <button
                onPointerEnter={() => {
                  if (v != null && v !== "") {
                    setColorHoverPreview(v)
                  }
                }}
                onClick={() => updateOption(option.title ?? "", v ?? "")}
                data-no-squish
                className={clx(
                  "h-8 w-8 rounded-full border transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-fg-base focus-visible:ring-offset-2",
                  {
                    "border-[var(--brand-accent)] ring-2 ring-[var(--brand-accent)] ring-offset-1":
                      isSelected,
                    "border-ui-border-base hover:scale-105 hover:border-[var(--brand-secondary)] hover:ring-2 hover:ring-[var(--brand-secondary)] hover:ring-offset-1":
                      !isSelected,
                  }
                )}
                style={{
                  backgroundColor: resolveGarmentSwatchColor(v ?? ""),
                  backgroundImage: swatchImage ? `url("${swatchImage}")` : undefined,
                  backgroundSize: swatchImage ? "235%" : "cover",
                  backgroundPosition: swatchImage ? "center 35%" : "center",
                }}
                disabled={disabled}
                data-testid="option-button"
                aria-label={`Select ${title} ${v}`}
              />
              {stockWarning ? (
                <span className="absolute -right-1 -top-1 z-10">
                  <StockWarningIcon
                    message={stockWarning.message}
                    kind={stockWarning.kind}
                  />
                </span>
              ) : null}
              <span className="pointer-events-none absolute bottom-[calc(100%+0.45rem)] left-0 z-20 origin-bottom-left whitespace-nowrap rounded-full bg-ui-fg-base px-2.5 py-1 text-[11px] font-semibold text-ui-bg-base opacity-0 shadow-md transition-all duration-200 ease-out -translate-y-0.5 scale-75 group-hover/swatch:opacity-100 group-hover/swatch:-translate-y-1 group-hover/swatch:scale-100 group-focus-within/swatch:opacity-100 group-focus-within/swatch:-translate-y-1 group-focus-within/swatch:scale-100">
                {v}
              </span>
            </div>
          )
        }

        return (
          <button
            onClick={() => updateOption(option.title ?? "", v ?? "")}
            key={v}
            className={clx(
              "border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 rounded-rounded p-2 flex-1 inline-flex items-center justify-center gap-1.5",
              {
                "border-ui-border-interactive": isSelected,
                "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
                  !isSelected,
              }
            )}
            disabled={disabled}
            data-testid="option-button"
          >
            <span>{v}</span>
            {stockWarning ? (
              <StockWarningIcon
                message={stockWarning.message}
                kind={stockWarning.kind}
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export default OptionSelect
