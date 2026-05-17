"use client"

import { useState, useTransition } from "react"

import {
  submitArtworkDecision,
  type ArtworkApprovalState,
} from "@lib/data/artwork-approval"

type Props = {
  orderId: string
  sig: string
  initial: ArtworkApprovalState
}

const ApprovalForm = ({ orderId, sig, initial }: Props) => {
  const [name, setName] = useState(initial.artwork_approver_name ?? "")
  const [comment, setComment] = useState("")
  const [status, setStatus] = useState<string | null>(initial.artwork_stage)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const alreadyApproved = status === "approved"

  const submit = (approved: boolean) => {
    setError(null)
    startTransition(async () => {
      const res = await submitArtworkDecision({
        order: orderId,
        sig,
        approved,
        approver_name: name.trim() || undefined,
        comment: comment.trim() || undefined,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setStatus(res.status)
    })
  }

  return (
    <div className="rounded-2xl border border-[rgba(26,26,46,0.1)] bg-white/95 p-6 shadow-[0_4px_40px_rgba(26,26,46,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-secondary)]">
        Order
        {initial.order_display_id ? ` #${initial.order_display_id}` : ""}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--brand-primary)]">
        {alreadyApproved
          ? "Artwork approved"
          : status === "in_review"
            ? "Changes requested"
            : "Approve your artwork"}
      </h1>

      {initial.mockup_urls && initial.mockup_urls.length > 0 ? (
        <div className="mt-6 space-y-4">
          {initial.mockup_urls.map((img) => (
            <div key={img.side}>
              {img.side_label ? (
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-ui-fg-subtle">
                  {img.side_label}
                </p>
              ) : null}
              <img
                src={img.url}
                alt={img.side_label ?? img.side}
                className="w-full rounded-lg border border-[rgba(26,26,46,0.08)]"
              />
            </div>
          ))}
          <p className="text-xs text-ui-fg-subtle">
            Zoom in on a phone to check colours and placement.
          </p>
        </div>
      ) : initial.latest_photo_url ? (
        <div className="mt-6">
          <img
            src={initial.latest_photo_url}
            alt="Proof preview"
            className="w-full rounded-md border border-[rgba(26,26,46,0.08)]"
          />
          <p className="mt-2 text-xs text-ui-fg-subtle">
            {initial.revised_proof_note
              ? `Studio note: ${initial.revised_proof_note}`
              : "Revised proof from our studio. Zoom in on a phone to check colours and placement."}
          </p>
        </div>
      ) : null}

      {alreadyApproved ? (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">
            Approved
            {initial.artwork_approver_name
              ? ` by ${initial.artwork_approver_name}`
              : ""}
            {initial.artwork_approved_at
              ? ` on ${new Date(initial.artwork_approved_at).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}`
              : ""}
            . We&apos;re cracking on with production.
          </p>
        </div>
      ) : (
        <>
          <hr className="my-6 border-[rgba(26,26,46,0.08)]" />

          <label
            htmlFor="approver"
            className="block text-sm font-semibold text-[var(--brand-primary)]"
          >
            Your name
          </label>
          <input
            id="approver"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="So we can record who signed it off"
            className="mt-1 block w-full rounded-md border border-ui-border-base bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)]"
          />

          <label
            htmlFor="comment"
            className="mt-4 block text-sm font-semibold text-[var(--brand-primary)]"
          >
            Notes (optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={2000}
            className="mt-1 block w-full rounded-md border border-ui-border-base bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)]"
            placeholder="Anything we should know? Colour tweaks, placement notes, etc."
          />

          {error ? (
            <p className="mt-3 text-sm text-rose-700">{error}</p>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 small:flex-row small:items-center small:justify-end">
            <button
              type="button"
              onClick={() => submit(false)}
              disabled={pending}
              className="inline-flex items-center justify-center rounded-md border border-ui-border-base bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-primary)] hover:bg-ui-bg-subtle disabled:opacity-60"
            >
              Request changes
            </button>
            <button
              type="button"
              onClick={() => submit(true)}
              disabled={pending}
              className="inline-flex items-center justify-center rounded-md bg-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
            >
              Approve and send to print
            </button>
          </div>
        </>
      )}

      <p className="mt-6 text-xs text-ui-fg-muted">
        This link is unique to your order. If you didn&apos;t expect this
        email, just ignore it.
      </p>
    </div>
  )
}

export default ApprovalForm
