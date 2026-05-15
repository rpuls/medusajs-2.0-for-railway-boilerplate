"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { createGroupOrder } from "@lib/data/group-order"

type Props = {
  countryCode: string
  design: {
    id: string
    name: string
    thumbnail_url: string | null
    base_product_id: string | null
    base_variant_id: string | null
    customizer_metadata: Record<string, unknown>
  }
  defaultEmail: string
  defaultName: string
}

const CreateFromDesignForm = ({
  countryCode,
  design,
  defaultEmail,
  defaultName,
}: Props) => {
  const router = useRouter()
  const [title, setTitle] = useState(design.name)
  const [organisation, setOrganisation] = useState("")
  const [email, setEmail] = useState(defaultEmail)
  const [name, setName] = useState(defaultName)
  const [deadline, setDeadline] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  const submit = () => {
    if (!email.trim() || !title.trim()) {
      setError("Title and your contact email are required.")
      return
    }
    if (!design.base_product_id) {
      setError(
        "This design has no base product saved. Open it in the customizer, save again, then try."
      )
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await createGroupOrder({
        title: title.trim(),
        organisation_name: organisation.trim() || undefined,
        owner_email: email.trim(),
        owner_name: name.trim() || undefined,
        base_product_id: design.base_product_id ?? undefined,
        base_variant_id: design.base_variant_id ?? undefined,
        base_design_id: design.id,
        customizer_metadata: design.customizer_metadata,
        deadline_at: deadline ? new Date(deadline).toISOString() : undefined,
        notes: notes.trim() || undefined,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/${countryCode}/group-order/${res.group_order.public_token}`
          : null
      setShareUrl(url)
    })
  }

  if (shareUrl) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-lg font-semibold text-emerald-900">
          Your group order is live
        </h2>
        <p className="mt-2 text-sm text-emerald-800">
          Share this link with your team — the public page shows the design,
          who&apos;s already submitted, and a form for new participants.
        </p>
        <div className="mt-4 rounded-md border border-emerald-200 bg-white p-3 flex items-center gap-x-2">
          <code className="text-xs text-[var(--brand-primary)] flex-1 break-all">
            {shareUrl}
          </code>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="inline-flex items-center justify-center rounded-md bg-[var(--brand-primary)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            Copy
          </button>
        </div>
        <div className="mt-4 flex gap-x-3">
          <button
            type="button"
            onClick={() => router.push(`/${countryCode}/account/group-orders`)}
            className="inline-flex items-center justify-center rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            Manage group orders
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-ui-border-base bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-primary)]"
          >
            Preview public page
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
      {/* Design preview */}
      <aside className="rounded-xl border border-ui-border-base bg-white p-4">
        {design.thumbnail_url ? (
          <img
            src={design.thumbnail_url}
            alt={design.name}
            className="block w-full rounded-md"
          />
        ) : (
          <div className="aspect-square w-full rounded-md bg-ui-bg-subtle" />
        )}
        <p className="mt-3 text-sm font-semibold text-[var(--brand-primary)]">
          {design.name}
        </p>
        {!design.base_product_id ? (
          <p className="mt-2 text-xs text-rose-700">
            Heads-up — this design has no base product. Re-save it from the
            customizer before creating a group order.
          </p>
        ) : null}
      </aside>

      {/* Form */}
      <div className="rounded-xl border border-ui-border-base bg-white p-5">
        <div className="grid grid-cols-1 gap-y-3">
          <label className="text-sm">
            <span className="font-semibold text-[var(--brand-primary)]">
              Group order title *
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-ui-border-base bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)]"
              placeholder="e.g. Marrickville Lions 2026 hoodies"
            />
          </label>

          <label className="text-sm">
            <span className="font-semibold text-[var(--brand-primary)]">
              Organisation
            </span>
            <input
              value={organisation}
              onChange={(e) => setOrganisation(e.target.value)}
              className="mt-1 block w-full rounded-md border border-ui-border-base bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)]"
              placeholder="School / club / business name (optional)"
            />
          </label>

          <div className="grid grid-cols-1 small:grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="font-semibold text-[var(--brand-primary)]">
                Your name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-ui-border-base bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)]"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--brand-primary)]">
                Your email *
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-ui-border-base bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)]"
              />
            </label>
          </div>

          <label className="text-sm">
            <span className="font-semibold text-[var(--brand-primary)]">
              Deadline (optional)
            </span>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 block w-full rounded-md border border-ui-border-base bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)]"
            />
          </label>

          <label className="text-sm">
            <span className="font-semibold text-[var(--brand-primary)]">
              Notes (optional, shown to participants)
            </span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full rounded-md border border-ui-border-base bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)]"
              placeholder="e.g. Tall fits available on request"
            />
          </label>

          {error ? (
            <p className="text-sm text-rose-700">{error}</p>
          ) : null}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="inline-flex items-center justify-center rounded-md bg-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
            >
              {pending ? "Creating…" : "Create group order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateFromDesignForm
