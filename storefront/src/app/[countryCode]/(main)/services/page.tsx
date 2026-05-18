import { Metadata } from "next"
import type { SVGProps } from "react"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MarketingHero from "@modules/common/components/marketing-hero"
import ScrambleDecodeText from "@modules/common/components/scramble-decode-text"
import SectionHeader from "@modules/common/components/section-header"
import { iconBase } from "@modules/common/icons/icon-base"
import { services } from "@modules/services/data"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { countryCode } = await params
  const canonicalPath = `/${countryCode}/services`
  const description =
    "Explore screen printing, embroidery, digital transfers, and UV printing services for Australian brands and teams."

  return {
    title: "Services",
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `Services | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
    twitter: {
      title: `Services | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
  }
}

const serviceMinimums: Record<string, string> = {
  "screen-printing": "Minimum run: 50 units",
  "digital-transfers": "Minimum run: 1 unit",
  embroidery: "Minimum run: 1 unit",
  "uv-printing": "Minimum run: Custom quoted",
  "uv-dtf": "Minimum run: 1 unit",
}

const SERVICES_HERO_TITLE =
  "Decoration services built for brands, teams, and uniforms"

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

const BriefIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <rect x="6" y="4" width="20" height="24" rx="2" />
    <path d="M11 4v3a1 1 0 001 1h8a1 1 0 001-1V4" />
    <path d="M11 14h10M11 19h10M11 24h6" />
  </svg>
)

const ConfirmIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <rect x="4" y="4" width="24" height="24" rx="2" />
    <path d="M10 16l4 4 8-8" />
  </svg>
)

const ProductionIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <path d="M8 12V5h16v7" />
    <rect x="5" y="12" width="22" height="10" rx="1.5" />
    <rect x="9" y="20" width="14" height="7" />
    <circle cx="23" cy="16" r="1" />
  </svg>
)

type ProductionStep = {
  id: string
  number: string
  title: string
  description: string
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element
}

const PRODUCTION_STEPS: ProductionStep[] = [
  {
    id: "brief",
    number: "01",
    title: "Share your brief",
    description:
      "Send us your products, artwork, quantities, and deadlines — we'll review what you need.",
    Icon: BriefIcon,
  },
  {
    id: "confirm",
    number: "02",
    title: "Confirm & quote",
    description:
      "We confirm method, placement, and pricing. Proofs are produced where required.",
    Icon: ConfirmIcon,
  },
  {
    id: "produce",
    number: "03",
    title: "Approve & produce",
    description:
      "Once approved, our team handles production through to dispatch with quality checks at each stage.",
    Icon: ProductionIcon,
  },
]

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const servicesPath = `/${countryCode}/services`
  const serviceListStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SEO.siteName} Services`,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.shortDescription,
        url: buildAbsoluteUrl(`${servicesPath}/${service.slug}`),
        areaServed: "AU",
        provider: {
          "@type": "Organization",
          name: SEO.siteName,
        },
      },
    })),
  }

  return (
    <div className="content-container py-14 small:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceListStructuredData) }}
      />
      <MarketingHero
        eyebrow="SC PRINTS Services"
        title={
          <>
            <span aria-hidden="true">
              <ScrambleDecodeText text={SERVICES_HERO_TITLE} />
            </span>
            <span className="sr-only">{SERVICES_HERO_TITLE}</span>
          </>
        }
        subtitle="Whether you need large production runs, premium stitched logos, or flexible short-run options, we match each job to the right print method for quality, turnaround, and budget."
      >
        <div className="mt-7 flex flex-wrap gap-3">
          <LocalizedClientLink
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Get a quote
            <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center rounded-lg border border-ui-border-base bg-white px-6 py-3 text-sm font-semibold text-ui-fg-base transition hover:bg-ui-bg-subtle"
          >
            Start shopping blanks
          </LocalizedClientLink>
        </div>
      </MarketingHero>

      <section className="mt-14">
        <SectionHeader
          eyebrow="Core decoration services"
          title="Compare each process"
          action={
            <p className="text-sm text-ui-fg-subtle">
              Minimums, best-use scenarios, and turnaround at a glance.
            </p>
          }
        />

        <div className="grid gap-5">
          {services.map((service) => (
            <article
              key={service.slug}
              className="group rounded-xl border border-ui-border-base bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--brand-secondary)]/55 hover:shadow-md small:p-7"
            >
              <div className="grid gap-5 small:grid-cols-[2fr_1fr] small:gap-7">
                <div>
                  <h3 className="text-2xl font-semibold text-ui-fg-base transition-colors group-hover:text-[var(--brand-secondary)]">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm text-ui-fg-subtle">{service.heroDescription}</p>
                  <ul className="mt-4 space-y-2 text-sm text-ui-fg-subtle">
                    {service.bulletPoints.map((point) => (
                      <li key={point} className="flex gap-2.5">
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand-secondary)]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-[var(--brand-secondary)]/35 bg-ui-bg-subtle p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-fg-muted">
                    Best fit
                  </p>
                  <p className="mt-3 text-sm font-semibold text-ui-fg-base">
                    {serviceMinimums[service.slug] ?? "Minimum run: Custom quoted"}
                  </p>
                  <p className="mt-2 text-sm text-ui-fg-subtle">{service.shortDescription}</p>
                  <LocalizedClientLink
                    href={`/services/${service.slug}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ui-fg-base underline underline-offset-4 transition hover:text-[var(--brand-secondary)]"
                  >
                    View service details
                    <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </LocalizedClientLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="From brief to dispatch"
          title="How your order moves through production"
        />

        <ol className="mt-2 grid list-none grid-cols-1 overflow-hidden rounded-lg border border-ui-border-base bg-white p-0 small:grid-cols-3">
          {PRODUCTION_STEPS.map((step, index) => {
            const { Icon } = step
            const notLast = index < PRODUCTION_STEPS.length - 1
            return (
              <li
                key={step.id}
                className={[
                  "group relative overflow-hidden p-6 transition-colors hover:bg-ui-bg-subtle/50",
                  "border-ui-border-base",
                  notLast ? "border-b small:border-b-0 small:border-r" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-1 -top-3 select-none text-[5rem] font-semibold leading-none tracking-tighter text-[var(--brand-secondary)]/10 transition-colors group-hover:text-[var(--brand-secondary)]/25"
                >
                  {step.number}
                </span>
                <Icon className="relative text-ui-fg-base transition-colors group-hover:text-[var(--brand-secondary)]" />
                <p className="relative mt-4 text-sm font-semibold uppercase tracking-wide text-ui-fg-base">
                  {step.title}
                </p>
                <p className="relative mt-2 text-xs text-ui-fg-subtle">
                  {step.description}
                </p>
              </li>
            )
          })}
        </ol>

        <div className="mt-8 flex flex-wrap justify-center">
          <LocalizedClientLink
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Get a quote
            <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
          </LocalizedClientLink>
        </div>
      </section>
    </div>
  )
}
