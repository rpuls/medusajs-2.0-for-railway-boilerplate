import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: {
    sortBy?: SortOptions
    page?: string
    category?: string
    collection?: string
  }
  params: {
    countryCode: string
  }
}

export default async function StorePage({ searchParams, params }: Params) {
  const { sortBy, page, category, collection } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      categoryId={category}
      collectionId={collection}
      countryCode={params.countryCode}
    />
  )
}
