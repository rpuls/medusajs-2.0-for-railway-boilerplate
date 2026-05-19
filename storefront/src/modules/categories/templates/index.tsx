import { notFound } from "next/navigation"
import { Suspense } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { ProductFilters } from "@modules/store/components/refinement-list/types"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  categories,
  sortBy,
  page,
  minPrice,
  maxPrice,
  inStock,
  brand,
  fabric,
  countryCode,
}: {
  categories: HttpTypes.StoreProductCategory[]
  sortBy?: SortOptions
  page?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  brand?: string
  fabric?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const category = categories[categories.length - 1]
  const parents = categories.slice(0, categories.length - 1)
  const children = (category?.category_children ?? []).filter(
    (c) => c?.handle && c?.name
  )

  if (!category || !countryCode) notFound()

  return (
    <>
      <section
        className="content-container border-b border-ui-border-base py-10 small:py-14"
        data-testid="category-hero"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ui-fg-muted">
          {parents.length > 0 ? (
            <>
              {parents.map((parent, idx) => (
                <span key={parent.id}>
                  <LocalizedClientLink
                    href={`/categories/${parent.handle}`}
                    className="hover:text-ui-fg-base"
                  >
                    {parent.name}
                  </LocalizedClientLink>
                  {idx < parents.length - 1 ? (
                    <span aria-hidden> / </span>
                  ) : null}
                </span>
              ))}
            </>
          ) : (
            "Shop by category"
          )}
        </p>
        <h1
          className="mt-2 text-3xl font-semibold tracking-tight text-ui-fg-base small:text-4xl"
          data-testid="category-page-title"
        >
          {category.name}
        </h1>
        {category.description ? (
          <p className="mt-3 max-w-2xl text-base text-ui-fg-subtle small:text-lg">
            {category.description}
          </p>
        ) : null}

        {children.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {children.map((c) => (
              <li key={c.id}>
                <LocalizedClientLink
                  href={`/categories/${category.handle}/${c.handle}`}
                  className="rounded-full border border-ui-border-base bg-ui-bg-subtle px-3 py-1 text-small-regular text-ui-fg-base hover:bg-ui-bg-subtle-hover"
                  data-testid={`category-child-${c.handle}-link`}
                >
                  {c.name}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <div
        className="content-container flex flex-col small:flex-row small:items-start small:gap-x-10 py-6"
        data-testid="category-container"
      >
        <RefinementList
          sortBy={sort}
          filters={
            {
              minPrice,
              maxPrice,
              inStock,
              brand,
              fabric,
            } as ProductFilters
          }
          data-testid="sort-by-container"
        />
        <div className="w-full">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              categoryId={category.id}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStock={inStock}
              brand={brand}
              fabric={fabric}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}
