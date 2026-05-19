import { Metadata } from "next"
import { notFound } from "next/navigation"

import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getIndustry, industries } from "@modules/industries/data/industries"

type Props = {
  params: Promise<{
    countryCode: string
    industry: string
  }>
}

export async function generateStaticParams() {
  return industries.map((i) => ({ industry: i.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { industry: slug, countryCode } = await params
  const industry = getIndustry(slug)

  if (!industry) {
    return { title: "Industry" }
  }

  return {
    title: `${industry.title} | ${SEO.siteName}`,
    description: industry.description,
    alternates: {
      canonical: `/${countryCode}/industries/${industry.slug}`,
    },
    openGraph: {
      url: buildAbsoluteUrl(`/${countryCode}/industries/${industry.slug}`),
      title: `${industry.title} | ${SEO.siteName}`,
      description: industry.description,
      images: [SEO.ogImage],
    },
  }
}

export default async function IndustryPage({ params }: Props) {
  const { industry: slug } = await params
  const industry = getIndustry(slug)

  if (!industry) notFound()

  const others = industries.filter((i) => i.slug !== industry.slug)

  return (
    <div className="content-container py-10 small:py-16">
      <section className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.18em] text-ui-fg-muted">
          Industry
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ui-fg-base small:text-4xl">
          {industry.title}
        </h1>
        <p className="mt-4 text-base text-ui-fg-subtle small:text-lg">
          {industry.description}
        </p>

        <ul className="mt-8 grid gap-2 text-base text-ui-fg-base small:grid-cols-2">
          {industry.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2">
              <span aria-hidden className="mt-1 text-[var(--brand-secondary)]">
                •
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <LocalizedClientLink
            href={`/contact?industry=${industry.slug}`}
            className="rounded-full bg-[var(--brand-secondary)] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[var(--brand-accent)]"
          >
            Get a quote for {industry.name}
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/store"
            className="rounded-full border border-ui-border-base px-6 py-3 text-base font-medium text-ui-fg-base transition-colors hover:bg-ui-bg-subtle"
          >
            Browse all apparel
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/customizer"
            className="rounded-full border border-ui-border-base px-6 py-3 text-base font-medium text-ui-fg-base transition-colors hover:bg-ui-bg-subtle"
          >
            Design your own
          </LocalizedClientLink>
        </div>
      </section>

      {others.length > 0 ? (
        <section className="mt-16 border-t border-ui-border-base pt-10">
          <h2 className="text-xl font-semibold tracking-tight text-ui-fg-base">
            Other industries we serve
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {others.map((i) => (
              <li key={i.slug}>
                <LocalizedClientLink
                  href={`/industries/${i.slug}`}
                  className="rounded-full border border-ui-border-base px-4 py-2 text-sm text-ui-fg-subtle transition-colors hover:bg-ui-bg-subtle hover:text-ui-fg-base"
                >
                  {i.name}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
