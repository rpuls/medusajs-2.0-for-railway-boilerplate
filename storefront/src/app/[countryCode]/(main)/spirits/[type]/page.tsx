import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle } from "@lib/data/categories"
import {
  SPIRIT_BY_SLUG,
  SPIRIT_CATEGORY_HANDLE,
  SPIRIT_TYPES,
  type SpiritSlug,
} from "@lib/data/spirits"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import CategoryTemplate from "@modules/categories/templates"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ type: string; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
  }>
}

const parsePositiveNumber = (value?: string) => {
  if (!value) return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return undefined
  return Math.floor(parsed)
}

export async function generateStaticParams() {
  return SPIRIT_TYPES.map((s) => ({ type: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, countryCode } = await params
  const spirit = SPIRIT_BY_SLUG[type]
  if (!spirit) return { title: "Spirits" }

  const path = `/${countryCode}/spirits/${spirit.slug}`
  const description = spirit.description

  return {
    title: `Custom-printed ${spirit.name.toLowerCase()} bottles`,
    description,
    alternates: { canonical: path },
    openGraph: {
      url: buildAbsoluteUrl(path),
      title: `Custom ${spirit.name.toLowerCase()} bottles | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
    twitter: {
      title: `Custom ${spirit.name.toLowerCase()} bottles | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
  }
}

export default async function SpiritTypePage({
  params,
  searchParams,
}: Props) {
  notFound()

  const { type, countryCode } = await params
  const search = await searchParams
  const spirit = SPIRIT_BY_SLUG[type]
  if (!spirit) notFound()

  const handle = SPIRIT_CATEGORY_HANDLE(spirit.slug as SpiritSlug)
  const { product_categories } = await getCategoryByHandle([handle])

  if (!product_categories?.length) {
    /**
     * The spirits-<type> category hasn't been created yet (admin needs to run
     * ensureCategoryTree or add their first bottle). Render a friendly empty
     * state instead of 404 so the navigation still works during ramp-up.
     */
    return (
      <div className="content-container py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
          {spirit.name}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-ui-fg-base">
          {spirit.name} bottles coming soon
        </h1>
        <p className="mt-4 max-w-xl text-ui-fg-subtle">{spirit.description}</p>
        <div className="mt-8 flex gap-3">
          <LocalizedClientLink
            href="/spirits"
            className="rounded-full border border-ui-border-base px-5 py-2.5 text-sm font-medium text-ui-fg-base hover:bg-ui-bg-subtle transition"
          >
            ← All spirits
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/contact"
            className="rounded-full bg-[var(--brand-secondary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
          >
            Get a quote
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  return (
    <CategoryTemplate
      categories={product_categories}
      sortBy={search.sortBy}
      page={search.page}
      minPrice={parsePositiveNumber(search.minPrice)}
      maxPrice={parsePositiveNumber(search.maxPrice)}
      inStock={search.inStock === "1"}
      countryCode={countryCode}
    />
  )
}
