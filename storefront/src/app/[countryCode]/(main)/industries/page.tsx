import { Metadata } from "next"

import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { industries } from "@modules/industries/data/industries"

type Props = {
  params: Promise<{
    countryCode: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryCode } = await params
  const title = "Industries we serve"
  const description =
    "Custom apparel, uniforms and event merch for trades, hospitality, corporate teams, sports clubs, schools and event organisers across Australia."

  return {
    title: `${title} | ${SEO.siteName}`,
    description,
    alternates: {
      canonical: `/${countryCode}/industries`,
    },
    openGraph: {
      url: buildAbsoluteUrl(`/${countryCode}/industries`),
      title: `${title} | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
  }
}

export default function IndustriesIndexPage() {
  return (
    <div className="content-container py-10 small:py-16">
      <section className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.18em] text-ui-fg-muted">
          Industries
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ui-fg-base small:text-4xl">
          Industries we serve
        </h1>
        <p className="mt-4 text-base text-ui-fg-subtle small:text-lg">
          From hi-vis trade workwear to corporate uniforms, event merch to
          school year-12 leavers&apos; gear — we print and embroider for teams
          across Australia. Pick the vertical that fits.
        </p>
      </section>

      <section className="mt-10 grid gap-4 small:grid-cols-2 large:grid-cols-3">
        {industries.map((i) => (
          <LocalizedClientLink
            key={i.slug}
            href={`/industries/${i.slug}`}
            className="group flex h-full flex-col gap-3 rounded-2xl border border-ui-border-base bg-ui-bg-base p-6 transition-colors hover:border-ui-border-strong hover:bg-ui-bg-subtle"
          >
            <h2 className="text-lg font-semibold text-ui-fg-base group-hover:text-[var(--brand-secondary)]">
              {i.name}
            </h2>
            <p className="text-sm text-ui-fg-subtle">{i.description}</p>
            <span className="mt-auto text-sm font-medium text-[var(--brand-secondary)]">
              See {i.name.toLowerCase()} →
            </span>
          </LocalizedClientLink>
        ))}
      </section>
    </div>
  )
}
