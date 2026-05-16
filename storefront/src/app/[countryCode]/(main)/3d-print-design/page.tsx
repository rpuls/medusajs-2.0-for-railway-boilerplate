import { Metadata } from "next"
import Image from "next/image"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MarketingHero from "@modules/common/components/marketing-hero"

const TITLE = "3D Print Design Service"
const DESCRIPTION =
  "We design custom 3D print files in Fusion 360 and deliver production-ready STL and 3MF files — ready to send straight to any FDM or resin printer."

const BULLET_POINTS = [
  "Custom 3D modelling in Fusion 360 from your brief, sketch, or reference",
  "Production-ready STL and 3MF file delivery for FDM and resin printers",
  "Functional part design: enclosures, brackets, mounts, and mechanical fits",
  "Display and decorative items: signage, props, personalised gifts, and accessories",
  "Revision rounds included — we iterate until the geometry is right",
  "Files are yours to keep and re-print as many times as you need",
]

const PLACEHOLDER_IMAGES = Array(3).fill("/placeholders/service-1.svg")

type Props = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryCode } = await params

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical: `/${countryCode}/3d-print-design`,
    },
    openGraph: {
      url: buildAbsoluteUrl(`/${countryCode}/3d-print-design`),
      title: `${TITLE} | ${SEO.siteName}`,
      description: DESCRIPTION,
      images: [SEO.ogImage],
    },
    twitter: {
      title: `${TITLE} | ${SEO.siteName}`,
      description: DESCRIPTION,
      images: [SEO.ogImage],
    },
  }
}

export default async function ThreeDPrintDesignPage() {
  return (
    <div className="content-container py-14 small:py-20">
      <MarketingHero
        eyebrow="3D Print Design"
        eyebrowVariant="muted"
        title={TITLE}
        subtitle={DESCRIPTION}
      />

      <section className="mt-8">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-fg-muted">
            Design Gallery
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ui-fg-base">
            Recent design examples
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-ui-border-base bg-ui-bg-subtle">
          <div className="relative h-[420px] small:h-[520px]">
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0">
              {PLACEHOLDER_IMAGES.map((src, index) => (
                <div
                  key={`3d-design-gallery-${index}`}
                  className={`relative overflow-hidden ${index === 0 ? "row-span-2" : ""}`}
                >
                  <Image
                    src={src}
                    alt={`3D print design example ${index + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-top"
                  />
                </div>
              ))}
            </div>

            <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
              <svg
                className="absolute left-1/2 top-0 h-full w-6 -translate-x-1/2"
                viewBox="0 0 24 100"
                preserveAspectRatio="none"
              >
                <path
                  d="M4 0 L20 100"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <svg
                className="absolute right-0 top-1/2 h-6 w-1/2 -translate-y-1/2"
                viewBox="0 0 100 24"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 16 L100 8"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-8 large:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-ui-border-base bg-white p-6">
          <h2 className="text-xl font-semibold text-ui-fg-base">What we do</h2>
          <ul className="mt-4 space-y-3 text-sm text-ui-fg-subtle">
            {BULLET_POINTS.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-ui-fg-base" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="rounded-xl border border-ui-border-base bg-white p-6">
          <h3 className="text-base font-semibold text-ui-fg-base">Ready to start?</h3>
          <p className="mt-3 text-sm text-ui-fg-subtle">
            Send us a sketch, reference image, or written brief and we will confirm
            scope, turnaround, and pricing before work begins.
          </p>
          <LocalizedClientLink
            href="/contact"
            className="mt-5 inline-flex rounded-lg bg-ui-fg-base px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            Get a design quote
          </LocalizedClientLink>
        </aside>
      </section>

      <section className="mt-8 grid gap-4 small:grid-cols-3">
        <article className="rounded-xl border border-ui-border-base bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-fg-muted">
            Best for
          </p>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            Custom parts, enclosures, mounts, display items, personalised gifts —
            anything that needs a precise 3D model designed before it can be printed.
          </p>
        </article>

        <article className="rounded-xl border border-ui-border-base bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-fg-muted">
            What you receive
          </p>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            Production-ready STL and 3MF files, ready to send straight to any FDM
            or resin printer. Files are yours to re-use with no restrictions.
          </p>
        </article>

        <article className="rounded-xl border border-ui-border-base bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-fg-muted">
            Typical turnaround
          </p>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            Usually 3–5 business days per design after brief sign-off, depending on
            complexity and revision requirements.
          </p>
        </article>
      </section>
    </div>
  )
}
