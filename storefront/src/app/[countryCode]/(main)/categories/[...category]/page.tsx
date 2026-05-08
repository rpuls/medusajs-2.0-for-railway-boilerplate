import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import { StoreProductCategory, StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
    brand?: string
    fabric?: string
  }>
}

const parsePositiveNumber = (value?: string) => {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined
  }

  return Math.floor(parsed)
}

export async function generateStaticParams() {
  const product_categories = await listCategories()

  if (!product_categories) {
    return []
  }

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
  )

  const categoryHandles = product_categories.map(
    (category: any) => category.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string | undefined) =>
      categoryHandles.map((handle: any) => ({
        countryCode,
        category: [handle],
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { category, countryCode } = await params
    const { product_categories } = await getCategoryByHandle(category)

    const title = product_categories
      .map((category: StoreProductCategory) => category.name)
      .join(" | ")

    const description =
      product_categories[product_categories.length - 1].description ??
      `${title} category.`

    return {
      title,
      description,
      alternates: {
        canonical: `/${countryCode}/categories/${category.join("/")}`,
      },
      openGraph: {
        url: buildAbsoluteUrl(`/${countryCode}/categories/${category.join("/")}`),
        title: `${title} | ${SEO.siteName}`,
        description,
      },
      twitter: {
        title: `${title} | ${SEO.siteName}`,
        description,
        images: [SEO.ogImage],
      },
    }
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category, countryCode } = await params
  const { sortBy, page, minPrice, maxPrice, inStock, brand, fabric } = await searchParams

  const { product_categories } = await getCategoryByHandle(category)

  if (!product_categories) {
    notFound()
  }

  return (
    <CategoryTemplate
      categories={product_categories}
      sortBy={sortBy}
      page={page}
      minPrice={parsePositiveNumber(minPrice)}
      maxPrice={parsePositiveNumber(maxPrice)}
      inStock={inStock === "1"}
      brand={brand?.trim() || undefined}
      fabric={fabric?.trim() || undefined}
      countryCode={countryCode}
    />
  )
}
