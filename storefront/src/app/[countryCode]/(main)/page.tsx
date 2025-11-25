import { Metadata } from "next"
import { Suspense } from "react"
import dynamicImport from "next/dynamic"

import CategoryIconsCarousel from "@modules/home/components/category-icons"
import AdvantageBoxes from "@modules/home/components/advantage-boxes"
import FeaturedProducts from "@modules/home/components/featured-products"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getProductsList } from "@lib/data/products"

// Lazy load banner slider for better performance
const BannerSliderLazy = dynamicImport(
  () => import("@modules/home/components/banner-slider"),
  {
    ssr: true, // Keep SSR for SEO
  }
)

export const metadata: Metadata = {
  title: "MS Storefront",
  description:
    "A performant frontend ecommerce storefront.",
}

// Enable ISR with 1 hour revalidation for homepage
export const revalidate = 3600

// Force static generation
export const dynamic = "force-static"

// Lazy load newsletter component (client-side only)
const NewsletterLazy = dynamicImport(
  () => import("@modules/home/components/newsletter"),
  {
    ssr: false,
  }
)

export default async function Home({
  params: { countryCode },
}: {
  params: { countryCode: string }
}) {
  const collections = await getCollectionsWithProducts(countryCode)
  const region = await getRegion(countryCode)

  // Fetch trending products (currently available)
  const trendingProducts = await getProductsList({
    pageParam: 1,
    queryParams: { limit: 8 },
    countryCode,
  })

  // Fetch best sellers
  const bestSellers = await getProductsList({
    pageParam: 1,
    queryParams: { limit: 8 },
    countryCode,
  })

  if (!region) {
    return null
  }

  return (
    <>
      {/* Hero Banner Slider */}
      <Suspense fallback={<div className="h-[400px] bg-background-elevated" />}>
        <BannerSliderLazy />
      </Suspense>

      {/* Category Icons Carousel */}
      <Suspense fallback={<div className="h-32 bg-background-base" />}>
        <CategoryIconsCarousel countryCode={countryCode} />
      </Suspense>

      {/* Advantage Boxes */}
      <AdvantageBoxes countryCode={countryCode} />

      {/* Trending Products */}
      {collections && collections.length > 0 && (
        <Suspense fallback={<div className="h-96 bg-background-base" />}>
          <FeaturedProducts
            collections={collections}
            region={region}
            countryCode={countryCode}
            titleKey="homepage.trending"
          />
        </Suspense>
      )}

      {/* Best Sellers - Create a collection-like object */}
      {bestSellers.response.products.length > 0 && (
        <Suspense fallback={<div className="h-96 bg-background-base" />}>
          <FeaturedProducts
            collections={[
              {
                id: "bestsellers",
                handle: "bestsellers",
                products: bestSellers.response.products as any,
              } as any,
            ]}
            region={region}
            countryCode={countryCode}
            titleKey="homepage.bestSellers"
          />
        </Suspense>
      )}

      {/* Newsletter Subscription */}
      <NewsletterLazy />
    </>
  )
}
