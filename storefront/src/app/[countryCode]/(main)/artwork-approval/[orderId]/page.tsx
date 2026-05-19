import { Metadata } from "next"

import ApprovalForm from "@modules/artwork-approval/components/approval-form"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getArtworkApproval } from "@lib/data/artwork-approval"

export const metadata: Metadata = {
  title: "Approve your artwork",
  description: "Review and approve your SC PRINTS artwork proof.",
  robots: { index: false, follow: false },
}

type RouteParams = { countryCode: string; orderId: string }
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

export default async function ArtworkApprovalPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>
  searchParams: Promise<SearchParams>
}) {
  const { orderId } = await params
  const { sig } = await searchParams

  const invalid =
    !sig ||
    typeof sig !== "string" ||
    sig.length < 16

  const state = invalid
    ? null
    : await getArtworkApproval(orderId, sig as string)

  if (!state) {
    return (
      <div className="content-container py-14 small:py-20">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
            Artwork approval
          </p>
          <h1 className="page-title-marketing mt-3 tracking-tight">
            Approval link expired
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-ui-fg-subtle">
            We couldn&apos;t verify that link. If you wanted to approve an
            order, reply to the email we sent and we&apos;ll resend the link.
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

  return (
    <div className="content-container py-12 max-w-3xl">
      <ApprovalForm
        orderId={orderId}
        sig={sig as string}
        initial={state}
      />
    </div>
  )
}
