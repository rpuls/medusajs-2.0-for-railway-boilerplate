import { Metadata } from "next"
import { notFound } from "next/navigation"

import ProductTemplate from "@modules/products/templates"
import { getRegion, listRegions } from "@lib/data/regions"
import { getProductByHandle, getProductsList } from "@lib/data/products"
import { getBaseURL, getStoreName } from "@lib/util/env"
import {
  buildProductStructuredData,
  toJsonLd,
} from "@lib/util/product-structured-data"

/**
 * Absolute, because JSON-LD and the Markdown alternate are read by machines
 * that never resolve a relative URL against the page.
 */
const productUrl = (countryCode: string, handle: string) =>
  `${getBaseURL().replace(/\/+$/, "")}/${countryCode}/products/${handle}`

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export async function generateStaticParams() {
  const countryCodes = await listRegions().then(
    (regions) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  // generateStaticParams must return an array; returning null makes the build
  // fail rather than fall back to on-demand rendering.
  if (!countryCodes) {
    return []
  }

  const products = await Promise.all(
    countryCodes.map((countryCode) => {
      return getProductsList({ countryCode })
    })
  ).then((responses) =>
    responses.map(({ response }) => response.products).flat()
  )

  const staticParams = countryCodes
    ?.map((countryCode) =>
      products.map((product) => ({
        countryCode,
        handle: product.handle,
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle, countryCode } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const product = await getProductByHandle(handle, region.id)

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | ${getStoreName()}`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | ${getStoreName()}`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
    // The same product as Markdown, see products/[handle]/markdown.
    alternates: {
      types: { "text/markdown": `${productUrl(countryCode, handle)}.md` },
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { handle, countryCode } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await getProductByHandle(handle, region.id)
  if (!pricedProduct) {
    notFound()
  }

  const structuredData = buildProductStructuredData({
    product: pricedProduct,
    region,
    productUrl: productUrl(countryCode, handle),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(structuredData) }}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={countryCode}
      />
    </>
  )
}
