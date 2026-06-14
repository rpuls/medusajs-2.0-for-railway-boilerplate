import Image from "next/image"

import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const [pricedProduct] = await getProductsById({
    ids: [product.id!],
    regionId: region.id,
  })

  if (!pricedProduct) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product: pricedProduct,
  })

  const thumbnail = product.thumbnail || product.images?.[0]?.url

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block cursor-pointer"
    >
      <div data-testid="product-wrapper">
        <div className="w-full aspect-[3/4] bg-kin-beige mb-4 overflow-hidden relative">
          {thumbnail && (
            <Image
              src={thumbnail}
              alt={product.title}
              fill
              quality={60}
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h3
            className="font-hanken text-base font-semibold text-kin-primary leading-snug"
            data-testid="product-title"
          >
            {product.title}
          </h3>
          {cheapestPrice && (
            <span className="font-vietnam text-base font-medium text-kin-on-surface-variant">
              {cheapestPrice.calculated_price}
            </span>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
