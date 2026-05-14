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
import InstagramFeedStrip from "@modules/home/components/instagram-feed-strip"
import ScrollingPictureBar from "@modules/home/components/scrolling-picture-bar"
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

const VALUE_PROPS = [
  "Volume pricing for teams & businesses",
  "Consistent colour and finish you can trust",
  "Huge range of apparel and promo products",
  "In-house design and digital proofs",
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
        <SpaceHero style={{ height: "100vh" }} />

        {/* 2. Value props reassurance strip — immediately under hero */}
        <section className="overflow-hidden border-b border-ui-border-base bg-ui-bg-subtle py-4">
          <div className="value-marquee-track flex min-w-max gap-6 whitespace-nowrap px-6 text-sm font-semibold uppercase tracking-[0.12em] text-ui-fg-base">
            {[...VALUE_PROPS, ...VALUE_PROPS].map((value, index) => (
              <span
                key={`${value}-${index}`}
                className="flex items-center gap-6"
              >
                {value}
                <span className="text-ui-fg-muted">|</span>
              </span>
            ))}
          </div>
        </section>

        {/* 3. Featured products — on screen within 2–3 scrolls */}
        <section className="content-container py-12">
          <div className="mb-6 flex items-end justify-between">
            <div className="border-l-4 border-[var(--brand-secondary)] pl-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
                Featured range
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-ui-fg-base">
                Popular garments to start your order
              </h2>
            </div>
            <LocalizedClientLink
              href="/store"
              className="text-sm font-semibold text-ui-fg-base underline underline-offset-4"
            >
              View all products
            </LocalizedClientLink>
          </div>

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
          <div className="border-l-4 border-[var(--brand-secondary)] pl-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              Decoration &amp; finishing
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-ui-fg-base">
              Services we offer on your order
            </h2>
          </div>
          <HomeCoreServicesLordicons />
        </section>

        {/* 6. How to order — once the customer has seen what's available */}
        <HowOrderWorksSection />

        {/* 7. Bulk order CTA — when the customer is closest to a decision */}
        <section className="content-container py-16">
          <div className="rounded-2xl border border-ui-border-base bg-ui-bg-subtle p-8 small:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              Prefer to talk it through?
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-ui-fg-base">
              Help for bulk orders, quotes, and artwork
            </h2>
            <p className="mt-4 max-w-3xl text-ui-fg-subtle">
              Ordering online is not always the right fit. Our Victoria-based
              team can help with pricing, garment selection, proofs, and
              production timelines—whether you are kitting out a crew or
              fulfilling a large retail run.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="mailto:info@scprints.com.au"
                className="inline-flex rounded-lg border border-ui-border-base bg-white px-5 py-3 text-sm font-semibold text-ui-fg-base transition hover:bg-ui-bg-subtle"
              >
                Email the team
              </a>
              <LocalizedClientLink
                href="/contact"
                className="inline-flex rounded-lg bg-ui-fg-base px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
              >
                Contact form
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
