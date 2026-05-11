import { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveBrandByHandle } from "@lib/data/brands"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import StoreTemplate from "@modules/store/templates"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Params = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{
    page?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
    fabric?: string
    tagId?: string
    typeId?: string
    sortBy?: string
  }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string; handle: string }>
}): Promise<Metadata> {
  const { countryCode, handle } = await params
  const { brand } = await retrieveBrandByHandle(handle)
  if (!brand) {
    return { title: "Brand" }
  }
  const canonicalPath = `/${countryCode}/brands/${handle}`
  const description =
    brand.description ??
    `${brand.name} apparel and headwear — explore products available for printing and embroidery.`
  return {
    title: brand.name,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `${brand.name} | ${SEO.siteName}`,
      description,
      images: brand.logo_url ? [{ url: brand.logo_url }] : [SEO.ogImage],
    },
  }
}

const parsePositiveNumber = (value?: string) => {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined
}

export default async function BrandLandingPage({ params, searchParams }: Params) {
  const { countryCode, handle } = await params
  const sp = await searchParams
  const { brand, children } = await retrieveBrandByHandle(handle)
  if (!brand) notFound()

  return (
    <>
      <section className="content-container border-b border-ui-border-base py-10 small:py-14">
        <div className="flex flex-col items-start gap-4 small:flex-row small:items-end small:justify-between">
          <div className="flex items-center gap-4">
            {brand.logo_url ? (
              <img
                src={brand.logo_url}
                alt={brand.name}
                className="h-12 w-auto object-contain"
                loading="lazy"
              />
            ) : null}
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-ui-fg-base">
                {brand.name}
              </h1>
              {brand.description ? (
                <p className="mt-2 max-w-2xl text-base text-ui-fg-subtle">{brand.description}</p>
              ) : null}
            </div>
          </div>
        </div>

        {children.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {children.map((c) => (
              <li key={c.id}>
                <LocalizedClientLink
                  href={`/brands/${c.handle}`}
                  className="rounded-full border border-ui-border-base bg-ui-bg-subtle px-3 py-1 text-small-regular text-ui-fg-base hover:bg-ui-bg-subtle-hover"
                >
                  {c.name}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <StoreTemplate
        sortBy={(sp.sortBy as any) || "created_at"}
        page={sp.page}
        minPrice={parsePositiveNumber(sp.minPrice)}
        maxPrice={parsePositiveNumber(sp.maxPrice)}
        inStock={sp.inStock === "1"}
        brand={brand.handle}
        fabric={sp.fabric?.trim() || undefined}
        typeId={sp.typeId?.trim() || undefined}
        tagId={sp.tagId?.trim() || undefined}
        countryCode={countryCode}
      />
    </>
  )
}
