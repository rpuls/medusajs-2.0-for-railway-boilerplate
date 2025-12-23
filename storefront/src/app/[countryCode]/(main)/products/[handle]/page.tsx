import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import ProductTemplate from "@modules/products/templates"
import { getRegion, listRegions } from "@lib/data/regions"
import { getProductByHandle, getProductsList } from "@lib/data/products"
import { getBrandById } from "@lib/data/brands"
import { generateProductSchema } from "@lib/seo/product-schema"
import { generateProductBreadcrumb } from "@lib/seo/breadcrumb-schema"
import { generateOrganizationSchema } from "@lib/seo/organization-schema"
import { generateWebPageSchema } from "@lib/seo/webpage-schema"
import { generateHreflangMetadata } from "@lib/seo/hreflang"
import { getProductUrl, getProductImages } from "@lib/seo/utils"
import { getProductPriceForSchema } from "@lib/seo/utils"
import { stripHtml, htmlToMetaDescription } from "@lib/util/strip-html"
import { getTranslations, getTranslation } from "@lib/i18n/server"
import JsonLdScript from "components/seo/json-ld-script"
import PreloadImage from "components/seo/preload-image"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

// MIGRATED: Removed export const revalidate = 3600 (incompatible with Cache Components)
// MIGRATED: Removed export const dynamicParams = false (incompatible with Cache Components)
// TODO: Will add generateStaticParams and "use cache" + cacheLife() after analyzing build errors

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

  const productUrl = getProductUrl(handle, normalizedCountryCode)
  const images = getProductImages(product)
  const priceData = getProductPriceForSchema(product)
  
  // Get translations for metadata
  const translations = await getTranslations(normalizedCountryCode)
  const siteName = getTranslation(translations, "metadata.siteName")
  
  // Generate keyword-rich description
  // Keywords are naturally integrated into descriptions (not separate meta tags)
  // This helps SEO by including relevant terms from categories, brands, etc.
  // IMPORTANT: Strip HTML tags from product description for meta description
  let description = stripHtml(product.description) || product.title || ""
  
  // If description is still empty or too short, create a meaningful fallback
  if (!description || description.trim().length < 20) {
    const productName = product.title || getTranslation(translations, "metadata.product.fallbackTitle")
    const categoryName = product.categories?.[0]?.name || "products"
    const fallbackTemplate = getTranslation(translations, "metadata.product.fallbackDescription")
    description = fallbackTemplate
      .replace("{productName}", productName)
      .replace("{categoryName}", categoryName)
  }
  
  // Enhance description with category context for better keyword optimization
  if (product.categories && product.categories.length > 0) {
    const categoryName = product.categories[0].name
    if (categoryName && !description.toLowerCase().includes(categoryName.toLowerCase())) {
      const shopCategoryTemplate = getTranslation(translations, "metadata.product.shopCategory")
      description = `${description} ${shopCategoryTemplate.replace("{categoryName}", categoryName)}`
    }
  }
  
  // Add brand context if available (for keyword optimization)
  const brandId = (product as any).metadata?._brand_id
  if (brandId) {
    const brand = await getBrandById(brandId)
    if (brand?.name && !description.toLowerCase().includes(brand.name.toLowerCase())) {
      const brandTemplate = getTranslation(translations, "metadata.product.authenticBrand")
      description = `${description} ${brandTemplate.replace("{brandName}", brand.name)}`
    }
  }
  
  // Ensure description is optimal length (150-160 characters for best SEO)
  // Use htmlToMetaDescription to ensure proper formatting
  description = htmlToMetaDescription(description, 160)
  
  // Ensure minimum length
  if (description.length < 120) {
    // Pad with additional context if too short
    const padding = getTranslation(translations, "metadata.product.shopOnline")
    const maxPaddingLength = 160 - description.length
    if (maxPaddingLength > padding.length) {
      description = description + " " + padding
    } else {
      description = description + " " + padding.substring(0, maxPaddingLength - 3) + "..."
    }
  }

  // Generate hreflang metadata
  const hreflangAlternates = await generateHreflangMetadata(
    `/products/${handle}`,
    normalizedCountryCode
  )

  // Preload LCP image (first product image) for faster LCP
  const lcpImage = images.length > 0 ? images[0] : null

  // Generate SEO-optimized title (30-60 characters recommended)
  // Format: "Product Name - Category | MS Store" or "Product Name | MS Store"
  let seoTitle = product.title || getTranslation(translations, "metadata.product.fallbackTitle")
  if (product.categories && product.categories.length > 0) {
    const categoryName = product.categories[0].name
    // Only add category if title is short enough
    if (seoTitle.length < 35 && categoryName) {
      seoTitle = `${seoTitle} - ${categoryName}`
    }
  }
  seoTitle = `${seoTitle} | ${siteName}`
  
  // Ensure title is within recommended range (30-60 characters)
  if (seoTitle.length < 30) {
    // Add descriptive text if too short
    const shopOnlineShort = getTranslation(translations, "metadata.product.shopOnlineShort")
    seoTitle = `${product.title} - ${shopOnlineShort} | ${siteName}`
  }
  if (seoTitle.length > 60) {
    // Truncate if too long, keeping " | MS Store" suffix
    const suffixLength = siteName.length + 3 // " | " + siteName
    const maxLength = 60 - suffixLength
    seoTitle = `${seoTitle.substring(0, maxLength)}... | ${siteName}`
  }

  return {
    title: seoTitle,
    description: description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: productUrl,
      languages: hreflangAlternates,
    },
    openGraph: {
      title: seoTitle,
      description: description,
      type: "website",
      images: images.length > 0 ? images : [],
      url: productUrl,
      siteName: siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: description,
      images: images.length > 0 ? [images[0]] : [],
      site: "@msstore", // Add Twitter handle (update with actual handle)
      creator: "@msstore", // Add Twitter creator (update with actual handle)
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

  // Get brand information if available
  let brandName: string | null = null
  const brandId = (pricedProduct as any).metadata?._brand_id
  if (brandId) {
    const brand = await getBrandById(brandId)
    brandName = brand?.name || null
  }

  // Get categories for breadcrumb
  const categories = pricedProduct.categories?.map((cat: any) => ({
    name: cat.name || "",
    handle: cat.handle || "",
  })) || []

  // Generate keyword-rich description (same logic as in generateMetadata)
  let productDescription = pricedProduct.description || pricedProduct.title || ""
  if (pricedProduct.categories && pricedProduct.categories.length > 0) {
    const categoryName = pricedProduct.categories[0].name
    if (categoryName && !productDescription.toLowerCase().includes(categoryName.toLowerCase())) {
      productDescription = `${productDescription} Shop ${categoryName} at MS Store.`
    }
  }
  if (brandName && !productDescription.toLowerCase().includes(brandName.toLowerCase())) {
    productDescription = `${productDescription} Authentic ${brandName} products.`
  }
  if (productDescription.length > 160) {
    productDescription = productDescription.substring(0, 157) + "..."
  }

  // Generate JSON-LD schemas
  const productSchema = generateProductSchema({
    product: pricedProduct,
    countryCode: normalizedCountryCode,
    brandName,
    categories,
  })

  const productUrl = getProductUrl(handle, normalizedCountryCode)
  const images = getProductImages(pricedProduct)
  const breadcrumbSchema = generateProductBreadcrumb(
    pricedProduct.title || "",
    productUrl,
    categories[0]?.name,
    categories[0] ? `/categories/${categories[0].handle}` : undefined,
    normalizedCountryCode
  )

  // Generate Organization schema with logo and contact point
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000"
  const organizationSchema = generateOrganizationSchema({
    name: "MS Store",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    contactPoint: {
      telephone: "00877 300 815",
      email: "orders@phytolife.bg",
      contactType: "customer service",
    },
    sameAs: [
      // Add your social media profiles here
      // "https://www.facebook.com/yourstore",
      // "https://twitter.com/yourstore",
      // "https://www.instagram.com/yourstore",
    ],
  })

  // Generate WebPage schema for better SEO
  const webpageSchema = generateWebPageSchema({
    name: pricedProduct.title || "",
    description: productDescription,
    url: productUrl,
    image: images.length > 0 ? images[0] : undefined,
    publisher: {
      name: "MS Store",
      logo: `${baseUrl}/logo.png`,
    },
  })

  // Preload LCP image (first product image) for faster LCP
  const lcpImage = pricedProduct.images?.[0]?.url || pricedProduct.thumbnail

  return (
    <>
      {/* Preload LCP image for faster Largest Contentful Paint */}
      {lcpImage && <PreloadImage src={lcpImage} />}
      
      {/* JSON-LD Structured Data */}
      <JsonLdScript id="product-schema" data={productSchema} />
      <JsonLdScript id="webpage-schema" data={webpageSchema} />
      <JsonLdScript id="breadcrumb-schema" data={breadcrumbSchema} />
      <JsonLdScript id="organization-schema" data={organizationSchema} />

      <Suspense fallback={<div>Loading product...</div>}>
        <ProductTemplate
          product={pricedProduct}
          region={region}
          countryCode={normalizedCountryCode}
        />
      </Suspense>
    </>
  )
}
