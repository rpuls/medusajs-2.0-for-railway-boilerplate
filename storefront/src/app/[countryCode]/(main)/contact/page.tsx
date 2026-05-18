import { Metadata } from "next"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import ContactForm from "@modules/contact/components/contact-form"
import ContactMap from "@modules/contact/components/contact-map"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SessionIntro from "@modules/home/components/home-session-intro"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { countryCode } = await params
  const canonicalPath = `/${countryCode}/contact`
  const description = "Get in touch with the SC PRINTS team for quotes, support, and order advice."

  return {
    title: "Contact Us",
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `Contact Us | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
    twitter: {
      title: `Contact Us | ${SEO.siteName}`,
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

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

export default async function ContactPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const contactPath = `/${countryCode}/contact`
  const contactStructuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${SEO.siteName}`,
    url: buildAbsoluteUrl(contactPath),
    mainEntity: {
      "@type": "Organization",
      name: SEO.siteName,
      email: SEO.contactEmail,
      telephone: SEO.contactPhone,
      areaServed: "AU",
    },
  }

  return (
    <SessionIntro>
      <div className="content-container py-14 small:py-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(contactStructuredData) }}
        />

        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
            Customer support
          </p>
          <h1 className="page-title-marketing mt-3 tracking-tight">
            Contact Us
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ui-fg-subtle small:text-lg">
            Have a question about our products or your order? We&apos;re here
            to help.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <LocalizedClientLink
              href="/faq"
              className="group inline-flex items-center gap-2 rounded-lg border border-ui-border-base bg-white px-5 py-2.5 text-sm font-semibold text-ui-fg-base transition hover:bg-ui-bg-subtle"
            >
              Check the FAQ first
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </LocalizedClientLink>
          </div>
        </header>

        <div className="mt-12 grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:gap-10">
          <section
            className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8"
            aria-labelledby="contact-form-heading"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              Send a message
            </p>
            <h2
              id="contact-form-heading"
              className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl"
            >
              Tell us about your project
            </h2>
            <div className="mt-5">
              <ContactForm />
            </div>
          </section>

          <div className="flex flex-col gap-6">
            <section className="overflow-hidden rounded-2xl border border-ui-border-base bg-white">
              <div className="px-6 pt-6 small:px-8 small:pt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
                  Find us
                </p>
                <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
                  Visit our studio
                </h2>
              </div>
              <div className="mt-5">
                <ContactMap />
              </div>
            </section>

            <section className="rounded-2xl border border-ui-border-base bg-ui-bg-subtle p-6 small:p-8">
              <div className="flex items-start gap-3">
                <ClockIcon className="mt-0.5 shrink-0 text-[var(--brand-secondary)]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
                    Open hours
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-ui-fg-base">
                    Monday &ndash; Friday
                  </h3>
                  <p className="mt-1 text-sm text-ui-fg-subtle">
                    9:00am &ndash; 5:00pm AEST
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </SessionIntro>
  )
}
