"use client"

import type { RefObject } from "react"
import { useId } from "react"

/**
 * White-line honeycomb for the dark scroll-expanding card.
 * Three depth layers (back / mid / front) are rendered in separate planes so GSAP can
 * scrub translate / scale / rotateX for a parallax “into the screen” feel.
 */
function flatHexPath(cx: number, cy: number, r: number) {
  const parts: string[] = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2
    const x = cx + r * Math.cos(a)
    const y = cy + r * Math.sin(a)
    parts.push(i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : `L${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return `${parts.join(" ")} Z`
}

const R = 9
const w = Math.sqrt(3) * R
const h = 1.5 * R

const centers: [number, number][] = []
for (let row = 0; row < 7; row++) {
  for (let col = 0; col < 8; col++) {
    const ox = row % 2 ? w / 2 : 0
    const x = 18 + col * w + ox
    const y = 22 + row * h
    if (x < 188 && y < 178) {
      centers.push([x, y])
    }
  }
}

const layerCenters = [
  centers.filter((_, i) => i % 3 === 0),
  centers.filter((_, i) => i % 3 === 1),
  centers.filter((_, i) => i % 3 === 2),
] as const

const layerStyles = [
  { strokeW: 0.32, opacity: 0.22, rMul: 1.08 },
  { strokeW: 0.42, opacity: 0.34, rMul: 0.98 },
  { strokeW: 0.52, opacity: 0.48, rMul: 0.88 },
] as const

export type ScrollExpandingGraphicLayerRefs = {
  back: RefObject<HTMLDivElement | null>
  mid: RefObject<HTMLDivElement | null>
  front: RefObject<HTMLDivElement | null>
}

type Props = {
  layerRefs: ScrollExpandingGraphicLayerRefs
}

function HexLayerSvg({
  cells,
  strokeWidth,
  opacity,
  rMul,
  gradId,
  showGlow,
}: {
  cells: [number, number][]
  strokeWidth: number
  opacity: number
  rMul: number
  gradId: string
  showGlow?: boolean
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {showGlow ? (
        <defs>
          <radialGradient id={gradId} cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.06" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
      ) : null}
      <g stroke="white" strokeWidth={strokeWidth} strokeLinejoin="round" opacity={opacity}>
        {cells.map(([cx, cy], i) => (
          <path key={i} d={flatHexPath(cx, cy, R * rMul)} />
        ))}
      </g>
      {showGlow ? <circle cx="100" cy="92" r="72" fill={`url(#${gradId})`} /> : null}
    </svg>
  )
}

export default function ScrollExpandingGraphic({ layerRefs }: Props) {
  const gid = useId()
  const safe = gid.replace(/[^a-zA-Z0-9_-]/g, "")
  const gradBack = `sg-glow-b-${safe}`
  const gradMid = `sg-glow-m-${safe}`
  const gradFront = `sg-glow-f-${safe}`

  return (
    <div
      className="relative aspect-square w-full max-w-[min(100%,20rem)] small:max-w-md"
      style={{
        perspective: "1100px",
        perspectiveOrigin: "50% 45%",
      }}
      aria-hidden
    >
      <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {/* Back — appears furthest; smallest parallax motion, subtle CCW drift */}
        <div
          ref={layerRefs.back}
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{ transformStyle: "preserve-3d", transformOrigin: "50% 50%" }}
        >
          <HexLayerSvg
            cells={[...layerCenters[0]]}
            strokeWidth={layerStyles[0].strokeW}
            opacity={layerStyles[0].opacity}
            rMul={layerStyles[0].rMul}
            gradId={gradBack}
            showGlow={false}
          />
        </div>
        {/* Mid */}
        <div
          ref={layerRefs.mid}
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{ transformStyle: "preserve-3d", transformOrigin: "50% 50%" }}
        >
          <HexLayerSvg
            cells={[...layerCenters[1]]}
            strokeWidth={layerStyles[1].strokeW}
            opacity={layerStyles[1].opacity}
            rMul={layerStyles[1].rMul}
            gradId={gradMid}
            showGlow={false}
          />
        </div>
        {/* Front — strongest motion & scale */}
        <div
          ref={layerRefs.front}
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{ transformStyle: "preserve-3d", transformOrigin: "50% 50%" }}
        >
          <HexLayerSvg
            cells={[...layerCenters[2]]}
            strokeWidth={layerStyles[2].strokeW}
            opacity={layerStyles[2].opacity}
            rMul={layerStyles[2].rMul}
            gradId={gradFront}
            showGlow
          />
        </div>
      </div>
    </div>
  )
}
