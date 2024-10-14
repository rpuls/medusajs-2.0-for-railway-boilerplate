import { getTopSellingProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"

const PRODUCT_LIMIT = 12

export default async function TopSellingProducts({
  page,
  countryCode,
}: {
  page: number
  countryCode: string
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const { products = [], count } = await getTopSellingProducts({
    page,
    countryCode,
    queryParams: { limit: PRODUCT_LIMIT },
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="top-selling-products-list"
      >
        {products.length > 0 ? (
          products.map((p) => (
            <li key={p.id}>
              <ProductPreview product={p} region={region} />
            </li>
          ))
        ) : (
          <p>Nu există produse disponibile</p>
        )}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="top-selling-product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
