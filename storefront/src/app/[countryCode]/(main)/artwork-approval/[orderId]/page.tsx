import { Metadata } from "next"

import ApprovalForm from "@modules/artwork-approval/components/approval-form"
import { getArtworkApproval } from "@lib/data/artwork-approval"

export const metadata: Metadata = {
  title: "Approve your artwork",
  description: "Review and approve your SC PRINTS artwork proof.",
  robots: { index: false, follow: false },
}

type RouteParams = { countryCode: string; orderId: string }
type SearchParams = { sig?: string }

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

  return (
    <div className="content-container py-12 max-w-3xl">
      {!state ? (
        <div className="rounded-2xl border border-[rgba(26,26,46,0.1)] bg-white/95 p-6 shadow-[0_4px_40px_rgba(26,26,46,0.08)]">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--brand-primary)]">
            Approval link expired
          </h1>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            We couldn&apos;t verify that link. If you wanted to approve an
            order, reply to the email we sent and we&apos;ll resend the link.
          </p>
        </div>
      ) : (
        <ApprovalForm
          orderId={orderId}
          sig={sig as string}
          initial={state}
        />
      )}
    </div>
  )
}
