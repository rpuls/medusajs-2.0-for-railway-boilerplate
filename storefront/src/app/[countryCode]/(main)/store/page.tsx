import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>
}): Promise<Metadata> {
  const { brand } = await searchParams
  /**
   * Brand-specific landing copy now lives at `/brands/[handle]` (server-rendered from the
   * Brand row). For deep-linked `/store?brand=…` filters, fall back to a generic store title;
   * the URL doesn't carry a brand handle so we'd need an extra fetch just to title the page.
   */
  if (brand) {
    return {
      title: `${brand} — Store`,
      description: `Browse ${brand} products from our catalog.`,
    }
  }
  return {
    title: "Store",
    description: "Explore all of our products.",
  }
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
    brand?: string
    fabric?: string
    /** Legacy; prefer `tagId` */
    tag?: string
    tagId?: string
    typeId?: string
  }>
  params: Promise<{
    countryCode: string
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

export default async function StorePage({ searchParams, params }: Params) {
  const resolvedSearchParams = await searchParams
  const resolvedParams = await params
  const {
    sortBy,
    page,
    minPrice,
    maxPrice,
    inStock,
    brand,
    fabric,
    tag,
    tagId,
    typeId,
  } = resolvedSearchParams

  const resolvedTagId = tagId?.trim() || tag?.trim() || undefined

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      minPrice={parsePositiveNumber(minPrice)}
      maxPrice={parsePositiveNumber(maxPrice)}
      inStock={inStock === "1"}
      brand={brand?.trim() || undefined}
      fabric={fabric?.trim() || undefined}
      typeId={typeId?.trim() || undefined}
      tagId={resolvedTagId}
      countryCode={resolvedParams.countryCode}
    />
  )
}
