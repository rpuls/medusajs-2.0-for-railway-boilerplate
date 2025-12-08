import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import SortDropdown, { SortOptions } from "@modules/store/components/sort-dropdown"
import ActiveFilters from "@modules/store/components/active-filters"
import ProductCount from "@modules/store/components/product-count"
import { getCollectionsList } from "@lib/data/collections"
import { getCategoriesList } from "@lib/data/categories"
import { getTranslations, getTranslation } from "@lib/i18n/server"

import PaginatedProducts from "./paginated-products"

async function PaginatedProductsWrapper({
  sortBy,
  page,
  countryCode,
  collectionIds,
  categoryIds,
  priceRange,
  collections,
  categories,
}: {
  sortBy: SortOptions
  page: number
  countryCode: string
  collectionIds?: string[]
  categoryIds?: string[]
  priceRange?: string
  collections: any[]
  categories: any[]
}) {
  const result = await PaginatedProducts({
    sortBy,
    page,
    countryCode,
    collectionIds,
    categoryIds,
    priceRange,
  })

  return (
    <>
      <div className="mb-4 flex flex-col gap-3">
        <ProductCount
          currentPage={page}
          pageSize={result.pageSize}
          totalCount={result.totalCount}
        />
        <ActiveFilters
          collections={collections}
          categories={categories}
          selectedCollectionIds={collectionIds}
          selectedCategoryIds={categoryIds}
          selectedPriceRange={priceRange}
        />
      </div>
      {result.products}
    </>
  )
}

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  collectionIds,
  categoryIds,
  priceRange,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  collectionIds?: string[]
  categoryIds?: string[]
  priceRange?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  // Fetch filter data and translations server-side (optimized with caching)
  const [{ collections }, { product_categories: categories }, translations] = await Promise.all([
    getCollectionsList(0, 100),
    getCategoriesList(0, 100),
    getTranslations(countryCode),
  ])

  // Create key for Suspense based on filter arrays
  const filterKey = `${JSON.stringify(collectionIds || [])}-${JSON.stringify(categoryIds || [])}-${priceRange}-${sort}-${pageNumber}`

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <RefinementList
        collections={collections}
        categories={categories}
      />
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl-semi" data-testid="store-page-title">
            {getTranslation(translations, "common.allProducts")}
          </h1>
          <SortDropdown />
        </div>
        <Suspense 
          key={filterKey}
          fallback={
            <>
              <div className="mb-4">
                <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
              </div>
              <SkeletonProductGrid />
            </>
          }
        >
          <PaginatedProductsWrapper
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            collectionIds={collectionIds}
            categoryIds={categoryIds}
            priceRange={priceRange}
            collections={collections}
            categories={categories}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
