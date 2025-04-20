import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import RefinementSidebar from "@modules/store/components/refinement-list/refinement-sidebar"
import PaginatedProducts from "./paginated-products"

type Props = {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  categoryId?: string
  collectionId?: string
}

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  categoryId,
  collectionId,
}: Props) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      {/* Левая панель — сортировка + фильтры */}
      <div className="w-full small:max-w-[200px] mb-8">
        <RefinementSidebar sortBy={sort} />
      </div>

      {/* Сетка товаров */}
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1 data-testid="store-page-title">All products</h1>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            categoryId={categoryId}
            collectionId={collectionId}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
