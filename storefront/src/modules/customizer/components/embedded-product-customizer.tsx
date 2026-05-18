"use client"

import { useMemo, type ReactNode } from "react"
import { HttpTypes } from "@medusajs/types"

import { extractDefaultGarmentFromProduct } from "@modules/customizer/lib/default-garment"
import { useProductOptionsOptional } from "@modules/products/context/product-options-context"
import { resolveVariantFromOptions } from "@modules/products/lib/variant-options"
import CustomizerTemplate from "@modules/customizer/templates"
import type { Tier } from "@lib/customer-tiers"

type Props = {
  product: HttpTypes.StoreProduct
  /** When set, gallery and variant pickers sit in the same grid as the design canvas (unified PDP layout). */
  integratedPdpSlots?: {
    gallery: ReactNode
    variantPickers: ReactNode
  }
  /** Logged-in customer's tier, resolved by the server parent. */
  tier?: Tier | null
}

/**
 * Logo customizer on the PDP: variant selection can live in `integratedPdpSlots.variantPickers`
 * so it aligns with ProductActions; canvas shows the garment mockup for the synced variant.
 */
export default function EmbeddedProductCustomizer({ product, integratedPdpSlots, tier = null }: Props) {
  const productOptions = useProductOptionsOptional()

  const syncVariantId = useMemo(() => {
    const resolved = resolveVariantFromOptions(
      product,
      productOptions?.options ?? {}
    )
    const rawId = resolved?.id ?? product.variants?.[0]?.id ?? null
    const ids = new Set(product.variants?.map((v) => v.id) ?? [])
    if (rawId && ids.has(rawId)) {
      return rawId
    }
    return product.variants?.[0]?.id ?? null
  }, [product, productOptions?.options])

  const defaultGarment = extractDefaultGarmentFromProduct(product)

  return (
    <CustomizerTemplate
      embedded
      pdpSyncedVariantId={syncVariantId}
      integratedPdpSlots={integratedPdpSlots}
      defaultGarmentImage={defaultGarment?.url ?? null}
      defaultGarmentTitle={defaultGarment?.title ?? null}
      product={product}
      tier={tier}
    />
  )
}
