"use client"

import React, { useState } from "react"
import type {
  EmbroideryConfig,
  GarmentSide,
} from "@modules/customizer/lib/types"

const SIDE_LABEL: Record<GarmentSide, string> = {
  front: "Front",
  back: "Back",
  left_sleeve: "Left sleeve",
  right_sleeve: "Right sleeve",
  printed_tag: "Inner tag",
}

const DIGITIZING_FEE_DEFAULT = 60 // AUD — surfaced in cart; backend re-prices.

type Props = {
  side: GarmentSide
  value: EmbroideryConfig | undefined
  onChange: (side: GarmentSide, next: EmbroideryConfig) => void
  /**
   * Optional image data URL of the artwork placed on the canvas for this
   * side. When supplied the "Estimate stitches with AI" button uses it as
   * the source for the vision API call (no separate upload step needed).
   */
  artworkDataUrl?: string | null
  artworkMediaType?: string | null
}

/**
 * Per-side embroidery configuration. Drives the embroidery cost for one
 * decorated side: customer enters real-world mm dimensions of the
 * embroidered logo, optionally runs an AI stitch estimate against the
 * placed artwork, and the resulting EmbroideryConfig flows into cart
 * metadata + pricing.
 *
 * Used inside Step 3 of the customizer wizard when the side's decoration
 * method is "embroidery".
 */
const EmbroiderySideConfig: React.FC<Props> = ({
  side,
  value,
  onChange,
  artworkDataUrl,
  artworkMediaType,
}) => {
  const [widthMm, setWidthMm] = useState<number>(value?.widthMm ?? 80)
  const [heightMm, setHeightMm] = useState<number>(value?.heightMm ?? 80)
  const [stitchCount, setStitchCount] = useState<number>(value?.stitchCount ?? 4000)
  const [includeDigitizing, setIncludeDigitizing] = useState<boolean>(
    value?.includeDigitizingFee ?? true
  )
  const [estimating, setEstimating] = useState(false)
  const [estimateError, setEstimateError] = useState<string | null>(null)
  const [aiNotes, setAiNotes] = useState<string | null>(value?.aiNotes ?? null)

  const commit = (
    overrides: Partial<EmbroideryConfig> = {}
  ) => {
    const config: EmbroideryConfig = {
      side,
      widthMm,
      heightMm,
      stitchCount,
      digitizingFee: includeDigitizing ? DIGITIZING_FEE_DEFAULT : 0,
      includeDigitizingFee: includeDigitizing,
      ...(aiNotes ? { aiNotes } : {}),
      ...overrides,
    }
    onChange(side, config)
  }

  const handleEstimate = async () => {
    if (!artworkDataUrl) {
      setEstimateError(
        "Place artwork on the canvas first — then we can analyse it for an AI stitch estimate."
      )
      return
    }
    if (widthMm <= 0 || heightMm <= 0) {
      setEstimateError("Enter the embroidered size in mm before estimating.")
      return
    }
    setEstimating(true)
    setEstimateError(null)
    try {
      const response = await fetch("/api/embroidery/estimate-stitches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: artworkDataUrl,
          mediaType: artworkMediaType ?? "image/png",
          widthMm,
          heightMm,
        }),
      })
      const body = (await response.json().catch(() => ({}))) as {
        stitchesMin?: number
        stitchesMax?: number
        complexity?: "low" | "medium" | "high"
        notes?: string
        message?: string
      }
      if (!response.ok) {
        setEstimateError(body.message ?? "Stitch analysis failed. Enter the count manually.")
        return
      }
      const midpoint = Math.round(
        ((body.stitchesMin ?? 0) + (body.stitchesMax ?? 0)) / 2
      )
      const nextCount = midpoint > 0 ? midpoint : stitchCount
      const notes = body.notes ?? `${body.stitchesMin}–${body.stitchesMax} stitches (${body.complexity})`
      setStitchCount(nextCount)
      setAiNotes(notes)
      commit({ stitchCount: nextCount, aiNotes: notes })
    } catch (err) {
      setEstimateError(
        err instanceof Error ? err.message : "Stitch analysis failed."
      )
    } finally {
      setEstimating(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle/40 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ui-fg-base">
          Embroidery — {SIDE_LABEL[side]}
        </span>
        <span className="text-[11px] text-ui-fg-subtle">
          Stitched thread on garment
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-ui-fg-subtle">Width (mm)</span>
          <input
            type="number"
            min={1}
            max={300}
            value={widthMm}
            onChange={(e) => {
              const v = Math.max(1, Number(e.target.value) || 0)
              setWidthMm(v)
              commit({ widthMm: v })
            }}
            className="rounded-md border border-ui-border-base px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-ui-fg-subtle">Height (mm)</span>
          <input
            type="number"
            min={1}
            max={300}
            value={heightMm}
            onChange={(e) => {
              const v = Math.max(1, Number(e.target.value) || 0)
              setHeightMm(v)
              commit({ heightMm: v })
            }}
            className="rounded-md border border-ui-border-base px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleEstimate}
        disabled={estimating}
        className="rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm font-medium text-ui-fg-base hover:bg-ui-bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
      >
        {estimating ? "Analysing artwork…" : "Estimate stitches with AI"}
      </button>

      {estimateError ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs text-rose-900">
          {estimateError}
        </p>
      ) : null}

      {aiNotes ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs text-emerald-900">
          AI estimate: {aiNotes}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-ui-fg-subtle">Stitch count</span>
        <input
          type="number"
          min={100}
          step={100}
          value={stitchCount}
          onChange={(e) => {
            const v = Math.max(0, Number(e.target.value) || 0)
            setStitchCount(v)
            commit({ stitchCount: v })
          }}
          className="rounded-md border border-ui-border-base px-2 py-1.5 text-sm"
        />
      </label>

      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={includeDigitizing}
          onChange={(e) => {
            setIncludeDigitizing(e.target.checked)
            commit({
              includeDigitizingFee: e.target.checked,
              digitizingFee: e.target.checked ? DIGITIZING_FEE_DEFAULT : 0,
            })
          }}
        />
        <span>
          Include digitizing fee
          <span className="text-ui-fg-subtle"> (${DIGITIZING_FEE_DEFAULT.toFixed(2)})</span>
        </span>
      </label>

      <p className="text-[11px] text-ui-fg-muted">
        Embroidery cost is calculated from stitch count + quantity. Final price
        confirmed at checkout — our digitising team reviews every order.
      </p>
    </div>
  )
}

export default EmbroiderySideConfig
