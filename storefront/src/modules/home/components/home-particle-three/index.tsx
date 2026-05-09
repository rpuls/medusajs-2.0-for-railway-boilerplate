"use client"

/**
 * Three.js Points-mesh particle hero.
 *
 * Path B from the Newmix tuning audit: same wordmark stipple + same
 * cursor-driven physics philosophy as the Canvas 2D version, but rendering
 * via WebGL Points + a custom shader. This unlocks ~140k+ particles at
 * 60fps where Canvas 2D's per-particle fillRect tops out around 60-80k.
 *
 * v1 scope (this file):
 *   - Sample wordmark alpha → home positions
 *   - Per-particle attributes (position, home, color)
 *   - Cursor world-position via raycaster, soft radial repulsion
 *   - Hooke spring back to home + linear friction
 *   - Custom shader: round soft dots, color from wordmark gradient
 *
 * Follow-up (next commits):
 *   - Field-driven cursor (Stam fluid: inject + advect + diffuse + project)
 *   - Wake-history playback
 *   - Probabilistic capture-color invert + glow
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
  uniform float uPointSize;
  uniform float uPixelRatio;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uPointSize * uPixelRatio * (300.0 / -mv.z);
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
  // Spectrum-ish gradient that matches the Canvas 2D version's default
  [255, 64, 64],
  [255, 165, 0],
  [255, 230, 0],
  [80, 220, 100],
  [60, 170, 240],
  [120, 90, 220],
  [220, 80, 200],
]

type ParticleFieldProps = {
  stipple: StipplePoint[]
  width: number
  height: number
  /** Snapshot of the count at geometry build time. Changing this rebuilds
   * the BufferGeometry. Other knobs are live via tuningRef. */
  particleCount: number
  /** Live tuning ref — useFrame reads .current each frame so slider
   * changes take effect immediately without re-binding closures. */
  tuningRef: React.MutableRefObject<ThreeTuning>
}

function ParticleField({
  stipple,
  width,
  height,
  particleCount,
  tuningRef,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const { size, viewport, camera } = useThree()
  const mouseWorld = useRef<{ x: number; y: number } | null>(null)
  const mousePrev = useRef<{ x: number; y: number; t: number } | null>(null)
  const mouseVel = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 })

  /** Build BufferGeometry + ShaderMaterial once when stipple/count changes. */
  const { geometry, material, state } = useMemo(() => {
    const count = Math.min(particleCount, stipple.length)
    const positions = new Float32Array(count * 3)
    const homes = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    /** Center the wordmark. World units: [-w/2, +w/2]. Y is flipped from
     * canvas-space (canvas y goes down, world y goes up). */
    const halfW = width / 2
    const halfH = height / 2

    /** Shuffle the stipple indices so we sample evenly across the wordmark
     * even at low particle counts (otherwise a sequential walk fills the
     * top of the image first). Fisher-Yates. */
    const indices = new Uint32Array(stipple.length)
    for (let i = 0; i < stipple.length; i++) indices[i] = i
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const t = indices[i]!
      indices[i] = indices[j]!
      indices[j] = t
    }

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
      velocities[i3 + 0] = 0
      velocities[i3 + 1] = 0
      velocities[i3 + 2] = 0

      /** Color from horizontal gradient projection across wordmark. */
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

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      /** Additive blending — overlapping particles sum their RGB. This is
       * what gives Newmix's bright/glowing wake: dense regions naturally
       * read as luminous against the black background, while sparse
       * regions stay subtle. NormalBlending caps at the most opaque
       * particle and makes everything look uniformly dim. */
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPointSize: { value: tuningRef.current.pointSize },
        uPixelRatio: { value: 1 },
      },
    })

    return {
      geometry: geo,
      material: mat,
      state: {
        positions,
        homes,
        velocities,
        count,
      },
    }
  }, [stipple, particleCount, width, height, tuningRef])

  /** Keep uPixelRatio uniform in sync with renderer pixel ratio. */
  useEffect(() => {
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
  }, [material])

  /** Track cursor in world space. R3F gives us NDC mouse via state.mouse;
   * we project onto z=0 plane (where particles live). */
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
      const now = performance.now()
      const prev = mousePrev.current
      if (prev != null) {
        const dt = Math.max(0.001, (now - prev.t) / 1000)
        const rawVx = (pos.x - prev.x) / dt
        const rawVy = (pos.y - prev.y) / dt
        /** Smooth mouse velocity to avoid sudden jolts. */
        const k = 0.4
        mouseVel.current.vx = mouseVel.current.vx * (1 - k) + rawVx * k
        mouseVel.current.vy = mouseVel.current.vy * (1 - k) + rawVy * k
      }
      mousePrev.current = { x: pos.x, y: pos.y, t: now }
      mouseWorld.current = { x: pos.x, y: pos.y }
    }
    const onLeave = () => {
      mouseWorld.current = null
      mousePrev.current = null
      mouseVel.current = { vx: 0, vy: 0 }
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

  /** Per-frame physics. Reads tuning live each frame from tuningRef so
   * slider changes take effect without re-binding closures. */
  useFrame((_, dtRaw) => {
    const dt = Math.min(0.05, dtRaw)
    const { positions, homes, velocities, count } = state
    const t = tuningRef.current
    /** Sync point size uniform with current tuning. */
    if (material.uniforms.uPointSize!.value !== t.pointSize) {
      material.uniforms.uPointSize!.value = t.pointSize
    }
    const mw = mouseWorld.current
    const mvxRaw = mouseVel.current.vx * t.mouseVelocityScale
    const mvyRaw = mouseVel.current.vy * t.mouseVelocityScale
    const mouseSpeed = Math.hypot(mvxRaw, mvyRaw)
    const mx = mw?.x ?? Number.POSITIVE_INFINITY
    const my = mw?.y ?? Number.POSITIVE_INFINITY
    const haveCursor = mw != null
    const cursorRadius = t.cursorRadius
    const radSq = cursorRadius * cursorRadius
    const frictionFrame = Math.max(0, 1 - t.friction * dt)
    const springFrame = t.springStiffness * dt
    /** Cap directional mouse-velocity contribution so flicks don't fling
     * particles off-screen. */
    const mouseSpeedCap = 1500
    const mouseSpeedClamped = Math.min(mouseSpeed, mouseSpeedCap)
    const mvScale =
      mouseSpeed > 0.001 ? mouseSpeedClamped / mouseSpeed : 0
    const mvxc = mvxRaw * mvScale
    const mvyc = mvyRaw * mvScale
    const wake = t.wakeStrength
    const cursorForce = t.cursorForce
    const sideSwirl = t.sideSwirlForce
    /** Mouse motion direction unit vector + perpendicular. Used for the
     * orbital swirl force: particles on opposite sides of the motion line
     * get opposite-signed tangential force, producing curl. */
    const haveMotion = mouseSpeed > 0.001
    let mfx = 0
    let mfy = 0
    let mrx = 0
    let mry = 0
    if (haveMotion) {
      mfx = mvxRaw / mouseSpeed
      mfy = mvyRaw / mouseSpeed
      mrx = -mfy
      mry = mfx
    }
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const px = positions[i3]!
      const py = positions[i3 + 1]!
      let vx = velocities[i3]!
      let vy = velocities[i3 + 1]!

      /** Spring back to home. */
      vx += (homes[i3]! - px) * springFrame
      vy += (homes[i3 + 1]! - py) * springFrame

      /** Cursor force. */
      if (haveCursor) {
        const dx = px - mx
        const dy = py - my
        const distSq = dx * dx + dy * dy
        if (distSq < radSq && distSq > 0.001) {
          const dist = Math.sqrt(distSq)
          const falloff = 1 - dist / cursorRadius
          const ff2 = falloff * falloff
          /** Directional wake: in-disk particles pick up cursor velocity. */
          vx += mvxc * ff2 * dt * wake
          vy += mvyc * ff2 * dt * wake
          /** Radial: outward push so cursor leaves a soft void. */
          const radF = cursorForce * ff2 * dt
          vx += (dx / dist) * radF
          vy += (dy / dist) * radF
          /** Side swirl: tangential force perpendicular to particle's
           * direction from cursor center, signed by which side of the
           * cursor's motion line the particle is on. THE Newmix curl
           * force — produces contained orbital swirl rather than
           * straight-line flame trails. Scales with cursor speed so
           * stationary cursor doesn't spin particles. */
          if (haveMotion && sideSwirl > 0) {
            const ux = dx / dist
            const uy = dy / dist
            const ccwX = -uy
            const ccwY = ux
            const perp = dx * mrx + dy * mry
            const vSgn = perp >= 0 ? -1 : 1
            const swirlF =
              sideSwirl * ff2 * dt * Math.min(mouseSpeed, 1500)
            vx += vSgn * ccwX * swirlF
            vy += vSgn * ccwY * swirlF
          }
        }
      }

      /** Friction. */
      vx *= frictionFrame
      vy *= frictionFrame

      velocities[i3] = vx
      velocities[i3 + 1] = vy
      positions[i3] = px + vx * dt * 60
      positions[i3 + 1] = py + vy * dt * 60
    }
    geometry.attributes.position!.needsUpdate = true
  })

  /** Auto-fit camera so the WHOLE wordmark fits in the viewport with a
   * small margin. Compute the camera distance needed to fit width AND
   * height, take the larger so both fit (necessary when the wordmark is
   * taller than it is wide, e.g. SC PRINTS at 946×1024). */
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    if (cam.isPerspectiveCamera == null) return
    const fitMargin = 0.85
    const vFov = (cam.fov * Math.PI) / 180
    const tanHalfFov = Math.tan(vFov / 2)
    const distForHeight = height / fitMargin / (2 * tanHalfFov)
    const distForWidth = width / fitMargin / (2 * tanHalfFov * cam.aspect)
    const dist = Math.max(distForHeight, distForWidth)
    cam.position.set(0, 0, dist)
    cam.lookAt(0, 0, 0)
    cam.updateProjectionMatrix()
  }, [width, height, size.width, size.height, camera])

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  )
}

type Props = {
  logoSrc?: string
  /** Initial particle count. Overridable via the tuner panel. */
  particleCount?: number
}

export default function HomeParticleThree({
  logoSrc = "/branding/sc-prints-logo-transparent.png",
}: Props) {
  const [stipple, setStipple] = useState<{
    points: StipplePoint[]
    width: number
    height: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  /** Tuning state. Loaded from localStorage (or defaults). The ref
   * mirrors state so the per-frame loop reads live values without
   * triggering a re-bind of the useFrame closure. */
  const [tuning, setTuning] = useState<ThreeTuning>(() => loadStoredTuning())
  const tuningRef = useRef<ThreeTuning>(tuning)
  useEffect(() => {
    tuningRef.current = tuning
  }, [tuning])

  useEffect(() => {
    let cancelled = false
    sampleWordmarkStipple(logoSrc, 1024)
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
    <div className="relative h-[80vh] w-full bg-black">
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
