"use client"

import { useEffect } from "react"

import {
  DPI_CRITICAL_THRESHOLD,
  DPI_OK_THRESHOLD,
} from "@modules/customizer/lib/dpi"

type Props = {
  open: boolean
  worstDpi: number | null
  imagesBelowCritical: number
  /** Display price for the vectorization service (formatted, e.g. "$15"). Optional. */
  vectorizationDisplayPrice?: string | null
  onClose: () => void
  onUploadHigherQuality: () => void
  onAcceptVectorization: () => void
}

const formatDpi = (dpi: number | null): string => {
  if (dpi === null || !Number.isFinite(dpi)) return "—"
  return `${Math.max(1, Math.round(dpi))} DPI`
}

const LowResolutionModal = ({
  open,
  worstDpi,
  imagesBelowCritical,
  vectorizationDisplayPrice,
  onClose,
  onUploadHigherQuality,
  onAcceptVectorization,
}: Props) => {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const headline =
    imagesBelowCritical > 1
      ? `${imagesBelowCritical} of your images are too small to print cleanly`
      : "This image is too small to print cleanly"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="low-res-title"
      onClick={onClose}
      data-testid="low-resolution-modal"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 text-ui-fg-subtle hover:text-ui-fg-base"
        >
          ×
        </button>

        <h2 id="low-res-title" className="text-lg font-semibold text-ui-fg-base mb-3">
          {headline}
        </h2>

        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 mb-4">
          <p className="text-sm text-amber-900">
            Effective resolution at the current print size:{" "}
            <strong>{formatDpi(worstDpi)}</strong>
          </p>
          <p className="text-xs text-amber-800 mt-1">
            We recommend at least {DPI_OK_THRESHOLD} DPI; anything under{" "}
            {DPI_CRITICAL_THRESHOLD} usually prints visibly pixelated.
          </p>
        </div>

        <div className="text-sm text-ui-fg-subtle space-y-2 mb-5">
          <p>
            Screens display at around 72 DPI, but commercial printers need closer
            to 300 DPI for crisp results. The same image looks fine on screen but
            fuzzy on a t-shirt or poster.
          </p>
          <p>You have two options:</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              onUploadHigherQuality()
              onClose()
            }}
            className="w-full rounded-lg border border-ui-border-base bg-white px-4 py-3 text-sm font-medium text-ui-fg-base hover:bg-ui-bg-subtle"
          >
            Upload a higher quality file
            <span className="block text-xs font-normal text-ui-fg-subtle mt-0.5">
              Free — best result if you have one
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAcceptVectorization()
              onClose()
            }}
            className="w-full rounded-lg bg-[var(--brand-primary)] px-4 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            Add vectorization to my order
            <span className="block text-xs font-normal text-white/85 mt-0.5">
              {vectorizationDisplayPrice
                ? `${vectorizationDisplayPrice} — our team redraws your artwork sharp for print`
                : "Our team redraws your artwork sharp for print"}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-xs text-ui-fg-subtle hover:text-ui-fg-base mt-1"
          >
            I&apos;ll decide later
          </button>
        </div>
      </div>
    </div>
  )
}

export default LowResolutionModal
