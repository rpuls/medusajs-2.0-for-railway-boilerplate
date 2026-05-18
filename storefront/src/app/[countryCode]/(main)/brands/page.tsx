import { Metadata } from "next"
import { Suspense } from "react"

import { listBrands } from "@lib/data/brands"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import BrandsHero from "@modules/brands/components/brands-hero"
import { BrandsGraphPreview } from "@modules/graph/components/brands-graph-preview"
import { getBrandPresentation, brandInitials } from "@modules/brands/data/brands"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionHeader from "@modules/common/components/section-header"
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

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
)

function BrandsPageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[38vh] bg-ui-bg-subtle" />
      <div className="content-container border-t border-ui-border-base py-16 small:py-20">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <div className="h-7 w-52 mx-auto rounded-lg bg-ui-bg-component" />
          <div className="h-4 w-80 mx-auto rounded bg-ui-bg-component" />
        </div>
        <div className="mx-auto mt-10 max-w-5xl h-[28rem] rounded-2xl bg-ui-bg-component" />
      </div>
      <div className="content-container border-t border-ui-border-base py-16 small:py-20">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <div className="h-7 w-28 mx-auto rounded-lg bg-ui-bg-component" />
          <div className="h-4 w-96 mx-auto rounded bg-ui-bg-component" />
        </div>
        <ul className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 small:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="h-28 rounded-xl bg-ui-bg-component" />
          ))}
        </ul>
      </div>
    </div>
  )
}

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

  const brandsById = new Map(brands.map((b) => [b.id, b]))
  const sortedBrands = [...brands].sort((a, b) => {
    const aHasChildren = brands.some((x) => x.parent_id === a.id)
    const bHasChildren = brands.some((x) => x.parent_id === b.id)
    if (aHasChildren !== bHasChildren) return aHasChildren ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  return (
    <>
      <BrandsHero brands={brands} />

      <section className="content-container border-t border-ui-border-base py-16 small:py-20">
        <SectionHeader
          eyebrow="Interactive map"
          title="Explore the catalog"
          align="center"
        />
        <p className="mx-auto -mt-3 mb-10 max-w-2xl text-center text-ui-fg-subtle">
          Each dot is a brand in our catalog. Click one to open the full
          interactive map of its products and categories.
        </p>
        <div className="mx-auto max-w-5xl">
          <BrandsGraphPreview summary={previewPayload} />
          <div className="mt-8 flex justify-center">
            <LocalizedClientLink
              href="/explore"
              className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              Open full catalog graph
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </LocalizedClientLink>
          </div>
        </div>
      </section>

      <section className="content-container border-t border-ui-border-base py-16 small:py-20">
        <SectionHeader
          eyebrow="All brands"
          title="Full list"
          align="center"
        />
        <p className="mx-auto -mt-3 mb-10 max-w-2xl text-center text-ui-fg-subtle">
          We source quality garments and caps from trusted suppliers. Tell us
          your brand or garment code when you request a quote.
        </p>

        <ul className="mx-auto grid max-w-6xl list-none grid-cols-2 gap-3 p-0 small:grid-cols-3 md:grid-cols-4">
          {sortedBrands.map((b) => {
            const presentation = getBrandPresentation(b.handle)
            const logoSrc = b.logo_url ?? presentation.logoSrc ?? null
            const parent = b.parent_id ? brandsById.get(b.parent_id) : null
            const initials = presentation.initials || brandInitials(b.name)
            return (
              <li key={b.id}>
                <LocalizedClientLink
                  href={`/brands/${b.handle}`}
                  className="group flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-ui-border-base bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-[var(--brand-secondary)]/40 hover:shadow-sm"
                >
                  <span className="flex h-16 w-full items-center justify-center">
                    {logoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoSrc}
                        alt=""
                        className="max-h-full max-w-[80%] object-contain [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.08))]"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-lg text-xs font-bold uppercase tracking-tight text-white shadow-sm ${presentation.bgClass}`}
                        aria-hidden
                      >
                        {initials}
                      </span>
                    )}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-ui-fg-base transition-colors group-hover:text-[var(--brand-secondary)]">
                      {b.name}
                    </span>
                    {parent ? (
                      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-ui-fg-subtle">
                        {parent.name} family
                      </span>
                    ) : null}
                  </span>
                </LocalizedClientLink>
              </li>
            )
          })}
        </ul>

        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-ui-border-base bg-ui-bg-subtle p-8 text-center small:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Can&apos;t find your brand?
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-ui-fg-base small:text-3xl">
            We can source garments from most major suppliers.
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-ui-fg-subtle">
            Tell us the brand and style code &mdash; we&apos;ll come back with
            pricing and availability within one business day.
          </p>
          <div className="mt-7 flex justify-center">
            <LocalizedClientLink
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              Request a quote
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </LocalizedClientLink>
          </div>
        </div>
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
