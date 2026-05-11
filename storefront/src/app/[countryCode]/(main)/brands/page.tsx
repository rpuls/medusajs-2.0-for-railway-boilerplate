import { Metadata } from "next"

import { getGraphSummary } from "@lib/data/graph"
import { listBrands } from "@lib/data/brands"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import BrandsHero from "@modules/brands/components/brands-hero"
import { BrandsGraphPreview } from "@modules/graph/components/brands-graph-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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

export default async function BrandsPage() {
  /**
   * Live brand list from the backend Brand module (one source of truth). Falls back to an
   * empty array if the backend is unreachable — the BrandsHero animation handles that case.
   */
  const brands = await listBrands()
  /**
   * Load the catalog graph summary for the preview embed. The `/store/graph`
   * summary payload is tiny (root + brand + category super-nodes) and is
   * cached via Next.js fetch tags, so we share the same cache with `/explore`.
   * If the backend is unreachable we silently degrade — the text list below
   * still renders and tells the full story.
   */
  let graphSummary = null
  try {
    graphSummary = await getGraphSummary()
  } catch (error) {
    // Log in all environments so production failures are diagnosable in Vercel
    // function logs — the /store/graph route is a fresh endpoint and the most
    // likely cause of a production outage is the Medusa backend not having
    // been redeployed with it yet.
    console.error(
      "[BrandsPage] /store/graph summary unavailable — hiding graph preview. " +
        "If this is unexpected, confirm the Medusa backend was redeployed " +
        "and NEXT_PUBLIC_MEDUSA_BACKEND_URL points at it.",
      error
    )
  }

  return (
    <>
      <BrandsHero brands={brands} />

      {graphSummary ? (
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
            <BrandsGraphPreview summary={graphSummary} />
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
      ) : null}

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
