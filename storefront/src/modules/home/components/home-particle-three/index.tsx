"use client"

/**
 * Three.js Points-mesh particle hero.
 *
 * Renders the SC Prints wordmark as a 140k-point cloud and reacts to the
 * cursor with two layered behaviours:
 *
 *   1. CARRY MODEL (in-disk) — particles inside the cursor radius lerp
 *      toward a per-particle target that's `carryStrength × falloff²` of
 *      the way from home to the cursor. The blend rate produces the
 *      comet head: particles bunch around the cursor and lag behind it.
 *
 *   2. CURSOR-HISTORY WAKE — every frame the smooth cursor world position
 *      is appended to a ring buffer `{x, y, t}`. When a particle exits
 *      the disk, with probability `trailingProbability` it enters wake-
 *      playback: it reads the cursor-history buffer at a per-particle
 *      playhead time (offset by stagger, jittered by pace, scaled by
 *      `wakePace`) and renders along the historical path with along-
 *      tangent stretch and perpendicular band offset. This is what
 *      produces the visible comet TAIL — the geometry follows the
 *      cursor's past positions, not just its current location.
 *
 * This mirrors the design used by the Canvas-2D newmix engine in
 * `home-particle-logo-hero/index.tsx`, ported as the minimum-viable
 * subset (no curl noise, no diffusion wobble, no Bezier home-return).
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import {
  sampleWordmarkStipple,
  type StipplePoint,
} from "./sample-wordmark"
import ThreeTunerPanel, {
  loadStoredTuning,
  type ThreeTuning,
} from "./tuner-panel"

const VERTEX_SHADER = /* glsl */ `
  attribute vec3 aColor;
  attribute float aTrail;
  uniform float uPointSize;
  uniform float uPixelRatio;
  uniform float uDebug;
  varying vec3 vColor;
  void main() {
    // Debug tint: magenta for trailing particles when uDebug == 1.
    vColor = mix(aColor, vec3(1.0, 0.15, 1.0), aTrail * uDebug);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Trailing particles get a small size boost in debug so they stand out.
    float sizeBoost = 1.0 + aTrail * uDebug * 0.6;
    gl_PointSize = uPointSize * uPixelRatio * sizeBoost * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.25, d);
    gl_FragColor = vec4(vColor, a);
  }
`

const WORDMARK_GRADIENT_STOPS: [number, number, number][] = [
  [255, 64, 64],
  [255, 165, 0],
  [255, 230, 0],
  [80, 220, 100],
  [60, 170, 240],
  [120, 90, 220],
  [220, 80, 200],
]

type CursorSample = { x: number; y: number; t: number }

/**
 * Linear-interpolated sample from the cursor history at `targetTime`
 * (wall-clock ms). Returns the head if past the latest sample, the tail
 * if before the oldest, and null only if the buffer is empty. Uses
 * binary search to find the segment in O(log n).
 */
function lookupCursorHistoryAtTime(
  history: CursorSample[],
  targetTime: number
): { x: number; y: number } | null {
  const n = history.length
  if (n === 0) return null
  const head = history[n - 1]!
  if (targetTime >= head.t) return { x: head.x, y: head.y }
  const tail = history[0]!
  if (targetTime <= tail.t) return { x: tail.x, y: tail.y }
  let lo = 0
  let hi = n - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >>> 1
    if (history[mid]!.t <= targetTime) lo = mid
    else hi = mid
  }
  const a = history[lo]!
  const b = history[hi]!
  const span = b.t - a.t
  const u = span > 1e-6 ? (targetTime - a.t) / span : 0
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }
}

type ParticleFieldProps = {
  stipple: StipplePoint[]
  width: number
  height: number
  particleCount: number
  tuningRef: React.MutableRefObject<ThreeTuning>
  logoFit?: "contain" | "cover"
  useImageColors?: boolean
}

function ParticleField({
  stipple,
  width,
  height,
  particleCount,
  tuningRef,
  logoFit = "contain",
  useImageColors = false,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const { size, camera } = useThree()
  const mouseWorld = useRef<{ x: number; y: number } | null>(null)
  /** Smoothed cursor position. Each onMove samples are smoothed
   * exponentially toward this ref so the history buffer doesn't carry
   * noisy raw pointer jitter. */
  const smoothedCursor = useRef<{ x: number; y: number } | null>(null)
  /** Ring buffer of recent cursor positions with timestamps. Particles
   * read this when they're in the trailing state to follow the cursor's
   * historical path. Trimmed every frame in useFrame. */
  const cursorHistory = useRef<CursorSample[]>([])

  /** Build BufferGeometry + ShaderMaterial + per-particle state arrays
   * once when stipple/count changes. */
  const { geometry, material, state } = useMemo(() => {
    const count = Math.min(particleCount, stipple.length)
    const positions = new Float32Array(count * 3)
    const homes = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const halfW = width / 2
    const halfH = height / 2

    /** Shuffle stipple indices so a low particleCount still samples
     * evenly across the wordmark. Fisher-Yates. */
    const indices = new Uint32Array(stipple.length)
    for (let i = 0; i < stipple.length; i++) indices[i] = i
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const t = indices[i]!
      indices[i] = indices[j]!
      indices[j] = t
    }

    /** Per-particle deterministic hash. Seeded from quantised home (x,y)
     * so each particle gets stable wake-jitter parameters across frames. */
    const trailHash = new Uint32Array(count)

    for (let i = 0; i < count; i++) {
      const sp = stipple[indices[i]!]!
      const wx = sp.x - halfW
      const wy = halfH - sp.y
      const i3 = i * 3
      positions[i3 + 0] = wx
      positions[i3 + 1] = wy
      positions[i3 + 2] = 0
      homes[i3 + 0] = wx
      homes[i3 + 1] = wy
      homes[i3 + 2] = 0
      trailHash[i] =
        (((wx | 0) * 2654435761) ^ ((wy | 0) * 1597334677)) >>> 0

      if (useImageColors && sp.r !== undefined) {
        colors[i3 + 0] = sp.r
        colors[i3 + 1] = sp.g!
        colors[i3 + 2] = sp.b!
      } else {
        const t = sp.u
        const segCount = WORDMARK_GRADIENT_STOPS.length - 1
        const segPos = t * segCount
        let segIdx = Math.floor(segPos)
        if (segIdx >= segCount) segIdx = segCount - 1
        const localT = segPos - segIdx
        const c1 = WORDMARK_GRADIENT_STOPS[segIdx]!
        const c2 = WORDMARK_GRADIENT_STOPS[segIdx + 1]!
        colors[i3 + 0] = (c1[0] + (c2[0] - c1[0]) * localT) / 255
        colors[i3 + 1] = (c1[1] + (c2[1] - c1[1]) * localT) / 255
        colors[i3 + 2] = (c1[2] + (c2[2] - c1[2]) * localT) / 255
      }
    }

    /** Per-particle trailing state.
     *   trailUntil[i]   — wall-clock ms; 0 = not trailing
     *   releaseTime[i]  — wall-clock ms when this particle entered trail
     *   trailOffX/Y[i]  — particle position MINUS cursor position at
     *                     release. Lets the wake start at the particle's
     *                     actual interaction point and fade onto the
     *                     cursor path over time, instead of teleporting
     *                     every particle straight onto the history line.
     *   wasInDisk[i]    — 1 if particle was in disk last frame (edge detect)
     *   trailFlags[i]   — 0 or 1, mirrored to the GPU each frame as aTrail
     *                     so the shader can tint debug-mode particles. */
    const trailUntil = new Float32Array(count)
    const releaseTime = new Float32Array(count)
    const trailOffX = new Float32Array(count)
    const trailOffY = new Float32Array(count)
    const wasInDisk = new Uint8Array(count)
    const trailFlags = new Float32Array(count)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3))
    geo.setAttribute("aTrail", new THREE.BufferAttribute(trailFlags, 1))

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPointSize: { value: tuningRef.current.pointSize },
        uPixelRatio: { value: 1 },
        uDebug: { value: tuningRef.current.debugOverlay ? 1 : 0 },
      },
    })

    return {
      geometry: geo,
      material: mat,
      state: {
        positions,
        homes,
        trailHash,
        trailUntil,
        releaseTime,
        trailOffX,
        trailOffY,
        wasInDisk,
        trailFlags,
        count,
      },
    }
  }, [stipple, particleCount, width, height, tuningRef])

  useEffect(() => {
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
  }, [material])

  /** Cursor tracking: project NDC mouse onto z=0, smooth exponentially,
   * append to history buffer. History trimming happens in useFrame so
   * this handler stays light. */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const rect = (e.target as HTMLElement)?.getBoundingClientRect?.()
      if (!rect) {
        mouseWorld.current = null
        return
      }
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      const vec = new THREE.Vector3(ndcX, ndcY, 0.5)
      vec.unproject(camera)
      const dir = vec.sub(camera.position).normalize()
      const distance = -camera.position.z / dir.z
      const pos = camera.position
        .clone()
        .add(dir.multiplyScalar(distance))
      mouseWorld.current = { x: pos.x, y: pos.y }

      const sm = smoothedCursor.current
      const SMOOTH_K = 0.35
      let cur: { x: number; y: number }
      if (sm == null) {
        cur = { x: pos.x, y: pos.y }
        smoothedCursor.current = cur
      } else {
        sm.x += (pos.x - sm.x) * SMOOTH_K
        sm.y += (pos.y - sm.y) * SMOOTH_K
        cur = sm
      }
      const now = performance.now()
      cursorHistory.current.push({ x: cur.x, y: cur.y, t: now })
    }
    const onLeave = () => {
      mouseWorld.current = null
      smoothedCursor.current = null
    }
    const dom = document.querySelector("canvas")
    if (dom == null) return
    dom.addEventListener("mousemove", onMove)
    dom.addEventListener("mouseleave", onLeave)
    return () => {
      dom.removeEventListener("mousemove", onMove)
      dom.removeEventListener("mouseleave", onLeave)
    }
  }, [camera])

  useFrame((_, dtRaw) => {
    const dt = Math.min(0.05, dtRaw)
    const {
      positions,
      homes,
      trailHash,
      trailUntil,
      releaseTime,
      trailOffX,
      trailOffY,
      wasInDisk,
      trailFlags,
      count,
    } = state
    const nm = tuningRef.current
    if (material.uniforms.uPointSize!.value !== nm.pointSize) {
      material.uniforms.uPointSize!.value = nm.pointSize
    }
    const debugOn = nm.debugOverlay ? 1 : 0
    if (material.uniforms.uDebug!.value !== debugOn) {
      material.uniforms.uDebug!.value = debugOn
    }

    const nowTick = performance.now()

    /** Trim cursor history each frame to (trailFollowMs + wakeTimeOffsetMs
     * + 500ms slack). Buffer length is bounded by sampling rate × window. */
    const histCutoff = nowTick - (nm.trailFollowMs + nm.wakeTimeOffsetMs + 500)
    const hist = cursorHistory.current
    while (hist.length > 0 && hist[0]!.t < histCutoff) hist.shift()

    const mw = mouseWorld.current
    const mx = mw?.x ?? 0
    const my = mw?.y ?? 0
    const haveCursor = mw != null
    const cursorRadius = nm.cursorRadius
    const radSq = cursorRadius * cursorRadius
    const voidR = nm.cursorDisplacement

    const inAlpha = Math.min(1.0, nm.inBlend * dt)
    const outAlpha = Math.min(1.0, nm.outBlend * dt)

    const trailFollowMs = nm.trailFollowMs
    const wakePace = nm.wakePace
    const wakePaceJitter = nm.wakePaceJitter
    const wakeTimeOffsetMs = nm.wakeTimeOffsetMs
    const wakeAlongStretchBmp = nm.wakeAlongStretchBmp
    const wakeBandSpreadBmp = nm.wakeBandSpreadBmp
    const wakeReleaseStaggerMs = nm.wakeReleaseStaggerMs
    const trailingProbability = nm.trailingProbability

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const hx = homes[i3]!
      const hy = homes[i3 + 1]!
      let px = positions[i3]!
      let py = positions[i3 + 1]!

      const tUntil = trailUntil[i]!
      const trailing = tUntil > 0 && nowTick < tUntil

      if (trailing) {
        /** WAKE PLAYBACK — particle is driven by cursor history. */
        const h = trailHash[i]!
        const rand01 = (h & 0xffffff) / 0xffffff
        const rand2 = (((h >>> 8) * 2246822519) >>> 0 & 0xffffff) / 0xffffff
        const rand3 = (((h >>> 16) * 374761393) >>> 0 & 0xffffff) / 0xffffff
        const rand4 = (((h >>> 4) * 3266489917) >>> 0 & 0xffffff) / 0xffffff

        const release = releaseTime[i]!
        const stagger = rand3 * wakeReleaseStaggerMs
        const elapsed = nowTick - release - stagger

        if (elapsed > 0) {
          const paceFactor = 1 + (rand01 * 2 - 1) * wakePaceJitter
          const particlePace = Math.max(0.05, wakePace * paceFactor)
          const timeOffset = rand4 * rand4 * wakeTimeOffsetMs
          const playheadT =
            release + stagger + elapsed * particlePace - timeOffset

          const sample = lookupCursorHistoryAtTime(hist, playheadT)
          if (sample != null) {
            let tanX = 1
            let tanY = 0
            let perpX = 0
            let perpY = 0
            const lookAhead = lookupCursorHistoryAtTime(hist, playheadT + 50)
            if (lookAhead != null) {
              const tdx = lookAhead.x - sample.x
              const tdy = lookAhead.y - sample.y
              const tlen = Math.hypot(tdx, tdy)
              if (tlen > 1e-3) {
                tanX = tdx / tlen
                tanY = tdy / tlen
                perpX = -tanY
                perpY = tanX
              }
            }

            const wakeTotalMs = Math.max(1, trailFollowMs - stagger)
            const u = Math.max(0, Math.min(1, elapsed / wakeTotalMs))
            /** Quadratic taper — band collapses toward the trail end so
             * the ribbon reads as a teardrop (wide at cursor, thin at tail). */
            const taper = (1 - u) * (1 - u)

            const swirlSide = rand2 < 0.5 ? -1 : 1
            const isCore = rand2 < 0.3
            const magnitudeMul = isCore
              ? 0.15 + rand2 * 0.5
              : 0.7 + rand2 * 0.6

            const bandAmp =
              wakeBandSpreadBmp * swirlSide * magnitudeMul * taper
            const stretchSign = rand01 * 2 - 1
            const stretchAmp = wakeAlongStretchBmp * stretchSign

            /** Release-relative offset: at release we recorded the
             * particle's position relative to the cursor. Apply it here
             * scaled by offDecay so at elapsed=0 the particle is at its
             * release position (sample + originalOffset = particle's
             * actual position when released), and by elapsed=trailFollowMs
             * the offset has decayed to 0 and the particle has converged
             * to the pure cursor path. This is what makes the wake LOOK
             * like particles peeling off where the cursor touched them
             * instead of teleporting onto an arbitrary history point. */
            const offDecay = 1 - u
            const offX = trailOffX[i]! * offDecay
            const offY = trailOffY[i]! * offDecay

            px =
              sample.x + offX + tanX * stretchAmp + perpX * bandAmp
            py =
              sample.y + offY + tanY * stretchAmp + perpY * bandAmp
          }
          /** If sample is null (history empty), particle holds last position. */
        }
        /** Else: pre-stagger — particle holds release position. */

        positions[i3] = px
        positions[i3 + 1] = py
        trailFlags[i] = 1
        /** While trailing, suppress disk detection so we don't immediately
         * re-trail when the trail-band particle wanders back through. */
        wasInDisk[i] = 0
        continue
      } else if (tUntil > 0) {
        /** Trail just ended — clear the flag so next disk visit can re-arm. */
        trailUntil[i] = 0
        trailFlags[i] = 0
      }

      /** CARRY MODEL (in-disk pull + void clamp) + edge-detected release. */
      let targetX = hx
      let targetY = hy
      let inDisk = false
      let falloff = 0

      if (haveCursor) {
        const dx = hx - mx
        const dy = hy - my
        const distSq = dx * dx + dy * dy
        if (distSq < radSq) {
          inDisk = true
          const dist = Math.sqrt(Math.max(distSq, 0.001))
          const norm = 1 - dist / cursorRadius
          falloff = norm * norm

          const carry = nm.carryStrength * falloff
          targetX = hx + (mx - hx) * carry
          targetY = hy + (my - hy) * carry

          if (voidR > 0) {
            const tdx = targetX - mx
            const tdy = targetY - my
            const td = Math.hypot(tdx, tdy)
            if (td < voidR && td > 0.001) {
              const s = voidR / td
              targetX = mx + tdx * s
              targetY = my + tdy * s
            }
          }
        }
      }

      const alpha = inDisk ? inAlpha : outAlpha
      px += (targetX - px) * alpha
      py += (targetY - py) * alpha

      /** Edge detect: particle just exited the disk. Roll dice to release
       * into wake-playback. Use the per-particle hash + time bucket so the
       * roll is deterministic-ish but varies across exits. */
      if (haveCursor && wasInDisk[i] === 1 && !inDisk) {
        const h = trailHash[i]!
        const rollHash =
          (h ^ ((Math.floor(nowTick * 0.013) | 0) * 2654435761)) >>> 0
        const roll = (rollHash & 0xffffff) / 0xffffff
        if (roll < trailingProbability) {
          trailUntil[i] = nowTick + trailFollowMs
          releaseTime[i] = nowTick
          /** Record where THIS particle is relative to the cursor at the
           * moment of release. This is the offset that anchors the start
           * of its wake to its actual interaction point. */
          trailOffX[i] = px - mx
          trailOffY[i] = py - my
        }
      }
      wasInDisk[i] = inDisk ? 1 : 0

      positions[i3] = px
      positions[i3 + 1] = py
    }
    geometry.attributes.position!.needsUpdate = true
    if (debugOn === 1) {
      /** Only push aTrail to the GPU when debug is on — otherwise it has
       * no visual effect and the upload is pure waste. */
      geometry.attributes.aTrail!.needsUpdate = true
    }
  })

  /** Auto-fit camera — contain keeps full image visible; cover fills viewport edge-to-edge. */
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    if (cam.isPerspectiveCamera == null) return
    const fitMargin = logoFit === "cover" ? 1.0 : 0.85
    const vFov = (cam.fov * Math.PI) / 180
    const tanHalfFov = Math.tan(vFov / 2)
    const distForHeight = height / fitMargin / (2 * tanHalfFov)
    const distForWidth = width / fitMargin / (2 * tanHalfFov * cam.aspect)
    const dist = logoFit === "cover"
      ? Math.min(distForHeight, distForWidth)
      : Math.max(distForHeight, distForWidth)
    cam.position.set(0, 0, dist)
    cam.lookAt(0, 0, 0)
    cam.updateProjectionMatrix()
  }, [width, height, size.width, size.height, camera, logoFit])

  return (
    <>
      <points ref={pointsRef} geometry={geometry} material={material} />
      <DebugCursorHistory
        cursorHistory={cursorHistory}
        smoothedCursor={smoothedCursor}
        tuningRef={tuningRef}
      />
    </>
  )
}

/** Cursor-history visualizer. Draws a polyline along the recorded cursor
 * samples (newest = bright magenta head, fading to dim toward the tail)
 * and a crosshair at the smoothed cursor position. Only mounted into
 * the scene when `debugOverlay` is on, so the overhead is zero in the
 * default release build.
 *
 * This is a diagnostic — it lets the user see EXACTLY what the wake
 * playback has to work with: if the polyline is empty or only a single
 * point, there is no history for particles to follow.
 */
function DebugCursorHistory({
  cursorHistory,
  smoothedCursor,
  tuningRef,
}: {
  cursorHistory: React.MutableRefObject<CursorSample[]>
  smoothedCursor: React.MutableRefObject<{ x: number; y: number } | null>
  tuningRef: React.MutableRefObject<ThreeTuning>
}) {
  /** Pre-allocate max line capacity. 1024 samples × ~16ms ≈ 16s buffer,
   * comfortably more than any sensible `trailFollowMs`. */
  const MAX = 1024
  const positions = useMemo(() => new Float32Array(MAX * 3), [])

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    g.setDrawRange(0, 0)
    return g
  }, [positions])

  const lineMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0xff44ff,
        transparent: true,
        opacity: 0.85,
        depthTest: false,
        depthWrite: false,
      }),
    []
  )

  /** Build the THREE.Line object once and render via `<primitive>`. The
   * lowercase `<line>` JSX element collides with SVG's `<line>` in TS. */
  const lineObject = useMemo(
    () => new THREE.Line(lineGeo, lineMat),
    [lineGeo, lineMat]
  )

  const markerGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(3), 3)
    )
    return g
  }, [])

  const markerMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: 0xffff00,
        size: 14,
        sizeAttenuation: false,
        depthTest: false,
        depthWrite: false,
        transparent: true,
      }),
    []
  )

  useFrame(() => {
    const debug = tuningRef.current.debugOverlay
    if (!debug) {
      lineGeo.setDrawRange(0, 0)
      markerMat.opacity = 0
      return
    }
    const hist = cursorHistory.current
    const n = Math.min(hist.length, MAX)
    /** Copy samples newest-on-the-end into the position buffer. We slice
     * from the tail so the line always shows the most recent window. */
    const start = hist.length - n
    for (let i = 0; i < n; i++) {
      const s = hist[start + i]!
      positions[i * 3] = s.x
      positions[i * 3 + 1] = s.y
      positions[i * 3 + 2] = 0.1
    }
    lineGeo.setDrawRange(0, n)
    lineGeo.attributes.position!.needsUpdate = true

    const sm = smoothedCursor.current
    const m = markerGeo.attributes.position! as THREE.BufferAttribute
    if (sm != null) {
      const arr = m.array as Float32Array
      arr[0] = sm.x
      arr[1] = sm.y
      arr[2] = 0.2
      m.needsUpdate = true
      markerMat.opacity = 1
    } else {
      markerMat.opacity = 0
    }
  })

  /** Always mounted — when debug is off the draw range is 0 and marker
   * opacity is 0, so the GPU cost is negligible. This lets the component
   * react to tuning toggles without remount. */
  return (
    <>
      <primitive object={lineObject} frustumCulled={false} />
      <points
        geometry={markerGeo}
        material={markerMat}
        frustumCulled={false}
      />
    </>
  )
}

type Props = {
  logoSrc?: string
  particleCount?: number
  logoFit?: "contain" | "cover"
  /** When true, sample each particle's colour directly from the source image
   * instead of using the gradient. Ideal for photos. */
  useImageColors?: boolean
}

export default function HomeParticleThree({
  logoSrc = "/branding/sc-prints-logo-transparent.png",
  logoFit = "contain",
  useImageColors = false,
}: Props) {
  const [stipple, setStipple] = useState<{
    points: StipplePoint[]
    width: number
    height: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tuning, setTuning] = useState<ThreeTuning>(() => loadStoredTuning())
  const tuningRef = useRef<ThreeTuning>(tuning)
  useEffect(() => {
    tuningRef.current = tuning
  }, [tuning])

  useEffect(() => {
    let cancelled = false
    sampleWordmarkStipple(logoSrc, 1024, 128, useImageColors)
      .then((result) => {
        if (cancelled) return
        setStipple(result)
      })
      .catch((e) => {
        if (cancelled) return
        setError(String(e))
      })
    return () => {
      cancelled = true
    }
  }, [logoSrc])

  if (error != null) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-ui-fg-error">
        <p>Failed to sample wordmark: {error}</p>
      </div>
    )
  }

  return (
    <div className={`relative w-full bg-black ${logoFit === "cover" ? "h-screen" : "h-[80vh]"}`}>
      <Canvas
        camera={{ position: [0, 0, 1000], fov: 35, near: 1, far: 5000 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {stipple != null && (
            <ParticleField
              stipple={stipple.points}
              width={stipple.width}
              height={stipple.height}
              particleCount={tuning.particleCount}
              tuningRef={tuningRef}
              logoFit={logoFit}
              useImageColors={useImageColors}
            />
          )}
        </Suspense>
      </Canvas>
      <ThreeTunerPanel tuning={tuning} onChange={setTuning} />
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-ui-fg-subtle">
        Three.js Points · {tuning.particleCount.toLocaleString()} particles
      </div>
    </div>
  )
}
