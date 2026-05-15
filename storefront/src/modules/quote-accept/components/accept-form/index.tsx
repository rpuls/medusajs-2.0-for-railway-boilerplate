"use client"

import { useState, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"

import { acceptQuote, type QuoteForAccept } from "@lib/data/quote-accept"

type Props = {
  id: string
  sig: string
  quote: QuoteForAccept
}

const fmtMoney = (
  amount: number | string | null | undefined,
  currency: string
): string => {
  const n =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number.parseFloat(amount)
        : 0
  if (!Number.isFinite(n) || n === 0) return ""
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(n)
  } catch {
    return `${currency.toUpperCase()} ${n.toFixed(2)}`
  }
}

const AcceptForm = ({ id, sig, quote }: Props) => {
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }
  const [name, setName] = useState(quote.contact_name ?? "")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (quote.already_accepted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Quote {quote.public_id}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-emerald-900">
          Quote already accepted
        </h1>
        <p className="mt-2 text-sm text-emerald-800">
          We&apos;ve got this one moving. If you weren&apos;t expecting that,
          reply to your quote email and we&apos;ll sort it out.
        </p>
      </div>
    )
  }

  const accept = () => {
    setError(null)
    startTransition(async () => {
      const res = await acceptQuote({
        id,
        sig,
        approver_name: name.trim() || undefined,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      // Take them to the cart so they can review + check out.
      router.push(`/${countryCode}/cart`)
    })
  }

  return (
    <div className="rounded-2xl border border-[rgba(26,26,46,0.1)] bg-white/95 p-6 shadow-[0_4px_40px_rgba(26,26,46,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-secondary)]">
        Quote {quote.public_id}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--brand-primary)]">
        {quote.subject ?? "Your SC PRINTS quote"}
      </h1>
      {quote.message ? (
        <p className="mt-4 text-sm text-ui-fg-base whitespace-pre-wrap">
          {quote.message}
        </p>
      ) : null}

      <hr className="my-6 border-[rgba(26,26,46,0.08)]" />

      {quote.line_items.length > 0 ? (
        <ul className="divide-y divide-[rgba(26,26,46,0.06)]">
          {quote.line_items.map((li, idx) => (
            <li key={idx} className="py-3 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--brand-primary)]">
                  {li.title ?? "Item"}
                </p>
                {li.description ? (
                  <p className="text-xs text-ui-fg-subtle">{li.description}</p>
                ) : null}
                {li.quantity ? (
                  <p className="text-xs text-ui-fg-muted mt-0.5">
                    Qty {li.quantity}
                  </p>
                ) : null}
              </div>
              <span className="text-sm text-ui-fg-base whitespace-nowrap">
                {fmtMoney(li.total ?? li.unit_price ?? null, quote.currency_code)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ui-fg-subtle">
          Detailed line items will be confirmed once you accept.
        </p>
      )}

      {quote.total_estimate ? (
        <p className="mt-4 text-right text-base font-semibold text-[var(--brand-primary)]">
          Total estimate {fmtMoney(quote.total_estimate, quote.currency_code)}
        </p>
      ) : null}

      <hr className="my-6 border-[rgba(26,26,46,0.08)]" />

      <label
        htmlFor="approver"
        className="block text-sm font-semibold text-[var(--brand-primary)]"
      >
        Your name (for our records)
      </label>
      <input
        id="approver"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-1 block w-full rounded-md border border-ui-border-base bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)]"
        placeholder="e.g. Alex Smith"
      />

      {error ? (
        <p className="mt-3 text-sm text-rose-700">{error}</p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 small:flex-row small:items-center small:justify-end">
        <button
          type="button"
          onClick={accept}
          disabled={pending}
          className="inline-flex items-center justify-center rounded-md bg-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
        >
          {pending ? "Building your cart…" : "Accept and check out"}
        </button>
      </div>

      <p className="mt-6 text-xs text-ui-fg-muted">
        Accepting builds a cart with the items above. You&apos;ll review one
        more time before paying. Reply to your quote email if anything needs to
        change first.
      </p>
    </div>
  )
}

export default AcceptForm
