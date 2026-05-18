import { Metadata } from "next"
import Image from "next/image"
import type { SVGProps } from "react"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MarketingHero from "@modules/common/components/marketing-hero"
import SectionHeader from "@modules/common/components/section-header"
import { iconBase } from "@modules/common/icons/icon-base"

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

const ThumbsUpIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props} width="22" height="22">
    <path d="M12 13V8a3 3 0 016 0v5h4a2 2 0 012 2l-2 9a2 2 0 01-2 2H8V13z" />
    <rect x="3" y="13" width="5" height="13" rx="1" />
  </svg>
)

const FileIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props} width="22" height="22">
    <path d="M9 4h11l5 5v19a1 1 0 01-1 1H9a1 1 0 01-1-1V5a1 1 0 011-1z" />
    <path d="M20 4v5h5" />
    <path d="M13 16h8M13 21h6" />
  </svg>
)

const ClockIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props} width="22" height="22">
    <circle cx="16" cy="16" r="11" />
    <path d="M16 9v7l4 3" />
  </svg>
)

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
      >
        <div className="mt-7 flex flex-wrap gap-3">
          <LocalizedClientLink
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Get a design quote
            <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
          </LocalizedClientLink>
        </div>
      </MarketingHero>

      <section className="mt-12">
        <SectionHeader
          eyebrow="Design gallery"
          title="Recent design examples"
        />

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

      <section className="mt-12 grid gap-6 large:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-ui-border-base bg-white p-6 small:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Scope
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ui-fg-base">
            What we do
          </h2>
          <ul className="mt-5 space-y-3 text-sm text-ui-fg-subtle">
            {BULLET_POINTS.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-6 small:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Get started
          </p>
          <h3 className="mt-2 text-xl font-semibold text-ui-fg-base">
            Ready to start?
          </h3>
          <p className="mt-3 text-sm text-ui-fg-subtle">
            Send us a sketch, reference image, or written brief and we&apos;ll
            confirm scope, turnaround, and pricing before work begins.
          </p>
          <LocalizedClientLink
            href="/contact"
            className="group mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Get a design quote
            <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
          </LocalizedClientLink>
        </aside>
      </section>

      <section className="mt-12 grid gap-4 small:grid-cols-3">
        <article className="group rounded-xl border border-ui-border-base bg-white p-6 transition hover:-translate-y-0.5 hover:border-[var(--brand-secondary)]/40 hover:shadow-sm">
          <ThumbsUpIcon className="text-[var(--brand-accent)] transition-colors group-hover:text-[var(--brand-secondary)]" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Best for
          </p>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            Custom parts, enclosures, mounts, display items, personalised
            gifts &mdash; anything that needs a precise 3D model designed before
            it can be printed.
          </p>
        </article>

        <article className="group rounded-xl border border-ui-border-base bg-white p-6 transition hover:-translate-y-0.5 hover:border-[var(--brand-secondary)]/40 hover:shadow-sm">
          <FileIcon className="text-[var(--brand-accent)] transition-colors group-hover:text-[var(--brand-secondary)]" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            What you receive
          </p>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            Production-ready STL and 3MF files, ready to send straight to any
            FDM or resin printer. Files are yours to re-use with no restrictions.
          </p>
        </article>

        <article className="group rounded-xl border border-ui-border-base bg-white p-6 transition hover:-translate-y-0.5 hover:border-[var(--brand-secondary)]/40 hover:shadow-sm">
          <ClockIcon className="text-[var(--brand-accent)] transition-colors group-hover:text-[var(--brand-secondary)]" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Typical turnaround
          </p>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            Usually 3&ndash;5 business days per design after brief sign-off,
            depending on complexity and revision requirements.
          </p>
        </article>
      </section>
    </div>
  )
}
