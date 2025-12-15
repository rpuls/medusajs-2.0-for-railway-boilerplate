import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreProductCategory, StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { generateCategorySchema } from "@lib/seo/category-schema"
import { generateCategoryBreadcrumb } from "@lib/seo/breadcrumb-schema"
import { generateHreflangMetadata } from "@lib/seo/hreflang"
import { getCanonicalUrl } from "@lib/seo/utils"
import JsonLdScript from "components/seo/json-ld-script"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: {
    sortBy?: SortOptions
    page?: string
  }
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600

// Force static generation where possible
export const dynamicParams = false

export async function generateStaticParams() {
  const product_categories = await listCategories()

  if (!product_categories) {
    return []
  }

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions
      ?.map((r) => r.countries?.map((c) => c.iso_2))
      .flat()
      .filter((code): code is string => Boolean(code)) // Filter out undefined values
  )

  const categoryHandles = product_categories
    .map((category: any) => category.handle)
    .filter((handle): handle is string => Boolean(handle)) // Filter out undefined handles

  if (!countryCodes || countryCodes.length === 0 || categoryHandles.length === 0) {
    return []
  }

  const staticParams = countryCodes
    .map((countryCode: string) =>
      categoryHandles.map((handle: string) => ({
        countryCode,
        category: [handle],
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await params in Next.js 16
  const resolvedParams = await params
  
  try {
    // Validate params
    if (!resolvedParams.category || resolvedParams.category.length === 0) {
      return {
        title: "Category | MS Store",
        description: "Category page",
      }
    }

    const { product_categories } = await getCategoryByHandle(
      resolvedParams.category
    )

    if (!product_categories || product_categories.length === 0) {
      return {
        title: "Category | MS Store",
        description: "Category page",
      }
    }

    const normalizedCountryCode = typeof resolvedParams.countryCode === 'string' 
      ? resolvedParams.countryCode.toLowerCase() 
      : 'us'

    const title = product_categories
      .map((category: StoreProductCategory) => category.name)
      .filter(Boolean)
      .join(" | ") || "Category"

    const description =
      product_categories[product_categories.length - 1]?.description ??
      `${title} category.`

    const categoryPath = `/categories/${resolvedParams.category.filter(Boolean).join("/")}`
    const categoryUrl = getCanonicalUrl(categoryPath, normalizedCountryCode)

    // Generate hreflang metadata
    const hreflangAlternates = await generateHreflangMetadata(
      categoryPath,
      normalizedCountryCode
    )

    return {
      title: `${title} | MS Store`,
      description,
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
        canonical: categoryUrl,
        languages: hreflangAlternates,
      },
      openGraph: {
        title: `${title} | MS Store`,
        description,
        type: "website",
        url: categoryUrl,
        siteName: "MS Store",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | MS Store`,
        description,
        site: "@msstore", // Add Twitter handle (update with actual handle)
        creator: "@msstore", // Add Twitter creator (update with actual handle)
      },
    }
  } catch (error) {
    return {
      title: "Category | MS Store",
      description: "Category page",
    }
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  // Await params in Next.js 16
  const resolvedParams = await params
  const { sortBy, page } = searchParams

  // Validate params
  if (!resolvedParams.countryCode || !resolvedParams.category || resolvedParams.category.length === 0) {
    notFound()
  }

  const normalizedCountryCode = typeof resolvedParams.countryCode === 'string' 
    ? resolvedParams.countryCode.toLowerCase() 
    : 'us'

  const { product_categories } = await getCategoryByHandle(
    resolvedParams.category
  )

  if (!product_categories || product_categories.length === 0) {
    notFound()
  }

  // Generate JSON-LD schemas
  const categoryPath = `/categories/${resolvedParams.category.filter(Boolean).join("/")}`
  const categoryUrl = getCanonicalUrl(categoryPath, normalizedCountryCode)

  const categorySchema = generateCategorySchema({
    categories: product_categories,
    countryCode: normalizedCountryCode,
    categoryUrl,
  })

  const breadcrumbSchema = generateCategoryBreadcrumb(
    product_categories.map((cat: StoreProductCategory) => ({
      name: cat.name || "",
      handle: cat.handle || "",
    })),
    normalizedCountryCode
  )

  return (
    <>
      {/* JSON-LD Structured Data */}
      <JsonLdScript id="category-schema" data={categorySchema} />
      <JsonLdScript id="breadcrumb-schema" data={breadcrumbSchema} />

    <Suspense fallback={<div>Loading category...</div>}>
      <CategoryTemplate
        categories={product_categories}
        sortBy={sortBy}
        page={page}
          countryCode={normalizedCountryCode}
      />
    </Suspense>
    </>
  )
}
