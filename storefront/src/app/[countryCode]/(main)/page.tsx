import { Metadata } from "next"
import { Suspense } from "react"
import dynamicImport from "next/dynamic"

import CategoryIconsCarousel from "@modules/home/components/category-icons"
import AdvantageBoxes from "@modules/home/components/advantage-boxes"
import FeaturedProducts from "@modules/home/components/featured-products"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getProductsList } from "@lib/data/products"
import NewsletterWrapper from "./newsletter-wrapper"
import { generateOrganizationSchema } from "@lib/seo/organization-schema"
import { generateWebsiteSchema } from "@lib/seo/website-schema"
import { generateHreflangMetadata } from "@lib/seo/hreflang"
import { getCanonicalUrl } from "@lib/seo/utils"
import JsonLdScript from "components/seo/json-ld-script"

// Lazy load banner slider for better performance
const BannerSliderLazy = dynamicImport(
  () => import("@modules/home/components/banner-slider"),
  {
    ssr: true, // Keep SSR for SEO
  }
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const normalizedCountryCode =
    typeof resolvedParams?.countryCode === "string"
      ? resolvedParams.countryCode.toLowerCase()
      : "us"

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000"
  const homepageUrl = getCanonicalUrl("", normalizedCountryCode)
  const siteName = "MS Store"
  const siteDescription =
    "Discover quality products at MS Store. Shop the latest trends, best sellers, and exclusive collections with fast shipping and excellent customer service."

  // Generate hreflang metadata for homepage
  const hreflangAlternates = await generateHreflangMetadata(
    "",
    normalizedCountryCode
  )

  return {
    title: `${siteName} - Quality Products & Fast Shipping`,
    description: siteDescription,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: homepageUrl,
      languages: hreflangAlternates,
    },
    openGraph: {
      title: `${siteName} - Quality Products & Fast Shipping`,
      description: siteDescription,
      type: "website",
      url: homepageUrl,
      siteName: siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} - Quality Products & Fast Shipping`,
      description: siteDescription,
      site: "@msstore", // Add Twitter handle (update with actual handle)
      creator: "@msstore", // Add Twitter creator (update with actual handle)
    },
  }
}

// Enable ISR with 1 hour revalidation for homepage
export const revalidate = 3600

// Force static generation
export const dynamic = "force-static"

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  // Await params in Next.js 16
  const resolvedParams = await params
  
  // Validate params
  if (!resolvedParams?.countryCode || typeof resolvedParams.countryCode !== 'string') {
    return null
  }

  const countryCode = resolvedParams.countryCode.toLowerCase()
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

  // Generate JSON-LD schemas for homepage
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000"
  const homepageUrl = getCanonicalUrl("", countryCode)

  const organizationSchema = generateOrganizationSchema({
    name: "MS Store",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
  })

  const websiteSchema = generateWebsiteSchema({
    name: "MS Store",
    url: baseUrl,
    description:
      "Discover quality products at MS Store. Shop the latest trends, best sellers, and exclusive collections.",
    potentialAction: {
      target: `${baseUrl}/${countryCode}/search?q={search_term_string}`,
      queryInput: "required name=search_term_string",
    },
  })

  return (
    <>
      {/* JSON-LD Structured Data */}
      <JsonLdScript id="organization-schema" data={organizationSchema} />
      <JsonLdScript id="website-schema" data={websiteSchema} />

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
      <NewsletterWrapper />
    </>
  )
}
