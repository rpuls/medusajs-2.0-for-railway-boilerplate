import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import ProductTemplate from "@modules/products/templates"
import { getRegion, listRegions } from "@lib/data/regions"
import { getProductByHandle, getProductsList } from "@lib/data/products"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600

// Force static generation where possible
export const dynamicParams = false

export async function generateStaticParams() {
  const countryCodes = await listRegions().then(
    (regions) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  if (!countryCodes) {
    return null
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
  // Await params in Next.js 16
  const resolvedParams = await params
  
  // Validate params
  if (!resolvedParams?.countryCode || !resolvedParams?.handle) {
    notFound()
  }

  const { handle, countryCode } = resolvedParams
  const normalizedCountryCode = typeof countryCode === 'string' ? countryCode.toLowerCase() : 'us'
  const region = await getRegion(normalizedCountryCode)

  if (!region) {
    notFound()
  }

  const product = await getProductByHandle(handle, region.id)

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | MS Store`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | MS Store`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  // Await params in Next.js 16
  const resolvedParams = await params
  
  // Validate params
  if (!resolvedParams?.countryCode || !resolvedParams?.handle) {
    notFound()
  }

  const { handle, countryCode } = resolvedParams
  const normalizedCountryCode = typeof countryCode === 'string' ? countryCode.toLowerCase() : 'us'
  const region = await getRegion(normalizedCountryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await getProductByHandle(handle, region.id)
  if (!pricedProduct) {
    notFound()
  }

  return (
    <Suspense fallback={<div>Loading product...</div>}>
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={normalizedCountryCode}
      />
    </Suspense>
  )
}
