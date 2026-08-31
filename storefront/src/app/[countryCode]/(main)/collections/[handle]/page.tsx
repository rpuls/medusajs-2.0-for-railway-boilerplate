import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle } from "@lib/data/collections"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getStoreName } from "@lib/util/env"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: SortOptions
  }>
}

export const PRODUCT_LIMIT = 12

/**
 * Rendered per request rather than statically.
 *
 * The seed creates categories but no collections, so on a fresh deploy
 * generateStaticParams below returns an empty array. Next still treats the
 * route as static, and rendering one on demand then trips over the cookie
 * access in the shared layout, failing with DYNAMIC_SERVER_USAGE. The result
 * was a 500 on every /collections/* URL, including collections the shop owner
 * later created in the admin, until the storefront was rebuilt.
 *
 * Products and categories are unaffected because the seed gives them
 * non-empty static params.
 *
 * generateStaticParams was removed along with this: `dynamic` is ignored while
 * it is present, and prerendering a list that is empty on a fresh deploy buys
 * nothing anyway. Collections created in the admin now work immediately,
 * without redeploying the storefront.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const collection = await getCollectionByHandle(handle)

  if (!collection) {
    notFound()
  }

  const metadata = {
    title: `${collection.title} | ${getStoreName()}`,
    description: `${collection.title} collection`,
  } as Metadata

  return metadata
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle, countryCode } = await params
  const { sortBy, page } = await searchParams

  const collection = await getCollectionByHandle(handle)

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy}
      countryCode={countryCode}
    />
  )
}
