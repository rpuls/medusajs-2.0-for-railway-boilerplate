"use client"

import { useEffect, useRef, useState } from "react"
import * as fabric from "fabric"

import type { GarmentSide } from "@modules/customizer/lib/types"

const SIDE_LABEL: Record<GarmentSide, string> = {
  front: "Front",
  back: "Back",
  left_sleeve: "Left Sleeve",
  right_sleeve: "Right Sleeve",
  printed_tag: "Printed Tag",
}

type DesignPreviewPopoverProps = {
  /** Sides currently decorated, in display order. */
  decoratedSides: GarmentSide[]
  /** Live canvas dimensions; mockups composite at this aspect ratio. */
  canvasSize: { width: number; height: number }
  /** Layouts per side (Fabric JSON object arrays). */
  sideLayouts: Record<GarmentSide, Record<string, unknown>[]>
  /** Resolves the garment photo URL for a given side (variant-specific). */
  getGarmentUrlForSide: (side: GarmentSide) => string | null
  /**
   * Bumps any time canvas state changes; used as the cache key together with
   * the side so that re-opening the popover with no changes is instant.
   */
  layoutVersion: number
  /** Selected variant id — invalidates cache when colour/variant changes. */
  variantId: string
}

/**
 * Renders only the design objects onto a transparent canvas and returns a
 * PNG data URL. The garment is rendered separately as a native <img> (no
 * crossOrigin needed — many supplier CDNs lack CORS headers), overlaid via CSS.
 */
const composeDesignLayer = async (
  sideObjects: Record<string, unknown>[],
  canvasDims: { width: number; height: number }
): Promise<string | null> => {
  const w = Math.max(64, Math.round(canvasDims.width || 600))
  const h = Math.max(64, Math.round(canvasDims.height || 750))
  const sc = new (fabric as any).StaticCanvas(null, { width: w, height: h })

  try {
    if (sideObjects && sideObjects.length > 0) {
      // Fabric v7 returns a Promise; v5/v6 used a callback. Support both so we
      // don't deadlock on "Rendering…" if the runtime API differs.
      const result = (fabric as any).util.enlivenObjects(sideObjects)
      const enlivened: any[] = await (result && typeof result.then === "function"
        ? result
        : new Promise<any[]>((resolve) => {
            ;(fabric as any).util.enlivenObjects(
              sideObjects,
              (objs: any[]) => resolve(objs ?? []),
              ""
            )
          }))
      for (const o of enlivened ?? []) {
        sc.add(o)
      }
    }
    sc.renderAll()
    const dataUrl = sc.toDataURL({
      format: "png",
      multiplier: 1,
      quality: 0.92,
    })
    return dataUrl
  } finally {
    try {
      sc.dispose()
    } catch {
      void 0
    }
  }
}

export default function DesignPreviewPopover({
  decoratedSides,
  canvasSize,
  sideLayouts,
  getGarmentUrlForSide,
  layoutVersion,
  variantId,
}: DesignPreviewPopoverProps) {
  const [open, setOpen] = useState(false)
  const [thumbs, setThumbs] = useState<Record<string, { designDataUrl: string; garmentUrl: string | null }>>({})
  const [busy, setBusy] = useState(false)
  const cacheRef = useRef<Map<string, string>>(new Map())
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  // Invalidate cache when variant changes (different garment colour/photo).
  useEffect(() => {
    cacheRef.current.clear()
    setThumbs({})
  }, [variantId])

  // Click outside / Esc to close.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (
        popoverRef.current &&
        !popoverRef.current.contains(t) &&
        triggerRef.current &&
        !triggerRef.current.contains(t)
      ) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  // When opening (or sides change), generate any missing design-layer thumbnails.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      setBusy(true)
      const next: Record<string, { designDataUrl: string; garmentUrl: string | null }> = {}
      const results = await Promise.all(
        decoratedSides.map(async (side) => {
          const cacheKey = `${side}:${layoutVersion}`
          const cached = cacheRef.current.get(cacheKey)
          const garmentUrl = getGarmentUrlForSide(side)
          if (cached) {
            return [side, { designDataUrl: cached, garmentUrl }] as const
          }
          const dataUrl = await composeDesignLayer(sideLayouts[side] ?? [], canvasSize)
          if (dataUrl) {
            cacheRef.current.set(cacheKey, dataUrl)
          }
          return [side, { designDataUrl: dataUrl ?? "", garmentUrl }] as const
        })
      )
      if (cancelled) return
      for (const [side, entry] of results) {
        if (entry.designDataUrl) next[side] = entry
      }
      setThumbs(next)
      setBusy(false)
    })()
    return () => {
      cancelled = true
    }
  }, [open, decoratedSides, layoutVersion, sideLayouts, canvasSize, getGarmentUrlForSide])

  const hasArtwork = decoratedSides.length > 0

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={!hasArtwork}
        className="inline-flex items-center gap-1.5 rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1.5 text-xs font-semibold text-ui-fg-base shadow-sm transition-colors hover:border-ui-fg-base disabled:cursor-not-allowed disabled:opacity-50"
        aria-haspopup="dialog"
        aria-expanded={open}
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
        {hasArtwork ? (
          <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ui-bg-base-pressed px-1 text-[10px] font-bold">
            {decoratedSides.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Design preview"
          className="absolute right-0 z-30 mt-2 w-[min(28rem,90vw)] rounded-xl border border-ui-border-base bg-ui-bg-base p-3 shadow-xl"
        >
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-ui-fg-base">Your design</p>
            <p className="text-[11px] text-ui-fg-subtle">
              {decoratedSides.length} location
              {decoratedSides.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 small:grid-cols-3">
            {decoratedSides.map((side) => {
              const thumb = thumbs[side]
              const isTag = side === "printed_tag"
              const tagStyle = isTag
                ? { transform: "scale(3.2)", transformOrigin: "50% 14%" as const }
                : undefined
              return (
                <div
                  key={side}
                  className="overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-subtle"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    {thumb ? (
                      <>
                        {/* Garment layer: native <img> so any CDN URL loads without CORS headers */}
                        {thumb.garmentUrl ? (
                          <img
                            src={thumb.garmentUrl}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 h-full w-full object-cover"
                            draggable={false}
                            style={tagStyle}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-ui-bg-subtle" aria-hidden />
                        )}
                        {/* Design layer: transparent PNG from canvas export */}
                        <img
                          src={thumb.designDataUrl}
                          alt={`${SIDE_LABEL[side]} preview`}
                          className="absolute inset-0 h-full w-full object-cover"
                          draggable={false}
                          style={tagStyle}
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[11px] text-ui-fg-subtle">
                        {busy ? "Rendering…" : "Preview unavailable"}
                      </div>
                    )}
                  </div>
                  <p className="px-2 py-1 text-[11px] font-medium text-ui-fg-base">
                    {SIDE_LABEL[side]}
                  </p>
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-[11px] text-ui-fg-subtle">
            Approximate preview — final placement is confirmed on the production proof we send
            before printing.
          </p>
        </div>
      ) : null}
    </div>
  )
}
