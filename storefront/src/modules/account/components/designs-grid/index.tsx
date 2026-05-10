"use client"

import { useState, useTransition } from "react"
import { useRouter, useParams } from "next/navigation"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { deleteMyDesign, renameMyDesign, type SavedDesign } from "@lib/data/designs"
import { phCapture } from "@lib/posthog"

type Props = {
  designs: SavedDesign[]
}

const formatDate = (iso: string): string => {
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return ""
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

const DesignsGrid = ({ designs }: Props) => {
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }

  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState("")
  const [, startTransition] = useTransition()

  if (!designs.length) {
    return (
      <div className="rounded-xl border border-dashed border-ui-border-base p-10 text-center">
        <h2 className="text-lg font-semibold mb-2">No saved designs yet</h2>
        <p className="text-sm text-ui-fg-subtle mb-6">
          Save your work in the customizer and it&apos;ll appear here so you can re-edit
          or re-order anytime.
        </p>
        <LocalizedClientLink
          href="/customizer"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--brand-primary)] text-white px-5 py-2.5 text-sm font-medium hover:opacity-90"
        >
          Open the customizer
        </LocalizedClientLink>
      </div>
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this saved design? This can&apos;t be undone.")) return
    setError(null)
    setBusyId(id)
    const res = await deleteMyDesign(id)
    setBusyId(null)
    if (!res.ok) {
      setError(res.error)
      return
    }
    phCapture("design_deleted", { design_id: id })
    startTransition(() => router.refresh())
  }

  const handleStartRename = (design: SavedDesign) => {
    setRenamingId(design.id)
    setRenameDraft(design.name)
  }

  const handleSubmitRename = async (id: string) => {
    const name = renameDraft.trim()
    if (!name) {
      setRenamingId(null)
      return
    }
    setError(null)
    setBusyId(id)
    const res = await renameMyDesign(id, name)
    setBusyId(null)
    setRenamingId(null)
    if (!res.ok) {
      setError(res.error)
      return
    }
    phCapture("design_renamed", { design_id: id })
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col gap-y-4">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
        {designs.map((design) => {
          const isBusy = busyId === design.id
          const isRenaming = renamingId === design.id
          const editHref = `/customizer?design=${encodeURIComponent(design.id)}`
          return (
            <li
              key={design.id}
              className="rounded-xl border border-ui-border-base bg-white overflow-hidden flex flex-col"
              data-testid="design-card"
            >
              <div className="aspect-square bg-ui-bg-subtle flex items-center justify-center">
                {design.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={design.thumbnail_url}
                    alt={design.name}
                    className="object-contain max-h-full max-w-full"
                  />
                ) : (
                  <span className="text-sm text-ui-fg-subtle">No preview</span>
                )}
              </div>
              <div className="p-4 flex flex-col gap-y-2 flex-1">
                {isRenaming ? (
                  <input
                    autoFocus
                    value={renameDraft}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    onBlur={() => handleSubmitRename(design.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleSubmitRename(design.id)
                      }
                      if (e.key === "Escape") {
                        setRenamingId(null)
                      }
                    }}
                    className="text-sm font-semibold border border-ui-border-base rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                    maxLength={120}
                    disabled={isBusy}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartRename(design)}
                    className="text-left text-sm font-semibold text-ui-fg-base hover:underline"
                    title="Rename design"
                  >
                    {design.name}
                  </button>
                )}
                <p className="text-xs text-ui-fg-subtle">
                  Updated {formatDate(design.updated_at)}
                </p>
                <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                  <LocalizedClientLink
                    href={editHref}
                    className="inline-flex items-center justify-center rounded-md bg-[var(--brand-primary)] text-white px-3 py-1.5 text-xs font-medium hover:opacity-90"
                  >
                    Edit / re-order
                  </LocalizedClientLink>
                  <button
                    type="button"
                    onClick={() => handleDelete(design.id)}
                    disabled={isBusy}
                    className="text-xs text-ui-fg-subtle hover:text-red-600 disabled:opacity-60"
                  >
                    {isBusy ? "Working…" : "Delete"}
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="text-xs text-ui-fg-subtle pt-2">
        Tip: click a design name to rename it.
      </p>
      {/* countryCode is reserved for future per-region edit URLs; reference once to silence lint. */}
      <span hidden>{countryCode}</span>
    </div>
  )
}

export default DesignsGrid
