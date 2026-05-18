import { Metadata } from "next"

import {
  getInstagramFeedMedia,
  getInstagramHandleDisplay,
  getInstagramProfileUrl,
} from "@lib/data/instagram"
import { getHomeFeaturedRangeProducts, getProductsById } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getProductPrice } from "@lib/util/get-product-price"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import HomeCoreServicesLordicons from "@modules/home/components/home-core-services-lordicons"
import HowOrderWorksSection from "@modules/home/components/how-order-works-section"
import SpaceHero from "@modules/home/components/space-hero"
import HeroOverlay from "@modules/home/components/space-hero/hero-overlay"
import InstagramFeedStrip from "@modules/home/components/instagram-feed-strip"
import ScrollingPictureBar from "@modules/home/components/scrolling-picture-bar"
import SectionHeader from "@modules/common/components/section-header"
import ProductListingCard from "@modules/products/components/product-listing-card"
import { buildProductListingCardData } from "@modules/products/lib/product-listing-card-data"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { countryCode } = await params
  const canonicalPath = `/${countryCode}`
  const description = SEO.siteDescription

  return {
    title: "Custom Apparel & Branded Merch",
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `${SEO.siteName} | Custom Apparel & Branded Merch`,
      description,
      images: [SEO.ogImage],
    },
    twitter: {
      title: `${SEO.siteName} | Custom Apparel & Branded Merch`,
      description,
      images: [SEO.ogImage],
    },
  }
}

const TRUST_ITEMS = [
  "Victoria-based",
  "Quotes within 24h",
  "From 24 garments",
  "In-house design & proofs",
]

const WHY_STATS = [
  { value: "10+ yrs", label: "Printing experience" },
  { value: "Victoria, AU", label: "Local studio" },
  { value: "24 hrs", label: "Quote turnaround" },
  { value: "From 24", label: "Minimum order" },
]

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const products = await getHomeFeaturedRangeProducts({
    countryCode,
    limit: 12,
  })

  const productIds = (products ?? [])
    .map((product) => product.id)
    .filter(Boolean) as string[]
  const pricedProducts = productIds.length
    ? await getProductsById({
        ids: productIds,
        regionId: region.id,
      })
    : []

  const pricedMap = new Map(
    pricedProducts.map((product) => [product.id, product])
  )

  const instagramMedia = await getInstagramFeedMedia()
  const instagramProfileUrl = getInstagramProfileUrl()
  const instagramHandle = getInstagramHandleDisplay()

  const homepagePath = `/${countryCode}`
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO.siteName,
    url: buildAbsoluteUrl(homepagePath),
    potentialAction: {
      "@type": "SearchAction",
      target: `${buildAbsoluteUrl(
        `/${countryCode}/search`
      )}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <div className="bg-ui-bg-base">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(homeStructuredData),
          }}
        />

        {/* 1. Hero */}
        <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
          <SpaceHero style={{ position: "absolute", inset: 0, height: "100%" }} />
          <HeroOverlay />
        </section>

        {/* 2. Trust strip — immediately under hero */}
        <section className="border-y border-ui-border-base bg-ui-bg-base">
          <ul className="content-container flex list-none flex-wrap items-center justify-center gap-x-8 gap-y-2 px-0 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-ui-fg-subtle small:text-sm">
            {TRUST_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--brand-accent)]"
                  aria-hidden
                >
                  <polyline points="3 8 7 12 13 4" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Featured products — on screen within 2–3 scrolls */}
        <section className="content-container py-12">
          <SectionHeader
            eyebrow="Featured range"
            title="Popular garments to start your order"
            action={
              <LocalizedClientLink
                href="/store"
                className="text-sm font-semibold text-ui-fg-base underline underline-offset-4"
              >
                View all products
              </LocalizedClientLink>
            }
          />

          <ul className="no-scrollbar flex list-none snap-x gap-5 overflow-x-auto pb-2">
            {products.map((product) => {
              const pricedProduct = product.id
                ? pricedMap.get(product.id)
                : undefined
              const { cheapestPrice } = pricedProduct
                ? getProductPrice({ product: pricedProduct })
                : { cheapestPrice: null }
              const data = buildProductListingCardData(
                pricedProduct ?? product,
                cheapestPrice
              )
              return (
                <li
                  key={product.id}
                  className="w-[280px] shrink-0 snap-start"
                >
                  <ProductListingCard {...data} />
                </li>
              )
            })}
          </ul>
        </section>

        {/* 4. Brand carousel — contextualises the products above */}
        <ScrollingPictureBar />

        {/* 5. Services — shown while customer is in discovery mode */}
        <section className="content-container py-14">
          <SectionHeader
            eyebrow="Decoration & finishing"
            title="Services we offer on your order"
          />
          <HomeCoreServicesLordicons />
        </section>

        {/* 6. How to order — once the customer has seen what's available */}
        <HowOrderWorksSection />

        {/* 7. Why SC Prints + single closing CTA */}
        <section className="content-container py-16">
          <SectionHeader
            eyebrow="Why SC Prints"
            title="Built for teams that need it right."
            align="center"
          />

          <ul className="mt-8 grid list-none grid-cols-2 gap-4 p-0 small:grid-cols-4">
            {WHY_STATS.map((stat) => (
              <li
                key={stat.label}
                className="rounded-lg border border-ui-border-base bg-white p-6 text-center"
              >
                <p className="text-2xl font-semibold text-ui-fg-base small:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-ui-fg-subtle">
                  {stat.label}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl border border-ui-border-base bg-ui-bg-subtle p-8 text-center small:p-10">
            <h3 className="text-2xl font-semibold text-ui-fg-base small:text-3xl">
              Talk to our team about your run.
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-ui-fg-subtle">
              Pricing, garment selection, artwork &mdash; we&apos;ll come back
              within one business day.
            </p>
            <div className="mt-7 flex justify-center">
              <LocalizedClientLink
                href="/contact"
                className="inline-flex rounded-lg bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                Start a quote
              </LocalizedClientLink>
            </div>
          </div>
        </section>

        {/* 8. Instagram — social proof near the bottom-of-funnel moment */}
        <InstagramFeedStrip
          items={instagramMedia}
          profileUrl={instagramProfileUrl}
          handleDisplay={instagramHandle}
        />
      </div>
  )
}
