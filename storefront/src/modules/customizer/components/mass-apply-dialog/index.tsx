"use client"

import { useEffect, useMemo, useState } from "react"

import { sdk } from "@lib/config"
import { createMyDesign } from "@lib/data/designs"
import type { CustomizerMetadata } from "@modules/customizer/lib/types"

type Product = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
}

type Props = {
  open: boolean
  onClose: () => void
  sourceProductId: string | null
  sourceVariantId: string | null
  countryCode: string
  /** The CustomizerMetadata for the current canvas state — same
   *  shape that the existing save-design flow passes to
   *  `createMyDesign`. */
  buildCustomizerMetadata: () => CustomizerMetadata | null
  /** Default name for the new saved design. */
  defaultName: string
}

const MAX_PICK = 5

/**
 * Mass-apply: save the current design once, then open the customizer
 * for each selected target product in a new tab with that design
 * pre-loaded (via `?design=<id>`). The customer reviews each one
 * individually and adds-to-cart as normal.
 *
 * Intentionally NOT auto-adding cart lines:
 *   - Each product's SCP print pricing is per-design + per-quantity,
 *     so bulk auto-add risks underpricing.
 *   - Existing cart items are never touched. Existing saved designs
 *     are never touched.
 *   - The customer gets a chance to confirm size/print area per
 *     product before paying.
 */
const MassApplyDialog = ({
  open,
  onClose,
  sourceProductId,
  sourceVariantId,
  countryCode,
  buildCustomizerMetadata,
  defaultName,
}: Props) => {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!open) {
      setSelected(new Set())
      setError(null)
      setSearch("")
      setResults([])
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setSearching(true)
    const run = async () => {
      try {
        const res = (await sdk.store.product.list({
          q: search || undefined,
          limit: 24,
          fields: "id,handle,title,thumbnail",
        } as any)) as { products?: Product[] }
        if (cancelled) return
        const filtered = (res.products ?? []).filter(
          (p) => p.id !== sourceProductId
        )
        setResults(filtered)
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setSearching(false)
      }
    }
    const handle = window.setTimeout(run, 250)
    return () => {
      cancelled = true
      window.clearTimeout(handle)
    }
  }, [open, search, sourceProductId])

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < MAX_PICK) {
        next.add(id)
      }
      return next
    })

  const selectedProducts = useMemo(
    () => results.filter((p) => selected.has(p.id)),
    [results, selected]
  )

  const confirm = async () => {
    if (!sourceProductId || !sourceVariantId) {
      setError("Pick the base product first.")
      return
    }
    if (selected.size === 0) {
      setError("Select at least one product to apply this design to.")
      return
    }
    setError(null)
    setPending(true)
    try {
      const metadata = buildCustomizerMetadata()
      if (!metadata) {
        setError("Add at least one design element before applying.")
        return
      }
      const saved = await createMyDesign({
        name: defaultName,
        base_product_id: sourceProductId,
        base_variant_id: sourceVariantId,
        customizer_metadata: metadata,
      })
      if (!saved.ok) {
        setError(saved.error)
        return
      }
      const designId = saved.design.id
      for (const product of selectedProducts) {
        const url = `/${countryCode}/customizer?product=${encodeURIComponent(product.handle)}&design=${encodeURIComponent(designId)}`
        window.open(url, "_blank", "noopener,noreferrer")
      }
      onClose()
    } catch (err: any) {
      setError(err?.message ?? "Couldn't apply to selected products.")
    } finally {
      setPending(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[rgba(26,26,46,0.1)] bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-ui-fg-muted hover:text-ui-fg-base"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold tracking-tight text-[var(--brand-primary)]">
          Apply this design to other products
        </h2>
        <p className="mt-2 text-sm text-ui-fg-subtle">
          We&apos;ll save your current design to your library, then open each
          selected product in a new tab with the design pre-loaded.
        </p>

        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <strong>Heads up:</strong> Your existing cart items and saved designs
          aren&apos;t modified. Each new tab is its own customizer session — set
          sizes and print options separately, then add to cart from each tab.
        </div>

        <div className="mt-5">
          <label className="text-xs font-semibold text-ui-fg-base">
            Find products
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="mt-1 block w-full rounded-md border border-ui-border-base bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)]"
          />
        </div>

        <div className="mt-3 max-h-80 overflow-y-auto rounded-md border border-ui-border-base">
          {searching && results.length === 0 ? (
            <p className="p-4 text-sm text-ui-fg-muted">Searching…</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-sm text-ui-fg-muted">No products found.</p>
          ) : (
            <ul className="divide-y divide-ui-border-base">
              {results.map((p) => {
                const isSelected = selected.has(p.id)
                const reachedMax = !isSelected && selected.size >= MAX_PICK
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      disabled={reachedMax}
                      onClick={() => toggle(p.id)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${
                        isSelected
                          ? "bg-[var(--brand-primary)]/8"
                          : "hover:bg-ui-bg-subtle"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-ui-bg-subtle" />
                      )}
                      <span className="flex-1 truncate">{p.title}</span>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded border ${
                          isSelected
                            ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                            : "border-ui-border-base"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <p className="mt-2 text-xs text-ui-fg-muted">
          {selected.size}/{MAX_PICK} selected
        </p>

        {error ? (
          <p className="mt-2 text-sm text-rose-700">{error}</p>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 small:flex-row small:items-center small:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-md border border-ui-border-base bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-primary)] hover:bg-ui-bg-subtle"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={pending || selected.size === 0}
            className="inline-flex items-center justify-center rounded-md bg-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
          >
            {pending
              ? "Preparing…"
              : `Apply to ${selected.size} product${selected.size === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MassApplyDialog
