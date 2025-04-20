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
    categoryId?: string
    collectionId?: string
  }
  params: {
    countryCode: string
  }
}

export default async function StorePage({ searchParams, params }: Params) {
  const { sortBy, page, categoryId, collectionId } = searchParams

  return (
    <div className="px-4 sm:px-8">
      <h1 className="text-4xl font-[505] tracking-wider mb-6">All Products</h1>
      <StoreTemplate
        sortBy={sortBy}
        page={page}
        categoryId={categoryId}
        collectionId={collectionId}
        countryCode={params.countryCode}
      />
    </div>
  )
}
