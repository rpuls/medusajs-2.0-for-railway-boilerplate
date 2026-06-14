import { getProductsListWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { GOAL_TAG_MAP } from "@modules/store/components/body-goal-filter"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  goal,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  goal?: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let {
    response: { products, count },
  } = await getProductsListWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  // Client-side tag filter for body goal
  if (goal && goal !== "all" && GOAL_TAG_MAP[goal]) {
    const requiredTag = GOAL_TAG_MAP[goal]
    products = products.filter((p) =>
      p.tags?.some((t) => t.value?.toLowerCase() === requiredTag)
    )
  }

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      {products.length === 0 && (
        <p className="font-vietnam text-kin-on-surface-variant text-base py-12">
          Chưa có sản phẩm phù hợp với mục tiêu này. Vui lòng thử lại sau.
        </p>
      )}
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview product={p} region={region} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
