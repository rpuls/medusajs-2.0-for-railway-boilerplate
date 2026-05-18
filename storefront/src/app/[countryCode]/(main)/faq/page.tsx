import { Metadata } from "next"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionHeader from "@modules/common/components/section-header"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { countryCode } = await params
  const canonicalPath = `/${countryCode}/faq`
  const description = "Frequently asked questions about ordering, artwork, production, and delivery."

  return {
    title: "FAQ",
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `FAQ | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
    twitter: {
      title: `FAQ | ${SEO.siteName}`,
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

type FaqItem = {
  question: string
  answer: string
}

type FaqSection = {
  id: string
  title: string
  items: FaqItem[]
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "general",
    title: "General",
    items: [
      {
        question: "Do you have a minimum quantity?",
        answer:
          "No — you can order from a single garment. Minimums vary by decoration method: screen printing typically starts at 50 units (because of setup costs), while embroidery, digital transfers, UV DTF, and UV printing can start from 1 unit.",
      },
      {
        question: "What services do you provide?",
        answer:
          "Screen printing, embroidery, digital transfers, UV printing, UV DTF, and 3D print design. We also handle in-house artwork and digital proofs.",
      },
      {
        question: "Can I mix garment sizes in one run?",
        answer:
          "Yes. You can generally mix sizes within the same garment style and design setup.",
      },
      {
        question: "Do you source garments?",
        answer:
          "Yes. We source garments from a range of local and international suppliers, or you can provide your own subject to approval (see our BYO page).",
      },
      {
        question: "What is your typical turnaround?",
        answer:
          "Typical turnaround is around 7-10 business days once artwork approval and payment are completed. Peak periods may take longer.",
      },
    ],
  },
  {
    id: "artwork",
    title: "Artwork",
    items: [
      {
        question: "Do you offer in-house design support?",
        answer:
          "Yes. Our team can assist with artwork preparation, print-ready setup, and design refinements for production.",
      },
      {
        question: "What file formats do you accept?",
        answer:
          "Vector files are preferred (AI, EPS, PDF, SVG). We can also review high-resolution PNG/JPG files if they are supplied at print size (300 dpi or higher).",
      },
      {
        question: "Will I receive a mockup before production?",
        answer:
          "Yes. We provide a digital mockup for approval before your order moves into production.",
      },
      {
        question: "Can changes be made after approval?",
        answer:
          "Changes after final approval are limited and may require re-quoting or timeline changes depending on production stage.",
      },
    ],
  },
  {
    id: "printing",
    title: "Printing",
    items: [
      {
        question: "What print methods do you recommend for large orders?",
        answer:
          "For larger runs, screen printing is usually the most cost-effective and durable option.",
      },
      {
        question: "Can you match specific brand colors?",
        answer:
          "Yes. We can match to supplied Pantone references as closely as possible across applicable print methods.",
      },
      {
        question: "Do you offer specialty print finishes?",
        answer:
          "Yes. Depending on your artwork and garment, we can advise on specialty finishes and effects during quoting.",
      },
      {
        question: "Can I reorder without setup fees?",
        answer:
          "In many cases, yes. Repeat-order setup costs depend on method, timeframe, and whether artwork specifications remain unchanged.",
      },
    ],
  },
  {
    id: "embroidery",
    title: "Embroidery",
    items: [
      {
        question: "How does embroidery pricing work?",
        answer:
          "Embroidery pricing is based on stitch count, placement, and quantity. Larger and denser designs typically cost more.",
      },
      {
        question: "Can small text be embroidered?",
        answer:
          "Very fine text may not stitch cleanly. We will review your artwork and suggest the best size and method for clarity.",
      },
      {
        question: "Do you help with digitising?",
        answer:
          "Yes. We can digitise your logo/artwork as part of embroidery setup so it runs cleanly on garments.",
      },
    ],
  },
  {
    id: "delivery-pickup",
    title: "Delivery & Pick Up",
    items: [
      {
        question: "Is delivery included in pricing?",
        answer:
          "Delivery is quoted separately unless otherwise specified. We confirm shipping options when your order is finalised.",
      },
      {
        question: "Do you offer pickup?",
        answer:
          "Yes. Pickup can be arranged during business hours once your order is completed and ready.",
      },
      {
        question: "Can you do rush orders?",
        answer:
          "Rush options are available depending on capacity and artwork readiness. Contact us with your deadline and we will advise.",
      },
    ],
  },
]

export default async function FaqPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_SECTIONS.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      }))
    ),
    url: buildAbsoluteUrl(`/${countryCode}/faq`),
  }

  return (
    <div className="content-container py-14 small:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
          FAQ
        </p>
        <h1 className="page-title-marketing mt-3 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ui-fg-subtle small:text-lg">
          Still unsure about artwork, minimums, or timelines? Start here. If
          you need help with a specific order, our team is happy to assist.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {FAQ_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="inline-flex rounded-full border border-ui-border-base bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-ui-fg-base transition hover:border-[var(--brand-secondary)]/60 hover:text-[var(--brand-secondary)]"
            >
              {section.title}
            </a>
          ))}
        </div>
      </header>

      <div className="mx-auto mt-12 max-w-3xl space-y-5">
        {FAQ_SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24 rounded-2xl border border-ui-border-base bg-white p-6 small:p-8"
          >
            <SectionHeader
              eyebrow={`Section · ${section.title}`}
              title={section.title}
            />
            <div className="mt-2 space-y-3">
              {section.items.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4 transition hover:border-[var(--brand-secondary)]/35"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-sm font-semibold text-ui-fg-base">
                    <span>{item.question}</span>
                    <span
                      aria-hidden
                      className="shrink-0 text-lg leading-none text-[var(--brand-secondary)] transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-ui-fg-subtle">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <div className="rounded-2xl border border-ui-border-base bg-ui-bg-subtle p-8 text-center small:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Still need help?
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-ui-fg-base small:text-3xl">
            Need a custom quote?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ui-fg-subtle">
            Send through your artwork, quantities, and preferred garment style
            and we&apos;ll help you choose the right production method.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <LocalizedClientLink
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              Contact support
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/services"
              className="inline-flex items-center rounded-lg border border-ui-border-base bg-white px-6 py-3 text-sm font-semibold text-ui-fg-base transition hover:bg-ui-bg-subtle"
            >
              View services
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}
