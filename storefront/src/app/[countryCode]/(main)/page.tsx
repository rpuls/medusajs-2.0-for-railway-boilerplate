import { Metadata } from "next"
import { Suspense } from "react"
import dynamicImport from "next/dynamic"

import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getProductsList } from "@lib/data/products"
import { generateOrganizationSchema } from "@lib/seo/organization-schema"
import { generateWebsiteSchema } from "@lib/seo/website-schema"
import { generateHreflangMetadata } from "@lib/seo/hreflang"
import { getCanonicalUrl } from "@lib/seo/utils"
import { getTranslations, getTranslation } from "@lib/i18n/server"
import JsonLdScript from "components/seo/json-ld-script"
import NewsletterWrapper from "./newsletter-wrapper"

// Lazy load components for better performance and code splitting
const BannerSliderLazy = dynamicImport(
  () => import("@modules/home/components/banner-slider"),
  {
    ssr: true, // Keep SSR for SEO
    loading: () => <div className="h-[400px] bg-background-elevated animate-pulse" />
  }
)

const CategoryIconsCarousel = dynamicImport(
  () => import("@modules/home/components/category-icons"),
  {
    ssr: true,
    loading: () => <div className="h-32 bg-background-base animate-pulse" />
  }
)

const AdvantageBoxes = dynamicImport(
  () => import("@modules/home/components/advantage-boxes"),
  {
    ssr: true,
  }
)

const FeaturedProducts = dynamicImport(
  () => import("@modules/home/components/featured-products"),
  {
    ssr: true,
    loading: () => <div className="h-96 bg-background-base animate-pulse" />
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
  
  // Get translations for metadata
  const translations = await getTranslations(normalizedCountryCode)
  const siteName = getTranslation(translations, "metadata.siteName")
  const siteDescription = getTranslation(translations, "metadata.homepage.description")
  const siteTitle = getTranslation(translations, "metadata.homepage.title")

  // Generate hreflang metadata for homepage
  const hreflangAlternates = await generateHreflangMetadata(
    "",
    normalizedCountryCode
  )

  return {
    title: siteTitle,
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
      title: siteTitle,
      description: siteDescription,
      type: "website",
      url: homepageUrl,
      siteName: siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
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

  // Get translations for schema (reuse from metadata generation)
  const translations = await getTranslations(countryCode)
  const siteName = getTranslation(translations, "metadata.siteName")
  const siteDescription = getTranslation(translations, "metadata.homepage.description")

  const organizationSchema = generateOrganizationSchema({
    name: siteName,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
  })

  const websiteSchema = generateWebsiteSchema({
    name: siteName,
    url: baseUrl,
    description: siteDescription,
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

      {/* Hero Banner Slider - Above the fold */}
      <BannerSliderLazy />

      {/* Category Icons Carousel */}
      <CategoryIconsCarousel countryCode={countryCode} />

      {/* Advantage Boxes */}
      <AdvantageBoxes countryCode={countryCode} />

      {/* Trending Products */}
      {collections && collections.length > 0 && (
        <FeaturedProducts
          collections={collections}
          region={region}
          countryCode={countryCode}
          titleKey="homepage.trending"
        />
      )}

      {/* Best Sellers - Create a collection-like object */}
      {bestSellers.response.products.length > 0 && (
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
      )}

      {/* Newsletter Subscription */}
      <NewsletterWrapper />
    </>
  )
}
