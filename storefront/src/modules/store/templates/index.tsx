import { Suspense } from "react"

import { listStoreProductTags, listStoreProductTypes } from "@lib/data/catalog-facets"
import { listBrands, retrieveBrandByHandle } from "@lib/data/brands"
import AsColourStoreUgcMasonry from "@modules/brands/components/as-colour-store-ugc-masonry"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { CatalogFacetOptions, ProductFilters } from "@modules/store/components/refinement-list/types"

import PaginatedProducts from "./paginated-products"

/**
 * Brand-aware route customizations that used to live behind the `isRamoStoreBrand` /
 * `isAsColourStoreBrand` helpers. The filter URL still uses `?brand=<handle>` or `?brand=<name>`,
 * so we match either; logic moves here so the helpers can be deleted along with BRAND_TILES.
 */
function brandMatchesAny(filter: string | undefined, targets: ReadonlyArray<string>): boolean {
  if (!filter) return false
  const f = filter.trim().toLowerCase()
  return targets.some((t) => t.toLowerCase() === f)
}

const StoreTemplate = async ({
  sortBy,
  page,
  minPrice,
  maxPrice,
  inStock,
  brand,
  fabric,
  typeId,
  tagId,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  brand?: string
  fabric?: string
  typeId?: string
  tagId?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  // Derive a candidate handle from the URL brand param. Converts "AS Colour" → "as-colour",
  // "Biz Collection" → "biz-collection", etc. The dedicated brand endpoint resolves the
  // brand entity server-side; we don't need to fetch its product IDs here anymore.
  const brandHandleGuess = brand
    ? brand.trim().toLowerCase().replace(/\s+/g, "-")
    : null

  const [productTypes, productTags, brands, brandData] = await Promise.all([
    listStoreProductTypes(),
    listStoreProductTags(),
    listBrands(),
    brandHandleGuess
      ? retrieveBrandByHandle(brandHandleGuess)
      : Promise.resolve({ brand: null, children: [] }),
  ])

  // If the requested brand handle exists on the backend, we route the product list
  // through the dedicated /store/brands/<handle>/products endpoint (server-side join,
  // pagination, sales-channel scoping). Otherwise we render the unfiltered catalog.
  const resolvedBrandHandle: string | undefined =
    brandData.brand?.handle ?? undefined

  const matchedBrand = brand
    ? brands.find(
        (b) =>
          b.handle.toLowerCase() === brand.trim().toLowerCase() ||
          b.name.toLowerCase() === brand.trim().toLowerCase()
      ) ?? null
    : null
  const isRamo = brandMatchesAny(brand, ["ramo", "stanley/stella"])
  const isAsColour = brandMatchesAny(brand, ["as-colour", "as colour"])
  const catalogTitle = matchedBrand
    ? matchedBrand.name
    : isRamo
      ? "Ramo"
      : brand?.trim()
        ? brand.trim()
        : "All products"

  const facetOptions: CatalogFacetOptions = {
    brands: brands.map((b) => ({
      id: b.handle,
      label: b.name,
    })),
    types: productTypes.map((pt) => ({
      id: pt.id,
      label: pt.value ?? pt.id,
    })),
    tags: productTags.map((tg) => ({
      id: tg.id,
      label: tg.value ?? tg.id,
    })),
  }

  return (
    <div
      className="flex flex-col small:flex-row small:items-start small:gap-x-10 py-6 content-container"
      data-testid="category-container"
    >
      <RefinementList
        sortBy={sort}
        facetOptions={facetOptions}
        filters={
          {
            minPrice,
            maxPrice,
            inStock,
            brand,
            fabric,
            typeId,
            tagId,
          } as ProductFilters
        }
      />
      <div className="w-full">
        <div className="mb-8">
          <h1 className="page-title-catalog" data-testid="store-page-title">
            {catalogTitle}
          </h1>
        </div>
        {isAsColour && pageNumber === 1 ? <AsColourStoreUgcMasonry /> : null}
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            brandHandle={resolvedBrandHandle}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStock={inStock}
            brand={resolvedBrandHandle ? undefined : brand}
            fabric={fabric}
            tagId={tagId}
            typeId={typeId}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
