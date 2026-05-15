import { Metadata } from "next"

import AcceptForm from "@modules/quote-accept/components/accept-form"
import { getQuoteForAccept } from "@lib/data/quote-accept"

export const metadata: Metadata = {
  title: "Accept your quote",
  description: "Review and accept your SC PRINTS quote.",
  robots: { index: false, follow: false },
}

type RouteParams = { countryCode: string; id: string }
type SearchParams = { sig?: string }

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
      <div className="content-container py-12 max-w-2xl">
        <div className="rounded-2xl border border-[rgba(26,26,46,0.1)] bg-white/95 p-6 shadow-[0_4px_40px_rgba(26,26,46,0.08)]">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--brand-primary)]">
            Link expired
          </h1>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            We couldn&apos;t verify that link. Reply to your quote email and
            we&apos;ll resend it.
          </p>
        </div>
      </div>
    )
  }

  const quote = await getQuoteForAccept(id, sig)

  if (!quote) {
    return (
      <div className="content-container py-12 max-w-2xl">
        <div className="rounded-2xl border border-[rgba(26,26,46,0.1)] bg-white/95 p-6 shadow-[0_4px_40px_rgba(26,26,46,0.08)]">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--brand-primary)]">
            Quote not found
          </h1>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            This quote may have been withdrawn or expired. Reply to your quote
            email and we&apos;ll fix you up.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="content-container py-12 max-w-3xl">
      <AcceptForm id={id} sig={sig} quote={quote} />
    </div>
  )
}
