import { Metadata } from "next"
import type { HttpTypes } from "@medusajs/types"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import Carousel from "@modules/home/components/carousel"
import ShopByCategory from "@modules/home/components/shop-by-category"
import BestSellers from "@modules/home/components/best-sellers"
import RecentlyVisited from "@modules/home/components/recently-visited"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getBrandingConfig } from "@lib/data/branding"
import { getCategoriesList } from "@lib/data/categories"
import {
  getPersonalizationCategoryIds,
  getPersonalizationCollectionId,
  getRecentProductIds,
} from "@lib/data/cookies"
import { getBestSellers } from "@lib/data/best-sellers"
import { getProductsById } from "@lib/data/products"

export const metadata: Metadata = {
  title: "Medusa Next.js Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 14 and Medusa.",
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const collections = await getCollectionsWithProducts(countryCode)
  const region = await getRegion(countryCode)
  const branding = await getBrandingConfig()
  const { product_categories: allCategories } = await getCategoriesList(0, 12)

  const categories: HttpTypes.StoreProductCategory[] =
    allCategories?.filter((c) => c.parent_category_id === null) ?? []

  if (!collections || !region) {
    return null
  }

  const carouselSlides =
    branding?.carousel_slides && branding.carousel_slides.length > 0
      ? branding.carousel_slides
      : null

  // Check if category_ids cookie exists for personalization
  const categoryIds = await getPersonalizationCategoryIds()
  const collectionId = await getPersonalizationCollectionId()
  const hasPersonalizedCategories = categoryIds.length > 0

  // Fetch best sellers products
  const bestSellersProducts = await getBestSellers({
    category_ids: hasPersonalizedCategories ? categoryIds : undefined,
    collection_id: collectionId || undefined,
    regionId: region.id,
    limit: 12,
  })

  // Fetch recently visited products
  const recentProductIds = await getRecentProductIds()
  let recentlyVisitedProducts: HttpTypes.StoreProduct[] = []
  if (recentProductIds.length > 0) {
    const productIdsToFetch = recentProductIds.slice(0, 4)
    const fetchedProducts = await getProductsById({
      ids: productIdsToFetch,
      regionId: region.id,
    })

    // Maintain order from cookie
    recentlyVisitedProducts = productIdsToFetch
      .map((id) => fetchedProducts.find((p) => p.id === id))
      .filter((product): product is HttpTypes.StoreProduct => product !== undefined)
  }

  return (
    <>
      {carouselSlides && <div className="container pt-8">
        <Carousel carouselSlides={carouselSlides} />
      </div>}

      {recentlyVisitedProducts.length > 0 && (
        <div className="container">
          <RecentlyVisited region={region} products={recentlyVisitedProducts} />
        </div>
      )}

      {hasPersonalizedCategories ? (
        // If category_ids cookie exists, show Best Sellers before Shop By Category
        <>
          {bestSellersProducts.length > 0 && (
            <div className="container">
              <BestSellers region={region} products={bestSellersProducts} />
            </div>
          )}
          {categories.length > 0 && (
            <div className="container">
              <ShopByCategory countryCode={countryCode} categories={categories} />
            </div>
          )}
        </>
      ) : (
        // If no category_ids cookie, maintain original order
        <>
          {categories.length > 0 && (
            <div className="container">
              <ShopByCategory countryCode={countryCode} categories={categories} />
            </div>
          )}
          {bestSellersProducts.length > 0 && (
            <div className="container">
              <BestSellers region={region} products={bestSellersProducts} />
            </div>
          )}
        </>
      )}
      {/* <Hero />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div> */}
    </>
  )
}
