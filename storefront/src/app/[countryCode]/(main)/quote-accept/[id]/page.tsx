import { Metadata } from "next"

import AcceptForm from "@modules/quote-accept/components/accept-form"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getQuoteForAccept } from "@lib/data/quote-accept"

export const metadata: Metadata = {
  title: "Accept your quote",
  description: "Review and accept your SC PRINTS quote.",
  robots: { index: false, follow: false },
}

type RouteParams = { countryCode: string; id: string }
type SearchParams = { sig?: string }

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

function ErrorState({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <div className="content-container py-14 small:py-20">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
          {eyebrow}
        </p>
        <h1 className="page-title-marketing mt-3 tracking-tight">{title}</h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-ui-fg-subtle">
          {body}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <LocalizedClientLink
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Contact support
            <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default async function QuoteAcceptPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>
  searchParams: Promise<SearchParams>
}) {
  const { id } = await params
  const { sig } = await searchParams

  if (!sig) {
    return (
      <ErrorState
        eyebrow="Quote"
        title="Link expired"
        body="We couldn't verify that link. Reply to your quote email and we'll resend it."
      />
    )
  }

  const quote = await getQuoteForAccept(id, sig)

  if (!quote) {
    return (
      <ErrorState
        eyebrow="Quote"
        title="Quote not found"
        body="This quote may have been withdrawn or expired. Reply to your quote email and we'll fix you up."
      />
    )
  }

  return (
    <div className="content-container py-12 max-w-3xl">
      <AcceptForm id={id} sig={sig} quote={quote} />
    </div>
  )
}
