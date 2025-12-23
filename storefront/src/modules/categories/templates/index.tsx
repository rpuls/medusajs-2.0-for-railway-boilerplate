import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import SortDropdown, { SortOptions } from "@modules/store/components/sort-dropdown"
import ActiveFilters from "@modules/store/components/active-filters"
import ProductCount from "@modules/store/components/product-count"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { getActiveBrands } from "@lib/data/brands"
import { getMaxProductPrice } from "@lib/data/products"

// Wrapper to handle PaginatedProducts result object - matches store page design
async function PaginatedProductsWrapper({
  sortBy,
  page,
  categoryIds,
  countryCode,
  collections,
  categories,
  brands,
}: {
  sortBy: SortOptions
  page: number
  categoryIds: string[]
  countryCode: string
  collections: HttpTypes.StoreCollection[]
  categories: HttpTypes.StoreProductCategory[]
  brands: any[]
}) {
  const result = await PaginatedProducts({
    sortBy,
    page,
    countryCode,
    categoryIds,
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
          brands={brands}
          selectedCollectionIds={[]}
          selectedCategoryIds={categoryIds}
          selectedBrandIds={[]}
          selectedPriceRange={undefined}
        />
      </div>
      {result.products}
    </>
  )
}

export default async function CategoryTemplate({
  categories,
  collections,
  sortBy,
  page,
  countryCode,
}: {
  categories: HttpTypes.StoreProductCategory[]
  collections: HttpTypes.StoreCollection[]
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const category = categories[categories.length - 1]
  const parents = categories.slice(0, categories.length - 1)

  if (!category || !countryCode) notFound()

  // Fetch brands and maxPrice for filters (matches store page)
  const [brands, maxPrice] = await Promise.all([
    getActiveBrands(),
    getMaxProductPrice({
      countryCode,
      categoryIds: [category.id],
    }),
  ])

  // Create key for Suspense based on filters (matches store page pattern)
  const filterKey = `${JSON.stringify([category.id])}-${sort}-${pageNumber}`

  return (
    <div
      className="flex flex-col small:flex-row small:items-start small:gap-x-8 py-6 content-container"
      data-testid="category-container"
    >
      <RefinementList 
        collections={collections || []} 
        categories={categories}
        brands={brands}
        maxPrice={maxPrice}
        sortBy={sort} 
        data-testid="sort-by-container" 
      />
      <div className="w-full">
        {/* Header with breadcrumbs and sort dropdown - matches store page layout */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex flex-row text-2xl-semi gap-4">
            {parents &&
              parents.map((parent) => (
                <span key={parent.id} className="text-ui-fg-subtle">
                  <LocalizedClientLink
                    className="mr-4 hover:text-black"
                    href={`/categories/${parent.handle}`}
                    prefetch={false}
                    data-testid="sort-by-link"
                  >
                    {parent.name}
                  </LocalizedClientLink>
                  /
                </span>
              ))}
            <h1 data-testid="category-page-title">{category.name}</h1>
          </div>
          <SortDropdown />
        </div>
        
        {/* Category description and children - category-specific content */}
        {category.description && (
          <div className="mb-8 text-base-regular">
            <p>{category.description}</p>
          </div>
        )}
        {category.category_children && (
          <div className="mb-8 text-base-large">
            <ul className="grid grid-cols-1 gap-2">
              {category.category_children?.map((c) => (
                <li key={c.id}>
                  <InteractiveLink href={`/categories/${c.handle}`} prefetch={false}>
                    {c.name}
                  </InteractiveLink>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Products with ProductCount and ActiveFilters - matches store page */}
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
            categoryIds={[category.id]}
            countryCode={countryCode}
            collections={collections || []}
            categories={categories}
            brands={brands}
          />
        </Suspense>
      </div>
    </div>
  )
}
