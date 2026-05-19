import { HttpTypes } from "@medusajs/types"

import ProductPreview from "@modules/products/components/product-preview"
import { getProductsById } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"

type Props = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

/**
 * Renders the "Often ordered together" PDP block, populated by the
 * nightly cross-sell cron (see
 * `backend/src/jobs/refresh-cross-sell-recommendations.ts`).
 *
 * Server component. Returns null whenever the metadata key is missing,
 * empty, or all referenced products fail to resolve — keeps the PDP
 * tidy when there's no signal yet.
 *
 * Distinct from `<RelatedProducts>` (tag/collection-based) on
 * purpose: this block is "what other customers bought alongside",
 * which is a different (and stronger) signal once you have order
 * volume.
 */
export default async function FrequentlyBoughtTogether({
  product,
  countryCode,
}: Props) {
  const metadata = (product?.metadata ?? {}) as Record<string, unknown>
  const ids = Array.isArray(metadata.cross_sell_product_ids)
    ? (metadata.cross_sell_product_ids as unknown[])
        .filter((v): v is string => typeof v === "string" && v.length > 0)
        .filter((id) => id !== product.id)
    : []
  if (ids.length === 0) return null

  const region = await getRegion(countryCode)
  if (!region) return null

  const products = await getProductsById({ ids, regionId: region.id })
  if (!products?.length) return null

  // Preserve the metadata ordering (most co-purchased first).
  const orderedProducts = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is HttpTypes.StoreProduct => Boolean(p))

  if (orderedProducts.length === 0) return null

  return (
    <div className="product-page-constraint">
      <header className="mx-auto mb-10 max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
          Often ordered together
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ui-fg-base small:text-3xl">
          Customers who picked this one also reached for these.
        </h2>
      </header>

      <ul className="grid w-full grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-10 medium:gap-x-8">
        {orderedProducts.slice(0, 4).map((p) => (
          <li key={p.id} className="h-full">
            <ProductPreview product={p} region={region} layout="boxed" />
          </li>
        ))}
      </ul>
    </div>
  )
}
