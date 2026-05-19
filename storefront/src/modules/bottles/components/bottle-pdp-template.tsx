import type { HttpTypes } from "@medusajs/types"

import { getBottleSpec } from "../lib/bottle-label-spec"
import EmbeddedBottleCustomizer from "./embedded-bottle-customizer"

type Props = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

/**
 * Bottle PDP. Reuses the bottle customizer for design + add-to-cart and
 * keeps the page deliberately minimal — bottles are gift-purchase products,
 * so we don't surface decoration estimators, related products, or apparel-
 * specific tabs.
 */
export default function BottlePdpTemplate({
  product,
  region: _region,
  countryCode,
}: Props) {
  const bottleSpec = getBottleSpec(product)

  /**
   * The variant picker is a lightweight inline pill row inside the embedded
   * customizer. We pre-compute the option list here so the client component
   * doesn't need access to region/cart helpers — only the bottle's own variants.
   */
  const variantOptions = (product.variants ?? []).map((v) => {
    const stockTracked =
      (v as any).manage_inventory !== undefined ? (v as any).manage_inventory : true
    const totalAvailable = Number(
      (v as any).inventory_quantity ?? 0
    )
    const isInStock = !stockTracked || totalAvailable > 0
    return {
      id: v.id ?? "",
      title: v.title ?? "Default",
      sku: v.sku ?? null,
      isInStock,
    }
  })

  const initialVariantId =
    variantOptions.find((o) => o.isInStock)?.id ?? variantOptions[0]?.id ?? null

  return (
    <div className="content-container py-6 small:py-10">
      <EmbeddedBottleCustomizer
        product={product}
        countryCode={countryCode}
        bottleSpec={bottleSpec}
        variantOptions={variantOptions}
        initialVariantId={initialVariantId}
      />
    </div>
  )
}
