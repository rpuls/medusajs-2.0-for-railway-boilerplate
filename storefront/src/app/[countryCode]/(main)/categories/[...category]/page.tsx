import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreProductCategory, StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

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

    const title = product_categories
      .map((category: StoreProductCategory) => category.name)
      .filter(Boolean)
      .join(" | ") || "Category"

    const description =
      product_categories[product_categories.length - 1]?.description ??
      `${title} category.`

    return {
      title: `${title} | MS Store`,
      description,
      alternates: {
        canonical: `${resolvedParams.category.filter(Boolean).join("/")}`,
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

  const { product_categories } = await getCategoryByHandle(
    resolvedParams.category
  )

  if (!product_categories || product_categories.length === 0) {
    notFound()
  }

  return (
    <Suspense fallback={<div>Loading category...</div>}>
      <CategoryTemplate
        categories={product_categories}
        sortBy={sortBy}
        page={page}
        countryCode={resolvedParams.countryCode}
      />
    </Suspense>
  )
}
