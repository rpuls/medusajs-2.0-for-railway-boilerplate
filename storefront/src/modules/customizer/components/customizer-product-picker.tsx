"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export type CustomizerPickerProduct = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
}

type Props = {
  products: CustomizerPickerProduct[]
  /** The handle currently shown in the customizer; highlighted in the picker. */
  currentHandle: string | null
  /**
   * Returns true when the canvas has unsaved design work that switching would
   * discard. Wires to the customizer's Fabric state so we can warn before nav.
   */
  hasUnsavedDesign?: () => boolean
}

const CustomizerProductPicker = ({ products, currentHandle, hasUnsavedDesign }: Props) => {
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => {
      return (
        p.title.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q)
      )
    })
  }, [products, query])

  if (products.length === 0) {
    return null
  }

  const handlePick = (handle: string) => {
    if (handle === currentHandle) {
      setOpen(false)
      return
    }
    if (
      hasUnsavedDesign?.() &&
      !window.confirm(
        "Switching products will discard your current design. Continue?"
      )
    ) {
      return
    }
    setOpen(false)
    router.push(`/${countryCode}/customizer?handle=${encodeURIComponent(handle)}`)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-ui-border-base bg-ui-bg-base px-2.5 py-1.5 text-xs font-medium text-ui-fg-base hover:bg-ui-bg-subtle"
        data-testid="customizer-change-product"
      >
        Change product
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-12 sm:py-20"
          role="dialog"
          aria-modal="true"
          aria-labelledby="customizer-product-picker-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-ui-border-base px-6 py-4">
              <div>
                <h2
                  id="customizer-product-picker-title"
                  className="text-lg font-semibold text-ui-fg-base"
                >
                  Choose a product to customize
                </h2>
                <p className="mt-1 text-sm text-ui-fg-subtle">
                  Pick the garment or item you want to print on. Your current canvas
                  state is per-product — switching will start a fresh design.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base"
              >
                ×
              </button>
            </div>

            <div className="border-b border-ui-border-base px-6 py-3">
              <input
                type="search"
                placeholder="Search products by name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-ui-fg-subtle">
                  No products match &quot;{query}&quot;.
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {filtered.map((p) => {
                    const isCurrent = p.handle === currentHandle
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => handlePick(p.handle)}
                          disabled={isCurrent}
                          className={[
                            "group flex w-full flex-col overflow-hidden rounded-xl border bg-white text-left transition",
                            isCurrent
                              ? "cursor-default border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/30"
                              : "border-ui-border-base hover:border-[var(--brand-primary)] hover:shadow-sm",
                          ].join(" ")}
                        >
                          <div className="aspect-square w-full bg-ui-bg-subtle">
                            {p.thumbnail ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.thumbnail}
                                alt={p.title}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-ui-fg-subtle">
                                No preview
                              </div>
                            )}
                          </div>
                          <div className="px-3 py-2">
                            <p className="line-clamp-2 text-xs font-medium text-ui-fg-base">
                              {p.title}
                            </p>
                            {isCurrent ? (
                              <p className="mt-0.5 text-[11px] font-semibold text-[var(--brand-primary)]">
                                Currently selected
                              </p>
                            ) : null}
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-ui-border-base bg-ui-bg-subtle/40 px-6 py-3">
              <p className="text-xs text-ui-fg-subtle">
                {filtered.length} of {products.length} products
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-1.5 text-xs font-medium text-ui-fg-base hover:bg-ui-bg-subtle"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CustomizerProductPicker
