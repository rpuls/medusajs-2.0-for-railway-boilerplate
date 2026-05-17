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

  // Derive a candidate handle from the URL brand param so we can fetch product IDs
  // in parallel with other data (before listBrands resolves). Converts "AS Colour" →
  // "as-colour", "Biz Collection" → "biz-collection", etc.
  const brandHandleGuess = brand
    ? brand.trim().toLowerCase().replace(/\s+/g, "-")
    : null

  const [productTypes, productTags, brands, brandData] = await Promise.all([
    listStoreProductTypes(),
    listStoreProductTags(),
    listBrands(),
    brandHandleGuess
      ? retrieveBrandByHandle(brandHandleGuess)
      : Promise.resolve({ brand: null, children: [], product_ids: [] }),
  ])

  // product_ids from the brand route is server-side brand filtering — avoids relying on
  // Medusa's *brand field expansion which only resolves for 1 product per brand entity.
  const brandProductIds: string[] | undefined =
    brandData.brand != null
      ? brandData.product_ids.length > 0
        ? brandData.product_ids
        : ["__no_match__"]
      : undefined

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
            productsIds={brandProductIds}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStock={inStock}
            brand={brandProductIds !== undefined ? undefined : brand}
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
