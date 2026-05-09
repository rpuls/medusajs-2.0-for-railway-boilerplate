"use client"

import React, { useEffect, useMemo, useState } from "react"
import { calculatePrice, PRICE_LEVELS, RETAIL_CONFIG } from "../lib/pricing"
import { calculateLetteringStitches, FONTS } from "../lib/lettering"
import { COPY } from "../lib/copy"
import type {
  ArchMode,
  ArtworkConfig,
  Breakdown,
  EmbroideryDesign,
  LetteringConfig,
  PricingConfig,
} from "../lib/types"
import LetteringCanvas from "./lettering-canvas"
// PriceTable still lives in ./price-table for admin / reference surfaces;
// the customer-facing panel below no longer renders it inline.

type Tab = "lettering" | "artwork"

type Props = {
  quantity: number
  /** Provide a custom price level array (e.g. when level is set server-side from the customer). */
  priceLevels?: PricingConfig[]
  initialDesign?: EmbroideryDesign | null
  onDesignChange?: (design: EmbroideryDesign | null) => void
  /**
   * Number of embroidery passes per garment (1 = front-only or back-only,
   * 2 = both sides). Multiplies the per-garment decoration cost in the
   * displayed breakdown. Defaults to 1.
   */
  placementCount?: number
}

const DEFAULT_LETTERING: LetteringConfig = {
  text: "",
  font: "block",
  heightMm: 25,
  archMode: "straight",
}

const StitchEstimator: React.FC<Props> = ({
  quantity,
  priceLevels = PRICE_LEVELS,
  initialDesign = null,
  onDesignChange,
  placementCount = 1,
}) => {
  // Default to the Artwork tab — most embroidery customers arrive with
  // a logo file rather than a typeset wordmark. Lettering is the niche
  // case (one-off names / monograms). Re-hydration of a saved design
  // still respects whatever tab the customer last used.
  const [tab, setTab] = useState<Tab>(initialDesign?.type === "lettering" ? "lettering" : "artwork")
  const [config, setConfig] = useState<PricingConfig>(
    initialDesign?.pricing.level ?? priceLevels[0] ?? RETAIL_CONFIG
  )
  const [includeDigitizing, setIncludeDigitizing] = useState(true)
  const [consolidated, setConsolidated] = useState(false)

  const [lettering, setLettering] = useState<LetteringConfig>(
    initialDesign?.lettering ?? DEFAULT_LETTERING
  )
  const [artwork, setArtwork] = useState<ArtworkConfig>(
    initialDesign?.artwork ?? { manualStitchCount: 8000 }
  )

  const stitchCount = useMemo(() => {
    if (tab === "lettering") return calculateLetteringStitches(lettering)
    return Math.max(0, Math.round(artwork.manualStitchCount ?? 0))
  }, [tab, lettering, artwork])

  const breakdown: Breakdown = useMemo(
    () =>
      calculatePrice({
        config,
        stitchCount,
        quantity,
        consolidatedQuantity: consolidated,
        includeDigitizing,
        placementCount,
      }),
    [config, stitchCount, quantity, consolidated, includeDigitizing, placementCount]
  )

  useEffect(() => {
    if (!onDesignChange) return
    if (stitchCount <= 0) {
      onDesignChange(null)
      return
    }
    const design: EmbroideryDesign = {
      type: tab,
      stitchCount,
      lettering: tab === "lettering" ? lettering : undefined,
      artwork: tab === "artwork" ? artwork : undefined,
      pricing: breakdown,
    }
    onDesignChange(design)
  }, [tab, stitchCount, lettering, artwork, breakdown, onDesignChange])

  // Tier-highlighting helpers used to feed the inline PriceTable; the
  // table is no longer rendered, so the computations are gone too. If a
  // future surface wants to re-add the table, recreate them inline at
  // that call site rather than leaving dead state here.

  return (
    <div className="flex flex-col gap-y-6 rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ui-fg-base">Embroidery estimator</h3>
          <p className="text-sm text-ui-fg-subtle">
            Build your design or supply artwork — we'll estimate the stitch count and price.
          </p>
        </div>
        {priceLevels.length > 1 && (
          <select
            value={config.id}
            onChange={(e) => {
              const next = priceLevels.find((lvl) => lvl.id === e.target.value)
              if (next) {
                setConfig(next)
                setIncludeDigitizing(next.digitizingFee > 0)
              }
            }}
            className="rounded-md border border-ui-border-base bg-ui-bg-base px-2 py-1 text-sm"
          >
            {priceLevels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex border-b border-ui-border-base text-sm">
        {(["lettering", "artwork"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 ${
              tab === t
                ? "border-[var(--brand-primary,#002a5c)] text-ui-fg-base"
                : "border-transparent text-ui-fg-subtle hover:text-ui-fg-base"
            }`}
          >
            {t === "lettering" ? "Lettering" : "Artwork"}
          </button>
        ))}
      </div>

      {tab === "lettering" ? (
        <div className="flex flex-col gap-4">
          <LetteringCanvas
            text={lettering.text}
            font={lettering.font}
            archMode={lettering.archMode}
            heightMm={lettering.heightMm}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ui-fg-subtle">Text</span>
              <input
                type="text"
                value={lettering.text}
                onChange={(e) => setLettering({ ...lettering, text: e.target.value })}
                maxLength={40}
                className="rounded-md border border-ui-border-base px-3 py-2"
                placeholder="Your text"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ui-fg-subtle">Font</span>
              <select
                value={lettering.font}
                onChange={(e) => setLettering({ ...lettering, font: e.target.value })}
                className="rounded-md border border-ui-border-base px-3 py-2"
                title={COPY.fontPreview}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ui-fg-subtle">
                Letter height: {lettering.heightMm}mm
              </span>
              <input
                type="range"
                min={8}
                max={50}
                value={lettering.heightMm}
                onChange={(e) =>
                  setLettering({ ...lettering, heightMm: Number(e.target.value) })
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ui-fg-subtle">Layout</span>
              <select
                value={lettering.archMode}
                onChange={(e) =>
                  setLettering({ ...lettering, archMode: e.target.value as ArchMode })
                }
                className="rounded-md border border-ui-border-base px-3 py-2"
              >
                <option value="straight">Straight</option>
                <option value="arch_up">Arch up</option>
                <option value="arch_down">Arch down</option>
              </select>
            </label>
          </div>

          <p className="text-xs text-ui-fg-muted">{COPY.fontPreview}</p>
        </div>
      ) : (
        <ArtworkEstimateBlock artwork={artwork} setArtwork={setArtwork} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeDigitizing}
            onChange={(e) => setIncludeDigitizing(e.target.checked)}
            disabled={config.digitizingFee === 0}
          />
          <span>
            Include digitizing fee
            {config.digitizingFee > 0 && (
              <span className="text-ui-fg-subtle"> (${config.digitizingFee.toFixed(2)})</span>
            )}
          </span>
        </label>
        <label className="flex items-center gap-2 text-sm" title={COPY.consolidatedHelp}>
          <input
            type="checkbox"
            checked={consolidated}
            onChange={(e) => setConsolidated(e.target.checked)}
          />
          <span>Consolidate quantity across placements</span>
        </label>
      </div>

      {breakdown.belowMinimum && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {COPY.belowMinimum(config.minimumQuantity)}
        </div>
      )}

      {breakdown.requiresQuote ? (
        <div className="rounded-md border border-amber-400 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Price on application</p>
          <p className="mt-1">
            Designs over 12,000 stitches need a manual quote — they sit outside
            our published rate card. Send us the artwork and we'll come back
            with a price within one business day.
          </p>
          <a
            href={`mailto:info@scprints.com.au?subject=${encodeURIComponent(
              `Embroidery quote (${stitchCount.toLocaleString()} stitches × ${quantity})`
            )}&body=${encodeURIComponent(
              `Hi SC Prints,\n\nI'd like a quote for an embroidery design that's larger than the auto-priced range.\n\nDesign type: ${tab}\nEstimated stitches: ${stitchCount.toLocaleString()}\nQuantity: ${quantity}\n\n(Please attach the artwork to this email.)\n\nThanks!`
            )}`}
            className="mt-3 inline-block rounded-md bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-950"
          >
            Email us for a quote →
          </a>
        </div>
      ) : null}

      <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle p-4">
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <Stat label="Stitches" value={stitchCount.toLocaleString()} />
          <Stat label="Quantity tier" value={breakdown.appliedTier.label} />
          <Stat
            label="Per garment"
            value={breakdown.requiresQuote ? "POA" : `$${breakdown.unitDecorationPrice.toFixed(2)}`}
          />
          <Stat
            label="Total"
            value={breakdown.requiresQuote ? "POA" : `$${breakdown.total.toFixed(2)}`}
            bold
          />
        </div>
      </div>

      {/*
        Full SCP rate-card table was here as a `<details>` disclosure. It's
        not useful on the embroidery PDP — customers want the price for
        their design, not a 50-cell density × quantity matrix. The "Per
        garment" / "Total" stats above already say what the customer pays
        once an estimate has been received. The table is still exported
        from PriceTable.tsx for any internal / admin surface that wants it.
      */}

      <p className="text-xs text-ui-fg-muted">{COPY.finalEstimate}</p>
    </div>
  )
}

const Stat: React.FC<{ label: string; value: string; bold?: boolean }> = ({
  label,
  value,
  bold,
}) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-ui-fg-muted">{label}</div>
    <div className={`mt-0.5 ${bold ? "text-base font-semibold" : "text-sm"} text-ui-fg-base`}>
      {value}
    </div>
  </div>
)

/**
 * Artwork tab. Customer uploads an image + sets the embroidered size in mm,
 * then either gets an AI stitch estimate (Claude vision) or types the count
 * manually. The AI estimate populates `manualStitchCount` so downstream
 * pricing reads from a single field — the `aiEstimate` payload is kept
 * alongside for transparency (range + complexity + notes).
 */
const ArtworkEstimateBlock: React.FC<{
  artwork: ArtworkConfig
  setArtwork: (next: ArtworkConfig) => void
}> = ({ artwork, setArtwork }) => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [imageMediaType, setImageMediaType] = useState<string | null>(null)
  const [imageFileName, setImageFileName] = useState<string | null>(null)
  const [widthMm, setWidthMm] = useState<number>(80)
  const [heightMm, setHeightMm] = useState<number>(80)
  const [estimating, setEstimating] = useState(false)
  const [estimateError, setEstimateError] = useState<string | null>(null)

  /**
   * Rasterise an SVG data URL to a PNG data URL. Anthropic's vision API
   * only accepts raster formats (jpeg/png/gif/webp), so SVG uploads must
   * be converted before they're sent. Renders at 2× the requested mm
   * size in pixels (capped) so Claude has enough resolution to see fine
   * detail like text and outlines.
   */
  const rasterizeSvgToPng = (svgDataUrl: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const naturalW = img.naturalWidth || 800
        const naturalH = img.naturalHeight || 800
        // Cap output at 1600px on the longest edge — keeps the request
        // body well under Anthropic's 5 MB limit while preserving detail.
        const longest = Math.max(naturalW, naturalH)
        const scale = longest > 1600 ? 1600 / longest : 1
        const targetW = Math.max(1, Math.round(naturalW * scale))
        const targetH = Math.max(1, Math.round(naturalH * scale))
        const canvas = document.createElement("canvas")
        canvas.width = targetW
        canvas.height = targetH
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Canvas 2D context unavailable"))
          return
        }
        // White background so transparent SVGs come through with the
        // intended look — prevents Claude from interpreting transparent
        // pixels as artwork.
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, targetW, targetH)
        ctx.drawImage(img, 0, 0, targetW, targetH)
        try {
          resolve(canvas.toDataURL("image/png"))
        } catch (err) {
          reject(err)
        }
      }
      img.onerror = () => reject(new Error("Could not load SVG for rasterization"))
      img.src = svgDataUrl
    })

  const handleFile = async (file: File) => {
    setEstimateError(null)
    if (file.size > 5 * 1024 * 1024) {
      setEstimateError("Image is over 5 MB. Resize it down before uploading.")
      return
    }
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : null
      if (!dataUrl) return
      // Rasterise SVG to PNG so Claude's vision API accepts it. Other
      // formats pass through untouched.
      let finalDataUrl = dataUrl
      let finalMediaType = file.type || "image/png"
      if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) {
        try {
          finalDataUrl = await rasterizeSvgToPng(dataUrl)
          finalMediaType = "image/png"
        } catch (err) {
          setEstimateError(
            "Couldn't rasterize that SVG for AI analysis — try a PNG/JPG export instead, or enter the count manually."
          )
          return
        }
      }
      setImageDataUrl(finalDataUrl)
      setImageMediaType(finalMediaType)
      setImageFileName(file.name)
      setArtwork({ ...artwork, fileName: file.name, fileSize: file.size })
    }
    reader.onerror = () => setEstimateError("Could not read that file. Try a different image.")
    reader.readAsDataURL(file)
  }

  const handleEstimate = async () => {
    if (!imageDataUrl) {
      setEstimateError("Upload an image first.")
      return
    }
    if (!Number.isFinite(widthMm) || widthMm <= 0 || !Number.isFinite(heightMm) || heightMm <= 0) {
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
          imageBase64: imageDataUrl,
          mediaType: imageMediaType,
          widthMm,
          heightMm,
        }),
      })
      const body = await response.json().catch(() => ({})) as {
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
      const aiEstimate = {
        stitchesMin: body.stitchesMin ?? 0,
        stitchesMax: body.stitchesMax ?? 0,
        complexity: body.complexity ?? "medium",
        notes: body.notes,
      }
      // Default the manual count to the midpoint of the AI range so pricing
      // updates immediately. Customer can still nudge it up/down before
      // adding to cart.
      const midpoint = Math.round(((aiEstimate.stitchesMin + aiEstimate.stitchesMax) / 2) || 0)
      setArtwork({
        ...artwork,
        aiEstimate,
        manualStitchCount: midpoint > 0 ? midpoint : artwork.manualStitchCount,
      })
    } catch (err) {
      setEstimateError(err instanceof Error ? err.message : "Stitch analysis failed.")
    } finally {
      setEstimating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <div className="rounded-md border border-dashed border-ui-border-base p-4 text-sm min-w-0">
        <p className="mb-3 text-ui-fg-subtle">
          Upload your artwork, set the embroidered size, and we'll estimate the
          stitch count with Claude — or skip the upload and type a count below.
        </p>

        {/*
          File input is its own full-width row so a long filename can wrap
          cleanly below it; previous side-by-side layout pushed the
          Width/Height inputs off-screen on narrow columns whenever the
          customer uploaded a file with a verbose name. Width/Height sit
          on a second row in a 2-column grid for stable alignment at any
          width.
        */}
        <label className="flex flex-col gap-1 text-sm min-w-0">
          <span className="text-ui-fg-subtle">Artwork file (PNG/JPG/SVG)</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
            }}
            className="text-xs file:mr-2 file:rounded file:border file:border-ui-border-base file:bg-ui-bg-subtle file:px-2 file:py-1 file:text-xs file:text-ui-fg-base"
          />
          {imageFileName ? (
            <span className="break-all text-[11px] text-ui-fg-muted">
              Loaded: {imageFileName}
            </span>
          ) : null}
        </label>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm min-w-0">
            <span className="text-ui-fg-subtle">Width (mm)</span>
            <input
              type="number"
              min={1}
              step={1}
              value={widthMm}
              onChange={(e) => setWidthMm(Math.max(1, Number(e.target.value) || 0))}
              className="w-full rounded-md border border-ui-border-base px-2 py-1.5"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm min-w-0">
            <span className="text-ui-fg-subtle">Height (mm)</span>
            <input
              type="number"
              min={1}
              step={1}
              value={heightMm}
              onChange={(e) => setHeightMm(Math.max(1, Number(e.target.value) || 0))}
              className="w-full rounded-md border border-ui-border-base px-2 py-1.5"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleEstimate}
          disabled={estimating || !imageDataUrl}
          className="mt-3 inline-flex items-center justify-center rounded-md bg-ui-fg-base px-3 py-1.5 text-sm font-semibold text-ui-bg-base disabled:cursor-not-allowed disabled:opacity-50"
        >
          {estimating ? "Estimating…" : "Estimate stitches with AI"}
        </button>

        {estimateError ? (
          <p className="mt-2 text-xs text-rose-700">{estimateError}</p>
        ) : null}

        {artwork.aiEstimate ? (
          <div className="mt-3 rounded-md bg-ui-bg-subtle/60 p-3 text-xs">
            <p className="font-semibold text-ui-fg-base">
              AI estimate: {artwork.aiEstimate.stitchesMin.toLocaleString()}–
              {artwork.aiEstimate.stitchesMax.toLocaleString()} stitches (
              {artwork.aiEstimate.complexity} complexity)
            </p>
            {artwork.aiEstimate.notes ? (
              <p className="mt-1 text-ui-fg-subtle">{artwork.aiEstimate.notes}</p>
            ) : null}
            <p className="mt-2 text-[11px] text-ui-fg-muted">
              The pricing field below seeded to the midpoint — adjust if you've
              digitised this design before and know the exact count.
            </p>
          </div>
        ) : null}
      </div>

      <label className="flex items-center gap-3 text-sm">
        <span className="w-28 text-ui-fg-base">Stitch count</span>
        <input
          type="number"
          min={0}
          step={500}
          value={artwork.manualStitchCount ?? 0}
          onChange={(e) =>
            setArtwork({ ...artwork, manualStitchCount: Number(e.target.value) })
          }
          className="w-32 rounded-md border border-ui-border-base px-3 py-2"
        />
      </label>

      <p className="text-xs text-ui-fg-muted">{COPY.resolutionNote}</p>
    </div>
  )
}

export default StitchEstimator
