import { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  getCollectionByHandle,
  getCollectionsList,
} from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: SortOptions
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

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  const { collections } = await getCollectionsList()

  if (!collections) {
    return []
  }

  const countryCodes = await listRegions().then(
    (regions: StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  const collectionHandles = collections.map(
    (collection: StoreCollection) => collection.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string) =>
      collectionHandles.map((handle: string | undefined) => ({
        countryCode,
        handle,
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle, countryCode } = await params
  const collection = await getCollectionByHandle(handle)

  if (!collection) {
    notFound()
  }

  const metadata = {
    title: collection.title,
    description: `${collection.title} collection`,
    alternates: {
      canonical: `/${countryCode}/collections/${collection.handle}`,
    },
    openGraph: {
      url: buildAbsoluteUrl(`/${countryCode}/collections/${collection.handle}`),
      title: `${collection.title} | ${SEO.siteName}`,
      description: `${collection.title} collection`,
    },
    twitter: {
      title: `${collection.title} | ${SEO.siteName}`,
      description: `${collection.title} collection`,
      images: [SEO.ogImage],
    },
  } as Metadata

  return metadata
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle, countryCode } = await params
  const { sortBy, page, minPrice, maxPrice, inStock, brand, fabric } = await searchParams

  const collection = await getCollectionByHandle(handle).then(
    (collection: StoreCollection) => collection
  )

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy}
      minPrice={parsePositiveNumber(minPrice)}
      maxPrice={parsePositiveNumber(maxPrice)}
      inStock={inStock === "1"}
      brand={brand?.trim() || undefined}
      fabric={fabric?.trim() || undefined}
      countryCode={countryCode}
    />
  )
}
