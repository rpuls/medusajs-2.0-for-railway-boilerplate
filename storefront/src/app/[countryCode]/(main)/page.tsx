import { Metadata } from "next"
import type { HttpTypes } from "@medusajs/types"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import Carousel from "@modules/home/components/carousel"
import ShopByCategory from "@modules/home/components/shop-by-category"
import BestSellers from "@modules/home/components/best-sellers"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getBrandingConfig } from "@lib/data/branding"
import { getCategoriesList } from "@lib/data/categories"
import { getPersonalizationCategoryIds } from "@lib/data/cookies"
import { getBestSellers } from "@lib/data/best-sellers"

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
  const hasPersonalizedCategories = categoryIds.length > 0

  // Fetch best sellers to check if we should show the section
  const bestSellersProducts = await getBestSellers({
    category_ids: hasPersonalizedCategories ? categoryIds : undefined,
    regionId: region.id,
    limit: 4,
  })

  return (
    <>
      {carouselSlides && <div className="container pt-8">
        <Carousel carouselSlides={carouselSlides} />
      </div>}

      {hasPersonalizedCategories ? (
        // If category_ids cookie exists, show Best Sellers before Shop By Category
        <>
          {bestSellersProducts.length > 0 && (
            <div className="container">
              <BestSellers region={region} limit={12} />
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
          {bestSellersProducts.length > 1 && (
            <div className="container">
              <BestSellers region={region} limit={12} />
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
