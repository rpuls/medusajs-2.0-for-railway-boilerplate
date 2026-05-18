import { Metadata } from "next"
import { Lora } from "next/font/google"
import type { SVGProps } from "react"

import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionHeader from "@modules/common/components/section-header"
import { iconBase } from "@modules/common/icons/icon-base"
import ByoInquiryForm from "@modules/home/components/byo-inquiry-form"

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
})

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { countryCode } = await params
  const canonicalPath = `/${countryCode}/byo`
  const description =
    "How bring-your-own (BYO) works at SC PRINTS: bring garments or source something outside our online catalogue, and we decorate them for you."

  return {
    title: "BYO: Bring your own merch",
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `BYO: Bring your own merch | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
    twitter: {
      title: `BYO: Bring your own merch | ${SEO.siteName}`,
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

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <polyline points="3 8 7 12 13 4" />
  </svg>
)

const CheckBoxIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <rect x="4" y="4" width="24" height="24" rx="2" />
    <path d="M10 16l4 4 8-8" />
  </svg>
)

const QuoteIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <path d="M6 5h16a2 2 0 012 2v14a2 2 0 01-2 2H10l-6 5V7a2 2 0 012-2z" />
    <path d="M10 12h12M10 17h8" />
  </svg>
)

const ProduceIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <path d="M8 12V5h16v7" />
    <rect x="5" y="12" width="22" height="10" rx="1.5" />
    <rect x="9" y="20" width="14" height="7" />
    <circle cx="23" cy="16" r="1" />
  </svg>
)

const ShipIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <rect x="3" y="9" width="14" height="12" rx="1" />
    <path d="M17 13h5l3 4v4h-8" />
    <circle cx="9" cy="23" r="2" />
    <circle cx="21" cy="23" r="2" />
  </svg>
)

type Step = {
  id: string
  number: string
  title: string
  description: string
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element
}

const STEPS: Step[] = [
  {
    id: "check",
    number: "01",
    title: "Check & confirm",
    description:
      "We check your garments for decoration compatibility — fabric, seams, and placement.",
    Icon: CheckBoxIcon,
  },
  {
    id: "quote",
    number: "02",
    title: "Quote & timeline",
    description:
      "We send a quote and timeline based on the print or embroidery method you need.",
    Icon: QuoteIcon,
  },
  {
    id: "produce",
    number: "03",
    title: "Approve & produce",
    description:
      "After approval, we produce a proof or sample where required, then run production.",
    Icon: ProduceIcon,
  },
  {
    id: "ship",
    number: "04",
    title: "Finish & ship",
    description:
      "We finish, pack, and notify you for pickup or shipping — same as a standard order.",
    Icon: ShipIcon,
  },
]

const BRING_ITEMS = [
  "Clean garments or blanks in the sizes you need — extras for testing where possible.",
  "Any brand or care labels you need preserved, or notes if tags should be changed.",
  "Artwork or a clear brief for our design team — we can advise on formats and resolution.",
  "A rough quantity and in-hands date so we can plan production.",
]

const COLS_LARGE = 4
const COLS_SMALL = 2

export default async function ByoPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const pagePath = `/${countryCode}/byo`
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `BYO: Bring your own merch | ${SEO.siteName}`,
    url: buildAbsoluteUrl(pagePath),
    description:
      "How bring-your-own merch works: what to bring, what we need from you, and how we decorate items sourced outside our online catalogue.",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 1. Hero header */}
      <section className="content-container py-14 small:py-20">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
            Bring your own
          </p>
          <h1
            className={`${lora.className} mt-3 text-4xl font-semibold leading-tight text-[var(--brand-primary)] small:text-5xl`}
          >
            BYO: how it works
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-ui-fg-subtle small:text-lg">
            Not every job starts from our online store. If you have garments
            from elsewhere — or a specific blank in mind — we&apos;ll decorate
            them and handle finishing, advice, and quoting along the way.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href="#byo-inquiry"
              className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              Ask us a BYO question
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center rounded-lg border border-ui-border-base bg-white px-6 py-3 text-sm font-semibold text-ui-fg-base transition hover:bg-ui-bg-subtle"
            >
              Browse the catalog
            </LocalizedClientLink>
          </div>
        </header>
      </section>

      {/* 2. What "BYO" means — short intro */}
      <section className="content-container py-12 small:py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-ui-border-base bg-white p-8 small:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            What &quot;BYO&quot; means
          </p>
          <p className="mt-3 text-base leading-relaxed text-ui-fg-subtle small:text-lg">
            BYO (bring your own) means you supply the blank apparel or merch,
            or you source an item we don&apos;t list on the site. We review what
            you bring in, confirm what decoration options suit the fabric and
            use-case, and quote before we go ahead.
          </p>
        </div>
      </section>

      {/* 4. How BYO works — 4 steps, matches home page rhythm */}
      <section
        className="border-t border-ui-border-base bg-ui-bg-subtle py-12 small:py-16"
        aria-labelledby="byo-process-heading"
      >
        <div className="content-container">
          <SectionHeader
            eyebrow="Process"
            title="How BYO works"
            id="byo-process-heading"
          />
          <ol className="mt-8 grid list-none grid-cols-1 overflow-hidden rounded-lg border border-ui-border-base bg-white p-0 small:grid-cols-2 large:grid-cols-4">
            {STEPS.map((step, index) => {
              const { Icon } = step
              const isLastColLarge = (index + 1) % COLS_LARGE === 0
              const isLastRowLarge =
                index >= STEPS.length - (STEPS.length % COLS_LARGE || COLS_LARGE)
              const isLastColSmall = (index + 1) % COLS_SMALL === 0
              const isLastRowSmall =
                index >= STEPS.length - (STEPS.length % COLS_SMALL || COLS_SMALL)
              return (
                <li
                  key={step.id}
                  className={[
                    "group relative overflow-hidden p-6 transition-colors hover:bg-ui-bg-subtle/50",
                    "border-ui-border-base",
                    index < STEPS.length - 1 ? "border-b small:border-b-0" : "",
                    !isLastColSmall ? "small:border-r large:border-r-0" : "",
                    !isLastRowSmall ? "small:border-b large:border-b-0" : "",
                    !isLastColLarge ? "large:border-r" : "",
                    !isLastRowLarge ? "large:border-b" : "",
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
        </div>
      </section>

      {/* 5. What to bring + Timelines — paired cards */}
      <section className="content-container py-12 small:py-16">
        <div className="grid gap-6 small:grid-cols-2">
          <div className="rounded-2xl border border-ui-border-base bg-white p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              What we&apos;ll need
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ui-fg-base">
              Bring or send us
            </h2>
            <ul className="mt-6 list-none space-y-4 p-0 text-sm text-ui-fg-subtle small:text-base">
              {BRING_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent)]/15 text-[var(--brand-accent)]">
                    <CheckIcon />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col rounded-2xl border border-ui-border-base bg-white p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              Production
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ui-fg-base">
              Timelines
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
              Timelines depend on decoration type, art approval, and current
              workload. We&apos;ll always give a realistic window with your
              quote.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
              Rush jobs may be possible &mdash; just ask when you get in touch.
            </p>
            <div className="mt-auto pt-6">
              <a
                href="#byo-inquiry"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ui-fg-base underline underline-offset-4 transition hover:text-[var(--brand-secondary)]"
              >
                Get a timeline for your project
                <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BYO question form */}
      <section
        className="border-t border-ui-border-base bg-ui-bg-subtle py-14 small:py-20"
        aria-labelledby="byo-inquiry-heading"
      >
        <div className="content-container">
          <SectionHeader
            eyebrow="Send us a question"
            title="Tell us about your BYO project"
            align="center"
            id="byo-inquiry-heading"
          />
          <p className="mx-auto -mt-3 mb-10 max-w-2xl text-center text-ui-fg-subtle">
            Tell us the printing type and garments you have in mind &mdash;
            we&apos;ll come back with advice, pricing, and timelines.
          </p>
          <div className="mx-auto max-w-xl scroll-mt-24 rounded-2xl border border-ui-border-base bg-white p-6 shadow-sm small:p-8">
            <ByoInquiryForm id="byo-inquiry" />
          </div>
          <p className="mt-10 text-center text-sm text-ui-fg-subtle">
            Prefer the full catalogue?{" "}
            <LocalizedClientLink
              href="/store"
              className="font-semibold text-[var(--brand-secondary)] hover:underline"
            >
              Browse the store
            </LocalizedClientLink>{" "}
            or{" "}
            <LocalizedClientLink
              href="/contact"
              className="font-semibold text-[var(--brand-secondary)] hover:underline"
            >
              use the main contact form
            </LocalizedClientLink>
            .
          </p>
        </div>
      </section>
    </>
  )
}
