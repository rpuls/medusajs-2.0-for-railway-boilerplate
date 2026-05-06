"use client"

import { RenderPlacement } from "@modules/customizer/lib/types"
import { RefObject } from "react"

type CanvasStageProps = {
  garmentImage: string | null
  garmentTitle: string | null
  /** When true, no product photo behind the print area (avoids duplicating the PDP gallery). */
  omitBackgroundImage?: boolean
  /** Included in the image key so front/back swaps remount even if URLs match. */
  printSideKey?: string
  printArea: RenderPlacement
  showPrintAreaGuides?: boolean
  outOfBoundsWarning: string | null
  dpiWarning: string | null
  /** Empty mount node; parent creates the canvas imperatively so Fabric can wrap the canvas without breaking React’s sibling tree. */
  fabricContainerRef: RefObject<HTMLDivElement | null>
  /** Hex colour sampled from the variant photo, used to tint the sleeve placeholder line drawing. */
  tintColor?: string | null
}

export default function CanvasStage({
  garmentImage,
  garmentTitle,
  omitBackgroundImage = false,
  printSideKey = "front",
  printArea,
  showPrintAreaGuides = false,
  outOfBoundsWarning,
  dpiWarning,
  fabricContainerRef,
  tintColor,
}: CanvasStageProps) {
  const showPhoto = !omitBackgroundImage && garmentImage
  // Sleeve placeholders are line drawings on white. When we have a sampled
  // variant colour, paint the body by laying the colour behind the image and
  // multiplying — dark line work stays dark, white body picks up the colour.
  const isSleeveView = printSideKey === "left_sleeve" || printSideKey === "right_sleeve"
  const applySleeveTint = isSleeveView && Boolean(tintColor)
  // Tag prints sit at the inner-back of the collar. We don't have separate tag
  // photography per colour, so zoom into the neck area of the variant's
  // primary photo. transform-origin is the focal point (top-centre of the tee).
  const isTagView = printSideKey === "printed_tag"
  // Right-sleeve view shares the left-sleeve placeholder, mirrored.
  const isRightSleeveView = printSideKey === "right_sleeve"
  const transform = isTagView
    ? "scale(3.2)"
    : isRightSleeveView
    ? "scaleX(-1)"
    : undefined
  const tagZoomStyle = transform
    ? {
        transform,
        transformOrigin: isTagView ? "50% 14%" : "center",
      }
    : undefined

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-ui-border-base bg-ui-bg-subtle">
      {showPhoto ? (
        <>
          {applySleeveTint ? (
            // The colour backdrop is masked by the same sleeve SVG so it only
            // fills the sleeve silhouette, not the whole canvas. Combined with
            // the multiply blend on the <img> above, white sleeve body picks up
            // the colour while the dark line work stays dark.
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: tintColor ?? "transparent",
                WebkitMaskImage: `url(${garmentImage})`,
                maskImage: `url(${garmentImage})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "cover",
                maskSize: "cover",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                transform: isRightSleeveView ? "scaleX(-1)" : undefined,
              }}
              aria-hidden
            />
          ) : null}
          {/* Native <img>: garment URLs come from variant metadata / many CDNs and may not match
              next/image remotePatterns; using next/image here caused render errors caught by PDP boundary. */}
          <img
            key={`${printSideKey}-${garmentImage}`}
            src={garmentImage!}
            alt={garmentTitle ?? "Garment"}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out"
            draggable={false}
            style={
              applySleeveTint
                ? { ...(tagZoomStyle ?? {}), mixBlendMode: "multiply" }
                : tagZoomStyle
            }
          />
        </>
      ) : omitBackgroundImage ? (
        <div
          className="absolute inset-0 bg-ui-bg-subtle bg-[linear-gradient(45deg,transparent_46%,rgb(0_0_0/0.06)_49%,rgb(0_0_0/0.06)_51%,transparent_55%)] bg-[length:12px_12px]"
          aria-hidden
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-sm text-ui-fg-subtle">
          No garment image available. You can still design and export artwork.
        </div>
      )}

      {showPrintAreaGuides ? (
        <div
          className="pointer-events-none absolute border-2 border-dashed border-sky-500"
          style={{
            left: printArea.x,
            top: printArea.y,
            width: printArea.width,
            height: printArea.height,
          }}
          aria-hidden
        />
      ) : null}

      <div
        ref={fabricContainerRef}
        className="absolute inset-0 h-full w-full touch-none"
        aria-hidden
      />

      {(outOfBoundsWarning || dpiWarning) && (
        <div className="absolute bottom-3 left-3 right-3 space-y-1 rounded-md bg-ui-bg-base/90 p-2 text-xs shadow">
          {outOfBoundsWarning && <p className="text-rose-600">{outOfBoundsWarning}</p>}
          {dpiWarning && <p className="text-amber-700">{dpiWarning}</p>}
        </div>
      )}
    </div>
  )
}
