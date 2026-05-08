"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import type { LineItemMockupArtifact } from "@modules/customizer/lib/metadata"

type LineItemDesignPreviewProps = {
  /** Mockups to display, one per decorated side. */
  mockups: LineItemMockupArtifact[]
  /** Optional alt-style line label shown in the modal header (e.g. "Staple Tee | 5001"). */
  itemLabel?: string
  /** Optional className for the trigger button — lets the caller align it inline. */
  className?: string
}

/**
 * Read-only "Preview design" button for cart and order line items. Mirrors
 * the customizer's preview affordance but uses the persisted mockup URLs
 * (server-rendered at add-to-cart time) instead of recomputing via Fabric —
 * the order page has neither the canvas nor the artwork in scope.
 *
 * Opens a centred modal with one large mockup at a time and arrow controls
 * to step through decorated sides. Closes on Esc, backdrop click, or the X.
 */
export default function LineItemDesignPreview({
  mockups,
  itemLabel,
  className,
}: LineItemDesignPreviewProps) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        return
      }
      if (mockups.length <= 1) return
      if (event.key === "ArrowRight") {
        setIndex((i) => (i + 1) % mockups.length)
      } else if (event.key === "ArrowLeft") {
        setIndex((i) => (i - 1 + mockups.length) % mockups.length)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, mockups.length])

  if (mockups.length === 0) return null

  const current = mockups[Math.min(index, mockups.length - 1)]
  const canStep = mockups.length > 1

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIndex(0)
          setOpen(true)
        }}
        className={`inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/60 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-50 ${
          className ?? ""
        }`}
        aria-haspopup="dialog"
      >
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Preview design
        <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-100 px-1 text-[10px] font-bold text-rose-700">
          {mockups.length}
        </span>
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 p-4"
              role="dialog"
              aria-modal
              aria-label="Design preview"
              onClick={(e) => {
                if (e.target === e.currentTarget) setOpen(false)
              }}
            >
              <div className="relative w-[min(40rem,95vw)] max-h-[90vh] overflow-hidden rounded-xl bg-ui-bg-base shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-ui-border-base px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ui-fg-base">
                      {itemLabel ?? "Your design"}
                    </p>
                    <p className="text-[11px] text-ui-fg-subtle">
                      {current.label}
                      {canStep ? (
                        <>
                          {" · "}
                          {index + 1} of {mockups.length}
                        </>
                      ) : null}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close preview"
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="relative flex items-center justify-center bg-ui-bg-subtle/40">
                  {/* Plain <img> — these mockup URLs come from MinIO/S3 and
                      aren't always in `next.config.images.remotePatterns`,
                      and we don't need Next's image optimisation here since
                      the modal is a one-time view. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current.mockupUrl}
                    alt={`${itemLabel ?? "Design"} — ${current.label}`}
                    className="max-h-[70vh] w-full object-contain"
                    draggable={false}
                  />
                  {canStep ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setIndex((i) => (i - 1 + mockups.length) % mockups.length)
                        }
                        aria-label="Previous side"
                        className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-ui-bg-base/90 text-ui-fg-base shadow-md ring-1 ring-ui-border-base hover:bg-ui-bg-base"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => setIndex((i) => (i + 1) % mockups.length)}
                        aria-label="Next side"
                        className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-ui-bg-base/90 text-ui-fg-base shadow-md ring-1 ring-ui-border-base hover:bg-ui-bg-base"
                      >
                        ›
                      </button>
                    </>
                  ) : null}
                </div>

                {canStep ? (
                  <div className="flex flex-wrap gap-1.5 border-t border-ui-border-base px-4 py-2">
                    {mockups.map((m, i) => (
                      <button
                        key={`${m.side}-${i}`}
                        type="button"
                        onClick={() => setIndex(i)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          i === index
                            ? "bg-ui-fg-base text-ui-bg-base"
                            : "bg-ui-bg-subtle text-ui-fg-subtle hover:bg-ui-bg-base-pressed"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
