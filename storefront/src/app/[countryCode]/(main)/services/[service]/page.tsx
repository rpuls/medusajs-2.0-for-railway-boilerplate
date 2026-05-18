import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import type { SVGProps } from "react"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MarketingHero from "@modules/common/components/marketing-hero"
import SectionHeader from "@modules/common/components/section-header"
import { iconBase } from "@modules/common/icons/icon-base"
import { getServiceBySlug } from "@modules/services/data"

const SERVICE_PLACEHOLDER_IMAGES_BY_SLUG: Record<string, string[]> = {
  "digital-transfers": Array(3).fill("/placeholders/services/digital-transfers.svg"),
  "uv-printing": Array(3).fill("/placeholders/services/uv-printing.svg"),
  "uv-dtf": Array(3).fill("/placeholders/services/uv-printing.svg"),
}

type ServiceGalleryImage = {
  src: string
  alt: string
  /** Inner frame size vs cell; >1 shows more of the photo (zoom out). */
  frameScale?: number
  /** For framed images, passed to CSS object-position. */
  objectPosition?: string
}

const EMBROIDERY_GALLERY: ServiceGalleryImage[] = [
  {
    src: "/images/services/embroidery/anime-character-grid.png",
    alt: "Collage of detailed anime and character embroidery samples on assorted coloured fabrics.",
    frameScale: 1.14,
    objectPosition: "center center",
  },
  {
    src: "/images/services/embroidery/gundam-mecha-polo.png",
    alt: "Intricate multi-colour mecha embroidery on royal blue pique fabric.",
    frameScale: 1.1,
    objectPosition: "center 24%",
  },
  {
    src: "/images/services/embroidery/snip-society-scissors.png",
    alt: "Detailed gold and silver embroidery on black fabric: crossed scissors, crown, gems, and Snip Society banner lettering.",
    frameScale: 1.22,
    objectPosition: "center center",
  },
]

const SCREEN_PRINTING_GALLERY: ServiceGalleryImage[] = [
  {
    src: "/images/services/screen-printing/onpoint-kitchens.png",
    alt: "Assorted shirt colours showing yellow and white screen-printed Onpoint Kitchens branding and contact details.",
  },
  {
    src: "/images/services/screen-printing/eco-flush-plumbing.png",
    alt: "Black t-shirts with a neon green and white multi-colour screen-printed plumbing services design.",
  },
  {
    src: "/images/services/screen-printing/hitec-drainage-hivis.png",
    alt: "Bulk stack of hi-vis orange workwear with navy screen-printed Hitec Drainage branding.",
  },
]

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

const ArrowLeftIcon = ({ className }: { className?: string }) => (
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
    <path d="M13 8H3M7 4L3 8l4 4" />
  </svg>
)

const ThumbsUpIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props} width="22" height="22">
    <path d="M12 13V8a3 3 0 016 0v5h4a2 2 0 012 2l-2 9a2 2 0 01-2 2H8V13z" />
    <rect x="3" y="13" width="5" height="13" rx="1" />
  </svg>
)

const ThumbsDownIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props} width="22" height="22">
    <path d="M12 19v5a3 3 0 006 0v-5h4a2 2 0 002-2l-2-9a2 2 0 00-2-2H8v13z" />
    <rect x="3" y="6" width="5" height="13" rx="1" />
  </svg>
)

const ClockIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props} width="22" height="22">
    <circle cx="16" cy="16" r="11" />
    <path d="M16 9v7l4 3" />
  </svg>
)

type Props = {
  params: Promise<{
    countryCode: string
    service: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: serviceSlug, countryCode } = await params
  const service = getServiceBySlug(serviceSlug)

  if (!service) {
    return {
      title: "Service",
    }
  }

  return {
    title: `${service.title} Service`,
    description: service.shortDescription,
    alternates: {
      canonical: `/${countryCode}/services/${service.slug}`,
    },
    openGraph: {
      url: buildAbsoluteUrl(`/${countryCode}/services/${service.slug}`),
      title: `${service.title} | ${SEO.siteName}`,
      description: service.shortDescription,
      images: [SEO.ogImage],
    },
    twitter: {
      title: `${service.title} | ${SEO.siteName}`,
      description: service.shortDescription,
      images: [SEO.ogImage],
    },
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { service: serviceSlug } = await params
  const service = getServiceBySlug(serviceSlug)

  if (!service) {
    notFound()
  }

  const galleryImages = buildServiceGalleryImages(service.slug, service.title)

  return (
    <div className="content-container py-14 small:py-20">
      <LocalizedClientLink
        href="/services"
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ui-fg-base underline underline-offset-4 transition hover:text-[var(--brand-secondary)]"
      >
        <ArrowLeftIcon className="transition-transform group-hover:-translate-x-0.5" />
        Back to services
      </LocalizedClientLink>

      <div className="mt-6">
        <MarketingHero
          eyebrow={service.title}
          eyebrowVariant="muted"
          title={service.title}
          subtitle={service.heroDescription}
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
              Browse blanks
            </LocalizedClientLink>
          </div>
        </MarketingHero>
      </div>

      <section className="mt-12">
        <SectionHeader
          eyebrow="Service gallery"
          title="Recent style references"
        />

        <div className="overflow-hidden rounded-2xl border border-ui-border-base bg-ui-bg-subtle">
          <div className="relative h-[420px] small:h-[520px]">
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0">
              {galleryImages.map((image, index) => {
                const frameScale = image.frameScale ?? 1
                const useFramedCrop =
                  frameScale !== 1 || image.objectPosition !== undefined

                return (
                  <div
                    key={`${service.slug}-gallery-${index}`}
                    className={`relative overflow-hidden ${
                      index === 0 ? "row-span-2" : ""
                    }`}
                  >
                    {useFramedCrop ? (
                      <div className="absolute inset-0 overflow-hidden">
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                          style={{
                            width: `${frameScale * 100}%`,
                            height: `${frameScale * 100}%`,
                          }}
                        >
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                            style={{
                              objectPosition:
                                image.objectPosition ?? "center center",
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover object-top"
                      />
                    )}
                  </div>
                )
              })}
              {galleryImages.length < 3 &&
                Array.from({ length: 3 - galleryImages.length }).map((_, index) => (
                  <div key={`${service.slug}-fallback-tile-${index}`} className="bg-ui-bg-base" />
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
            Why choose this method
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ui-fg-base">
            Why choose {service.title}?
          </h2>
          <ul className="mt-5 space-y-3 text-sm text-ui-fg-subtle">
            {service.bulletPoints.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-6 small:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Not sure?
          </p>
          <h3 className="mt-2 text-xl font-semibold text-ui-fg-base">
            Which method is right?
          </h3>
          <p className="mt-3 text-sm text-ui-fg-subtle">
            Tell us your garment, artwork, quantity, and deadline. We&apos;ll
            recommend the best method and provide a practical quote for
            production.
          </p>
          <LocalizedClientLink
            href="/contact"
            className="group mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Request service quote
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
          <p className="mt-2 text-sm text-ui-fg-subtle">{service.bestFor}</p>
        </article>

        <article className="group rounded-xl border border-ui-border-base bg-white p-6 transition hover:-translate-y-0.5 hover:border-[var(--brand-secondary)]/40 hover:shadow-sm">
          <ThumbsDownIcon className="text-ui-fg-muted transition-colors group-hover:text-[var(--brand-secondary)]" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Not ideal for
          </p>
          <p className="mt-2 text-sm text-ui-fg-subtle">{service.notIdealFor}</p>
        </article>

        <article className="group rounded-xl border border-ui-border-base bg-white p-6 transition hover:-translate-y-0.5 hover:border-[var(--brand-secondary)]/40 hover:shadow-sm">
          <ClockIcon className="text-[var(--brand-accent)] transition-colors group-hover:text-[var(--brand-secondary)]" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Typical turnaround
          </p>
          <p className="mt-2 text-sm text-ui-fg-subtle">{service.typicalTurnaround}</p>
        </article>
      </section>
    </div>
  )
}

function buildServiceGalleryImages(
  serviceSlug: string,
  serviceTitle: string
): ServiceGalleryImage[] {
  if (serviceSlug === "screen-printing") {
    return SCREEN_PRINTING_GALLERY
  }

  if (serviceSlug === "embroidery") {
    return EMBROIDERY_GALLERY
  }

  const urls =
    SERVICE_PLACEHOLDER_IMAGES_BY_SLUG[serviceSlug] ??
    Array(3).fill("/placeholders/service-1.svg")

  return urls.map((src, index) => ({
    src,
    alt: `${serviceTitle} sample ${index + 1}`,
  }))
}
