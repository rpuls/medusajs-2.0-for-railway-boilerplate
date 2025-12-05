import { Metadata } from "next"
import { Suspense } from "react"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600

// Force static generation
export const dynamic = "force-static"

type Params = {
  searchParams: {
    sortBy?: SortOptions
    page?: string
  }
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage({ searchParams, params }: Params) {
  // Await params in Next.js 16
  const resolvedParams = await params
  const { sortBy, page } = searchParams

  return (
    <Suspense fallback={<div>Loading store...</div>}>
      <StoreTemplate
        sortBy={sortBy}
        page={page}
        countryCode={resolvedParams.countryCode}
      />
    </Suspense>
  )
}
