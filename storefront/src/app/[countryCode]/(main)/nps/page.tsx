import { Metadata } from "next"

import NpsThanks from "@modules/feedback/components/nps-thanks"

export const metadata: Metadata = {
  title: "Thanks for your feedback",
  description:
    "Your rating was recorded — leave us an optional comment so we can act on it.",
  robots: { index: false, follow: false },
}

type SearchParams = {
  order?: string
  score?: string
  sig?: string
}

export default async function NpsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { order, score, sig } = await searchParams
  const numericScore = Number.parseInt(score ?? "", 10)
  const isValid =
    typeof order === "string" &&
    order.length > 0 &&
    Number.isFinite(numericScore) &&
    numericScore >= 1 &&
    numericScore <= 5 &&
    typeof sig === "string" &&
    sig.length === 16

  return (
    <div className="content-container py-12 max-w-2xl">
      {isValid ? (
        <NpsThanks order={order!} score={numericScore} sig={sig!} />
      ) : (
        <div className="rounded-2xl border border-[rgba(26,26,46,0.1)] bg-white/95 p-6 shadow-[0_4px_40px_rgba(26,26,46,0.08)]">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--brand-primary)]">
            Link expired
          </h1>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            We couldn&apos;t verify that link. If you wanted to share feedback,
            reply directly to any SC Prints email and we&apos;ll pick it up.
          </p>
        </div>
      )}
    </div>
  )
}
