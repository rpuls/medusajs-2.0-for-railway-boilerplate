import { getProductsList } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function BestSeller({
  region,
  countryCode,
}: {
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  const {
    response: { products },
  } = await getProductsList({
    queryParams: { limit: 5 },
    countryCode,
  })

  if (!products.length) {
    return null
  }

  return (
    <section className="max-w-kin mx-auto px-5 md:px-12 py-16 md:py-24">
      <div className="flex justify-between items-end mb-10 md:mb-12">
        <h2 className="font-hanken text-3xl md:text-4xl font-bold text-kin-primary tracking-tight">
          Được chọn nhiều nhất
        </h2>
        <LocalizedClientLink
          href="/store"
          className="font-hanken text-sm font-semibold text-kin-on-surface-variant hover:text-kin-primary transition-colors uppercase tracking-wider flex items-center gap-1 whitespace-nowrap"
        >
          Xem tất cả
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </LocalizedClientLink>
      </div>
      <ul className="grid grid-cols-2 md:grid-cols-5 gap-x-5 gap-y-10 md:gap-x-8 md:gap-y-14">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} />
          </li>
        ))}
      </ul>
    </section>
  )
}
