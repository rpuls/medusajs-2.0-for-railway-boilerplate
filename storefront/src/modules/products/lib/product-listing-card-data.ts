import { HttpTypes } from "@medusajs/types"

import { getColorSwatchImageMap } from "@modules/products/lib/color-swatch-images"
import { sortGarmentColorLabels } from "@modules/products/lib/garment-color-order"
import {
  findFirstVariantForColorValue,
  getPrimaryGarmentImageUrl,
  isColorOptionTitle,
  toTitleSlug,
} from "@modules/products/lib/variant-options"
import { catalogSwatchBackgroundImageUrl } from "@lib/util/catalog-image-url"
import { getProductListingCardPriceLines } from "@lib/util/listing-card-price-text"
import type { VariantPrice } from "types/global"

export type ProductListingSwatch = {
  colorLabel: string
  imageUrl: string
  swatchPhotoUrl?: string
}

const MAX_SWATCHES_DISPLAY = 6

export type ProductListingCardData = {
  href: string
  title: string
  /** e.g. `From A$12.00 * ex GST` */
  priceFromLine: string
  /** e.g. `100+ A$8.00 ex GST` when bulk_pricing has a tier covering qty 100 */
  priceHundredPlusLine: string | null
  defaultImageUrl: string | null
  swatches: ProductListingSwatch[]
  /** Full garment color count (may exceed `swatches.length`). */
  totalSwatchCount: number
}

export const getColorValues = (product: HttpTypes.StoreProduct) => {
  const colorOptionIds = new Set(
    (product.options ?? [])
      .filter((option) => isColorOptionTitle(option.title))
      .map((option) => option.id)
      .filter(Boolean) as string[]
  )

  const colors = new Set<string>()

  ;(product.variants ?? []).forEach((variant) => {
    ;((variant as { options?: { option_id?: string; value?: string }[] })
      .options ?? []).forEach((optionValue) => {
      if (!optionValue?.value) {
        return
      }

      if (!colorOptionIds.size || colorOptionIds.has(optionValue.option_id!)) {
        colors.add(String(optionValue.value).trim())
      }
    })
  })

  return Array.from(colors)
}

/**
 * Build serializable props for `ProductListingCard` from a store product
 * (typically the region-priced product from `getProductsById`).
 */
export function buildProductListingCardData(
  product: HttpTypes.StoreProduct,
  _cheapestPrice: VariantPrice | null
): ProductListingCardData {
  const handle = product.handle ?? ""
  const rawColors = getColorValues(product)
  const colorOption = product.options?.find((o) =>
    isColorOptionTitle(o.title)
  )
  const colorOptionTitle = colorOption?.title
  const allColorsSorted =
    rawColors.length > 0 ? sortGarmentColorLabels([...rawColors]) : []
  const totalSwatchCount = allColorsSorted.length
  const colors = allColorsSorted.slice(0, MAX_SWATCHES_DISPLAY)
  const swatchPhotoMap =
    typeof colorOptionTitle === "string" && colorOptionTitle.length > 0
      ? getColorSwatchImageMap(product, colorOptionTitle)
      : new Map<string, string>()
  const catalogFallback = getPrimaryGarmentImageUrl(product, undefined)
  const swatches: ProductListingSwatch[] = colors.map((colorValue) => {
    const variant = findFirstVariantForColorValue(product, colorValue)
    const imageUrl =
      getPrimaryGarmentImageUrl(product, variant) ?? catalogFallback ?? ""
    const slug = toTitleSlug(colorValue)
    const rawSwatchPhotoUrl = slug ? swatchPhotoMap.get(slug) : undefined
    const swatchPhotoUrl = rawSwatchPhotoUrl
      ? catalogSwatchBackgroundImageUrl(rawSwatchPhotoUrl)
      : undefined
    return {
      colorLabel: colorValue,
      imageUrl,
      swatchPhotoUrl,
    }
  })
  const defaultImageUrl =
    swatches.length > 0
      ? swatches[0].imageUrl || catalogFallback
      : catalogFallback

  const { fromLine, hundredPlusLine } = getProductListingCardPriceLines(product)

  return {
    href: `/products/${handle}`,
    title: product.title ?? "Product",
    priceFromLine: fromLine,
    priceHundredPlusLine: hundredPlusLine,
    defaultImageUrl,
    swatches,
    totalSwatchCount,
  }
}
