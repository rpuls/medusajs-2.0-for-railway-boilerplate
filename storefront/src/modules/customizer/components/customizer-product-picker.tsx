"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useParams, useRouter } from "next/navigation"

import { searchCustomizerProducts } from "@lib/data/customizer-product-search"

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

const SEARCH_DEBOUNCE_MS = 280

const CustomizerProductPicker = ({ products, currentHandle, hasUnsavedDesign }: Props) => {
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [serverResults, setServerResults] = useState<CustomizerPickerProduct[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Bumps on every search invocation so out-of-order responses (slow network +
  // fast typing) can't overwrite the freshest results.
  const searchTokenRef = useRef(0)

  // Modal renders through a portal into <body> so it escapes any ancestor that
  // creates a containing block for `position: fixed` (notably framer-motion's
  // `motion.div layout` used in PdpLayoutGrid). Without this, the modal was
  // being trapped inside the wizard column and the wizard's sticky panel
  // bled through on top.
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // Lock background scroll while the modal is open so the body underneath
  // doesn't move when the customer interacts with the picker.
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  // Server-side search effect. Initial-prop products only cover ~60 items, so
  // local filtering missed anything beyond that (e.g. searching "5001"
  // returned zero hits even though Staple Tee | 5001 exists). Hitting the
  // store API with `q=` here covers the FULL catalogue.
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      // Empty query → fall back to the prop products (instant, no fetch).
      setServerResults(null)
      setIsSearching(false)
      return
    }
    const token = ++searchTokenRef.current
    setIsSearching(true)
    const t = window.setTimeout(async () => {
      try {
        const results = await searchCustomizerProducts(trimmed, countryCode)
        if (token !== searchTokenRef.current) return // stale
        setServerResults(results)
      } catch {
        if (token !== searchTokenRef.current) return
        setServerResults([])
      } finally {
        if (token === searchTokenRef.current) setIsSearching(false)
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(t)
  }, [query, countryCode])

  // Reset search when modal closes, so reopening always starts fresh.
  useEffect(() => {
    if (!open) {
      setQuery("")
      setServerResults(null)
      setIsSearching(false)
      searchTokenRef.current++
    }
  }, [open])

  const visibleProducts = useMemo<CustomizerPickerProduct[]>(() => {
    if (query.trim() && serverResults !== null) return serverResults
    return products
  }, [query, products, serverResults])

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

  const trimmedQuery = query.trim()
  const showingSearchResults = trimmedQuery.length > 0 && serverResults !== null
  const counterText = isSearching
    ? "Searching catalogue…"
    : showingSearchResults
    ? `${visibleProducts.length} ${visibleProducts.length === 1 ? "match" : "matches"} for "${trimmedQuery}"`
    : `${visibleProducts.length} products`

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

      {open && mounted && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 px-4 py-12 sm:py-20"
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
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search products by name or code (e.g. 5001)…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  autoFocus
                />
                {isSearching ? (
                  <span
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-wide text-ui-fg-subtle"
                    aria-live="polite"
                  >
                    Searching
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {visibleProducts.length === 0 ? (
                <p className="py-12 text-center text-sm text-ui-fg-subtle">
                  {isSearching
                    ? "Searching the catalogue…"
                    : `No products match "${trimmedQuery}".`}
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {visibleProducts.map((p) => {
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
              <p className="text-xs text-ui-fg-subtle" aria-live="polite">
                {counterText}
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
        </div>,
        document.body
      )}
    </>
  )
}

export default CustomizerProductPicker
