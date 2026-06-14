import Image from "next/image"

import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import WishlistButton from "@modules/common/components/wishlist-button"

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
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton productId={product.id!} size="sm" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            {(() => {
              const level = product.metadata?.compression_level as string | undefined
              if (!level) return null
              const map: Record<string, { label: string; cls: string }> = {
                light:  { label: "Nhẹ — cả ngày",     cls: "bg-green-50 text-green-700" },
                medium: { label: "Vừa — 6–8 tiếng",   cls: "bg-yellow-50 text-yellow-700" },
                strong: { label: "Mạnh — max 6 tiếng", cls: "bg-red-50 text-red-700" },
              }
              const cfg = map[level]
              if (!cfg) return null
              return (
                <span className={`inline-block text-[10px] font-semibold font-hanken px-2 py-0.5 rounded-full uppercase tracking-wide ${cfg.cls}`}>
                  {cfg.label}
                </span>
              )
            })()}
          </div>
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
