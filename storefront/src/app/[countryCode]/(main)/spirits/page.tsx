import { Metadata } from "next"

import { SPIRIT_TYPES } from "@lib/data/spirits"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionHeader from "@modules/common/components/section-header"

type Props = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryCode } = await params
  const path = `/${countryCode}/spirits`
  const description =
    "Print your custom label on premium spirit bottles. Vodka, gin, whisky, rum, tequila, champagne and more — UV-printed at our Sydney workshop."

  return {
    title: "Custom-printed spirit bottles",
    description,
    alternates: { canonical: path },
    openGraph: {
      url: buildAbsoluteUrl(path),
      title: `Custom spirit bottles | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
    twitter: {
      title: `Custom spirit bottles | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
  }
}

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    width="14"
    height="14"
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

export default async function SpiritsHubPage({ params }: Props) {
  const { countryCode } = await params

  return (
    <>
      <section className="relative overflow-hidden border-b border-ui-border-base bg-ui-bg-base">
        <div className="content-container py-20 small:py-28">
          <div className="mx-auto max-w-3xl text-center animate-[fade-in_0.6s_ease-out]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/80">
              Custom printing
            </p>
            <h1 className="mt-4 text-4xl small:text-5xl font-semibold text-ui-fg-base">
              Custom-printed spirit bottles
            </h1>
            <p className="mt-5 text-lg text-ui-fg-subtle">
              Pick a bottle. Design your label in the browser. We UV-print and
              ship from our Sydney workshop. Perfect for weddings, brand
              activations, corporate gifts, and milestone moments.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LocalizedClientLink
                href="#spirit-types"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-secondary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
              >
                Browse spirit types
                <ArrowRightIcon className="-mr-1" />
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-ui-border-base px-5 py-2.5 text-sm font-medium text-ui-fg-base hover:bg-ui-bg-subtle transition"
              >
                Get a quote
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </section>

      <section
        id="spirit-types"
        className="content-container border-t border-ui-border-base py-16 small:py-20"
      >
        <SectionHeader
          eyebrow="Shop by spirit"
          title="Pick a spirit to start designing"
          align="center"
        />
        <ul className="mt-10 grid grid-cols-1 gap-4 small:grid-cols-2 medium:grid-cols-3">
          {SPIRIT_TYPES.map((spirit) => (
            <li key={spirit.slug}>
              <LocalizedClientLink
                href={`/spirits/${spirit.slug}`}
                className="group relative flex h-full flex-col gap-3 rounded-2xl border border-ui-border-base bg-ui-bg-base p-6 transition hover:-translate-y-0.5 hover:border-[var(--brand-secondary)] hover:shadow-md"
              >
                <span className="text-4xl" aria-hidden>
                  {spirit.emoji}
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-ui-fg-base">
                    {spirit.name}
                  </h3>
                  <p className="mt-1 text-sm text-ui-fg-subtle">
                    {spirit.tagline}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-secondary)] group-hover:gap-2 transition-[gap]">
                  Browse {spirit.noun}
                  <ArrowRightIcon />
                </span>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </section>

      <section className="content-container border-t border-ui-border-base py-16 small:py-20">
        <SectionHeader
          eyebrow="How it works"
          title="From design to delivery in a few clicks"
          align="left"
        />
        <ol className="mt-8 grid grid-cols-1 gap-6 small:grid-cols-3">
          <li className="rounded-2xl border border-ui-border-base bg-ui-bg-subtle/30 p-6">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-secondary)] text-sm font-semibold text-white">
              1
            </span>
            <h3 className="mt-3 text-lg font-semibold text-ui-fg-base">
              Pick your bottle
            </h3>
            <p className="mt-1 text-sm text-ui-fg-subtle">
              Choose from vodka, gin, whisky and more — our partner shops supply
              the actual branded bottles.
            </p>
          </li>
          <li className="rounded-2xl border border-ui-border-base bg-ui-bg-subtle/30 p-6">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-secondary)] text-sm font-semibold text-white">
              2
            </span>
            <h3 className="mt-3 text-lg font-semibold text-ui-fg-base">
              Design your label
            </h3>
            <p className="mt-1 text-sm text-ui-fg-subtle">
              Upload your artwork, add text, position it on the bottle in our
              browser editor. No software required.
            </p>
          </li>
          <li className="rounded-2xl border border-ui-border-base bg-ui-bg-subtle/30 p-6">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-secondary)] text-sm font-semibold text-white">
              3
            </span>
            <h3 className="mt-3 text-lg font-semibold text-ui-fg-base">
              We print &amp; ship
            </h3>
            <p className="mt-1 text-sm text-ui-fg-subtle">
              UV DTF printing for full-colour, durable labels. Shipped from our
              Sydney workshop within 2–3 weeks.
            </p>
          </li>
        </ol>
      </section>
    </>
  )
}
