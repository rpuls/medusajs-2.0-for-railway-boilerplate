import { Metadata } from "next"
import { Suspense } from "react"

import { listBrands } from "@lib/data/brands"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import BrandsHero from "@modules/brands/components/brands-hero"
import { BrandsGraphPreview } from "@modules/graph/components/brands-graph-preview"
import { getBrandPresentation } from "@modules/brands/data/brands"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { GraphPayload } from "../../../../types/graph"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { countryCode } = await params
  const canonicalPath = `/${countryCode}/brands`
  const description =
    "Apparel and headwear brands we print and embroider for — from wholesale blanks to retail names."

  return {
    title: "Brands",
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `Brands | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
    twitter: {
      title: `Brands | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
  }
}

/**
 * Skeleton shown while the brands list is loading (Suspense fallback).
 * Matches the rough visual weight of the real content so the layout shift
 * is minimal once the data arrives.
 */
function BrandsPageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero placeholder */}
      <div className="h-[38vh] bg-ui-bg-subtle" />
      {/* Graph preview placeholder */}
      <div className="content-container border-t border-ui-border-base py-16 small:py-20">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <div className="h-7 w-52 mx-auto rounded-lg bg-ui-bg-component" />
          <div className="h-4 w-80 mx-auto rounded bg-ui-bg-component" />
        </div>
        <div className="mx-auto mt-10 max-w-5xl h-[28rem] rounded-2xl bg-ui-bg-component" />
      </div>
      {/* Brand list placeholder */}
      <div className="content-container border-t border-ui-border-base py-16 small:py-20">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <div className="h-7 w-28 mx-auto rounded-lg bg-ui-bg-component" />
          <div className="h-4 w-96 mx-auto rounded bg-ui-bg-component" />
        </div>
        <ul className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 small:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="h-11 rounded-xl bg-ui-bg-component" />
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * Async inner component — fetches brands and renders the full page content.
 * Wrapped in <Suspense> by the default export so the page shell + skeleton
 * stream to the browser immediately while the backend call is in flight.
 *
 * The catalog-graph preview is built directly from the brands list we already
 * have. This avoids the expensive /store/graph product scan (which paginated
 * through all published products just to count them per brand). The preview
 * only shows brand super-nodes + the catalog root, so product counts are not
 * required here — the full /explore page has them.
 */
async function BrandsContent() {
  const brands = await listBrands()

  const previewPayload: GraphPayload = {
    nodes: [
      { id: "root", kind: "root", label: "Catalog" },
      ...brands.map((b) => ({
        id: `brand:${b.name}`,
        kind: "brand" as const,
        label: b.name,
        handle: b.handle,
        logoSrc: b.logo_url ?? getBrandPresentation(b.handle).logoSrc ?? null,
      })),
    ],
    links: brands.map((b) => ({
      source: `brand:${b.name}`,
      target: "root",
      kind: "brand-root" as const,
    })),
    mode: "summary" as const,
  }

  return (
    <>
      <BrandsHero brands={brands} />

      <section className="content-container border-t border-ui-border-base py-16 small:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-ui-fg-base">
            Explore the catalog
          </h2>
          <p className="mt-3 text-ui-fg-subtle">
            Each dot is a brand in our catalog. Click one to open the full interactive map of
            its products and categories.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-5xl">
          <BrandsGraphPreview summary={previewPayload} />
          <div className="mt-4 flex justify-center">
            <LocalizedClientLink
              href="/explore"
              className="rounded-full border border-ui-border-base bg-ui-bg-base px-4 py-2 text-small-regular text-ui-fg-base hover:bg-ui-bg-subtle"
            >
              Open full catalog graph
            </LocalizedClientLink>
          </div>
        </div>
      </section>

      <section className="content-container border-t border-ui-border-base py-16 small:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-ui-fg-base">
            Full list
          </h2>
          <p className="mt-3 text-ui-fg-subtle">
            We source quality garments and caps from trusted suppliers. Tell us your brand or
            garment code when you request a quote.
          </p>
        </div>
        <ul className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 small:grid-cols-3 md:grid-cols-4">
          {brands.map((b) => (
            <li
              key={b.id}
              className="rounded-xl border border-ui-border-base bg-ui-bg-subtle px-4 py-3 text-center text-small-regular text-ui-fg-base"
            >
              <LocalizedClientLink href={`/brands/${b.handle}`} className="hover:text-ui-fg-interactive">
                {b.name}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default function BrandsPage() {
  return (
    <Suspense fallback={<BrandsPageSkeleton />}>
      <BrandsContent />
    </Suspense>
  )
}
