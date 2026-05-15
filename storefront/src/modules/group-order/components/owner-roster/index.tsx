"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import {
  convertGroupOrderToCart,
  setGroupOrderStatus,
  type ConvertResult,
  type GroupOrder,
} from "@lib/data/group-order"

type Props = {
  orders: GroupOrder[]
}

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  closed: "Closed",
  converted: "Sent to checkout",
  expired: "Expired",
}

const STATUS_TONE: Record<string, string> = {
  open: "bg-emerald-50 text-emerald-800",
  closed: "bg-amber-50 text-amber-800",
  converted: "bg-blue-50 text-blue-800",
  expired: "bg-gray-100 text-gray-700",
}

const OwnerRoster = ({ orders }: Props) => {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [convertReport, setConvertReport] = useState<{
    id: string
    result: ConvertResult
  } | null>(null)

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ui-border-base p-10 text-center">
        <h2 className="text-lg font-semibold mb-2">No group orders yet</h2>
        <p className="text-sm text-ui-fg-subtle">
          Group orders let you collect team sizes via a shareable link. Ask us
          to spin one up for you next time you organise a team kit run.
        </p>
      </div>
    )
  }

  const handleStatus = (id: string, status: "open" | "closed" | "converted") => {
    setBusy(id)
    startTransition(async () => {
      const res = await setGroupOrderStatus(id, status)
      setBusy(null)
      if (!res.ok) {
        alert(res.error)
        return
      }
      router.refresh()
    })
  }

  const shareUrl = (token: string) => {
    if (typeof window === "undefined") return ""
    const segments = window.location.pathname.split("/").filter(Boolean)
    const countryCode = segments[0] || ""
    return `${window.location.origin}/${countryCode}/group-order/${token}`
  }

  const copy = async (token: string) => {
    const url = shareUrl(token)
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      alert("Link copied to clipboard")
    } catch {
      // ignored — older browsers
    }
  }

  const handleConvert = (id: string) => {
    if (
      !confirm(
        "Convert this group order to a cart? This builds line items from each participant's size + quantity and takes you to checkout. Participants whose size doesn't match the garment will be skipped (you'll see the list)."
      )
    ) {
      return
    }
    setBusy(id)
    startTransition(async () => {
      const res = await convertGroupOrderToCart(id)
      setBusy(null)
      if (!res.ok) {
        alert(res.error)
        return
      }
      setConvertReport({ id, result: res.result })
    })
  }

  return (
    <>
      {convertReport ? (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="text-base font-semibold text-emerald-900">
            Cart built — {convertReport.result.lines_added} line
            {convertReport.result.lines_added === 1 ? "" : "s"} added
          </h3>
          {convertReport.result.skipped.length > 0 ? (
            <div className="mt-3">
              <p className="text-sm text-emerald-800">
                {convertReport.result.skipped.length} participant
                {convertReport.result.skipped.length === 1 ? " was" : "s were"} skipped
                because their size didn&apos;t match the base garment&apos;s variants:
              </p>
              <ul className="mt-2 list-disc pl-5 text-xs text-emerald-900 space-y-0.5">
                {convertReport.result.skipped.map((s) => (
                  <li key={s.participant_id}>
                    {s.name} — size {s.size_label}
                    {s.reason ? ` (${s.reason})` : ""}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-emerald-800">
                You can add them manually in the cart, or update their size and
                run convert again.
              </p>
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="inline-flex items-center justify-center rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white"
            >
              Open the cart
            </button>
            <button
              type="button"
              onClick={() => setConvertReport(null)}
              className="inline-flex items-center justify-center rounded-md border border-ui-border-base bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-primary)]"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
      <ul className="flex flex-col gap-y-4">
        {orders.map((o) => (
        <li
          key={o.id}
          className="rounded-xl border border-ui-border-base bg-white p-5"
        >
          <div className="flex items-start justify-between gap-x-3">
            <div className="flex flex-col">
              <span
                className={`inline-flex items-center self-start rounded-full px-2 py-0.5 text-xs font-semibold ${
                  STATUS_TONE[o.status] ?? STATUS_TONE.open
                }`}
              >
                {STATUS_LABELS[o.status] ?? o.status}
              </span>
              <h2 className="mt-2 text-base font-semibold text-[var(--brand-primary)]">
                {o.title}
              </h2>
              {o.organisation_name ? (
                <p className="text-sm text-ui-fg-subtle">{o.organisation_name}</p>
              ) : null}
              {o.deadline_at ? (
                <p className="mt-1 text-xs text-ui-fg-muted">
                  Closes {new Date(o.deadline_at).toLocaleDateString("en-AU")}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-x-2">
              <button
                type="button"
                onClick={() => copy(o.public_token)}
                className="inline-flex items-center justify-center rounded-md border border-ui-border-base bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-primary)] hover:bg-ui-bg-subtle"
              >
                Copy share link
              </button>
              {o.status === "open" ? (
                <button
                  type="button"
                  onClick={() => handleStatus(o.id, "closed")}
                  disabled={busy === o.id}
                  className="inline-flex items-center justify-center rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-60"
                >
                  Close
                </button>
              ) : o.status === "closed" ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleStatus(o.id, "open")}
                    disabled={busy === o.id}
                    className="inline-flex items-center justify-center rounded-md border border-ui-border-base bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-primary)] hover:bg-ui-bg-subtle disabled:opacity-60"
                  >
                    Re-open
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConvert(o.id)}
                    disabled={busy === o.id}
                    className="inline-flex items-center justify-center rounded-md bg-[var(--brand-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-60"
                  >
                    {busy === o.id ? "Building cart…" : "Convert to cart"}
                  </button>
                </>
              ) : null}
            </div>
          </div>
          <a
            href={`/group-order/${o.public_token}`}
            className="mt-3 inline-block text-xs text-[var(--brand-secondary)] hover:underline"
          >
            View public page →
          </a>
        </li>
        ))}
      </ul>
    </>
  )
}

export default OwnerRoster
