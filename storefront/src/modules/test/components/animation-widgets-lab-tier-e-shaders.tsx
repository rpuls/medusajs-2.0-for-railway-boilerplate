"use client"

import gsap from "gsap"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"

/* -------------------------------------------------------------------------- */
/* Shared WebGL boilerplate                                                   */
/* -------------------------------------------------------------------------- */

const VERT_PASSTHROUGH = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const sh = gl.createShader(type)
  if (!sh) {
    return null
  }
  gl.shaderSource(sh, source)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    // eslint-disable-next-line no-console
    console.warn("[lab-tier-e] shader compile error", gl.getShaderInfoLog(sh))
    gl.deleteShader(sh)
    return null
  }
  return sh
}

function createProgram(gl: WebGLRenderingContext, frag: string) {
  const v = compile(gl, gl.VERTEX_SHADER, VERT_PASSTHROUGH)
  const f = compile(gl, gl.FRAGMENT_SHADER, frag)
  if (!v || !f) {
    return null
  }
  const prog = gl.createProgram()
  if (!prog) {
    return null
  }
  gl.attachShader(prog, v)
  gl.attachShader(prog, f)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    // eslint-disable-next-line no-console
    console.warn("[lab-tier-e] program link error", gl.getProgramInfoLog(prog))
    return null
  }
  return prog
}

function bindFullscreenQuad(gl: WebGLRenderingContext, prog: WebGLProgram) {
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  )
  const loc = gl.getAttribLocation(prog, "a_position")
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
}

type ShaderRunOpts = {
  frag: string
  pointer: { x: number; y: number }
  /** Optional progress 0..1 (driven by parent). */
  progress?: number
  /** Optional image to upload as u_image. */
  image?: HTMLImageElement | null
  reducedMotion: boolean
  paused?: boolean
}

/** Self-contained fragment-shader runner that fills its host element. */
function useShaderCanvas(
  ref: React.RefObject<HTMLCanvasElement | null>,
  opts: ShaderRunOpts
) {
  const { frag, pointer, image, reducedMotion, paused } = opts
  const progressRef = useRef(opts.progress ?? 0)
  progressRef.current = opts.progress ?? 0

  const pointerRef = useRef(pointer)
  pointerRef.current = pointer

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) {
      return
    }
    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: false,
      antialias: true,
    })
    if (!gl) {
      return
    }
    const prog = createProgram(gl, frag)
    if (!prog) {
      return
    }
    gl.useProgram(prog)
    bindFullscreenQuad(gl, prog)

    const uTime = gl.getUniformLocation(prog, "u_time")
    const uRes = gl.getUniformLocation(prog, "u_resolution")
    const uMouse = gl.getUniformLocation(prog, "u_mouse")
    const uProg = gl.getUniformLocation(prog, "u_progress")
    const uImage = gl.getUniformLocation(prog, "u_image")
    const uImageRes = gl.getUniformLocation(prog, "u_image_resolution")

    let tex: WebGLTexture | null = null
    if (image) {
      tex = gl.createTexture()
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      )
      if (uImage) {
        gl.uniform1i(uImage, 0)
      }
      if (uImageRes) {
        gl.uniform2f(uImageRes, image.naturalWidth, image.naturalHeight)
      }
    }

    let raf = 0
    const start = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const r = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(r.width * dpr))
      canvas.height = Math.max(1, Math.floor(r.height * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
      if (uRes) {
        gl.uniform2f(uRes, canvas.width, canvas.height)
      }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (paused) {
        return
      }
      const t = (performance.now() - start) / 1000
      gl.useProgram(prog)
      if (uTime) {
        gl.uniform1f(uTime, reducedMotion ? 0 : t)
      }
      if (uMouse) {
        gl.uniform2f(uMouse, pointerRef.current.x, pointerRef.current.y)
      }
      if (uProg) {
        gl.uniform1f(uProg, progressRef.current)
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      if (tex) {
        gl.deleteTexture(tex)
      }
      gl.deleteProgram(prog)
    }
    // image is part of the dependency list because re-uploading mid-life is rare and
    // the texture goes with the program teardown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frag, image, reducedMotion, paused])
}

/** Pointer normalized to [0,1] within a host element. */
function usePointerNorm() {
  const [p, setP] = useState({ x: 0.5, y: 0.5 })
  const onMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setP({
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    })
  }, [])
  return { pointer: p, onPointerMove: onMove, setPointer: setP }
}

/** Lazy-load an image once and return when decoded. */
function useDecodedImage(src: string | null) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    if (!src) {
      setImg(null)
      return
    }
    const i = new Image()
    i.crossOrigin = "anonymous"
    i.src = src
    let cancelled = false
    i.decode()
      .then(() => {
        if (!cancelled) {
          setImg(i)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setImg(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [src])
  return img
}

const SAMPLE_IMG = "https://picsum.photos/seed/labshader/1024/640"

/* -------------------------------------------------------------------------- */
/* 1. Lens distortion hover                                                   */
/* -------------------------------------------------------------------------- */

const FRAG_LENS = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_mouse;
uniform sampler2D u_image;
uniform vec2 u_image_resolution;
uniform vec2 u_resolution;

void main() {
  vec2 uv = v_uv;
  // cover-fit
  vec2 cR = u_resolution / max(u_resolution.x, u_resolution.y);
  vec2 iR = u_image_resolution / max(u_image_resolution.x, u_image_resolution.y);
  float scale = max(cR.x / iR.x, cR.y / iR.y);
  vec2 fit = (uv - 0.5) * (cR / iR) / scale + 0.5;

  vec2 d = fit - u_mouse;
  float r = length(d);
  float k = smoothstep(0.32, 0.0, r);
  vec2 distort = fit + normalize(d + 1e-6) * k * 0.06;
  vec3 col = texture2D(u_image, distort).rgb;
  // chromatic offset on rim
  float ca = k * 0.012;
  col.r = texture2D(u_image, distort + vec2(ca, 0.0)).r;
  col.b = texture2D(u_image, distort - vec2(ca, 0.0)).b;
  gl_FragColor = vec4(col, 1.0);
}
`

export function LabTierELensDistortion({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { pointer, onPointerMove, setPointer } = usePointerNorm()
  const img = useDecodedImage(SAMPLE_IMG)

  useShaderCanvas(ref, {
    frag: FRAG_LENS,
    pointer,
    image: img,
    reducedMotion,
  })

  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-ui-border-base bg-black"
      onPointerMove={reducedMotion ? undefined : onPointerMove}
      onPointerLeave={() => setPointer({ x: 0.5, y: 0.5 })}
    >
      <canvas ref={ref} className="block h-full w-full" />
      <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/55 px-2 py-1 text-xs text-white">
        Move pointer — fragment shader bulges + chromatic-aberration ring.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 2. GSAP-driven ripple shader                                               */
/* -------------------------------------------------------------------------- */

const FRAG_RIPPLE = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_mouse;
uniform float u_progress;
uniform sampler2D u_image;
uniform vec2 u_image_resolution;
uniform vec2 u_resolution;

void main() {
  vec2 uv = v_uv;
  vec2 cR = u_resolution / max(u_resolution.x, u_resolution.y);
  vec2 iR = u_image_resolution / max(u_image_resolution.x, u_image_resolution.y);
  float scale = max(cR.x / iR.x, cR.y / iR.y);
  vec2 fit = (uv - 0.5) * (cR / iR) / scale + 0.5;

  float radius = u_progress * 1.1;
  float thickness = 0.16;
  float dist = distance(fit, u_mouse);
  float band = smoothstep(radius, radius - thickness, dist) -
               smoothstep(radius - thickness, radius - thickness * 2.0, dist);
  float ring = clamp(band, 0.0, 1.0) * (1.0 - u_progress * 0.6);
  vec2 dir = normalize(fit - u_mouse + 1e-6);
  vec2 dist_uv = fit - dir * ring * 0.04;

  vec3 col = texture2D(u_image, dist_uv).rgb;
  col += ring * 0.35;
  gl_FragColor = vec4(col, 1.0);
}
`

export function LabTierERippleShader({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 })
  const [progress, setProgress] = useState(0)
  const img = useDecodedImage(SAMPLE_IMG)

  useShaderCanvas(ref, { frag: FRAG_RIPPLE, pointer, progress, image: img, reducedMotion })

  const trigger = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion) {
        return
      }
      const r = e.currentTarget.getBoundingClientRect()
      setPointer({
        x: (e.clientX - r.left) / r.width,
        y: 1 - (e.clientY - r.top) / r.height,
      })
      gsap.killTweensOf(setProgress)
      const obj = { p: 0 }
      gsap.to(obj, {
        p: 1,
        duration: 1.1,
        ease: "power2.out",
        onUpdate: () => setProgress(obj.p),
      })
    },
    [reducedMotion]
  )

  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-ui-border-base bg-black"
      onPointerDown={trigger}
    >
      <canvas ref={ref} className="block h-full w-full" />
      <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/55 px-2 py-1 text-xs text-white">
        Click anywhere — GSAP tweens a single <code>u_progress</code> uniform 0→1.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 3. ASCII filter                                                            */
/* -------------------------------------------------------------------------- */

const FRAG_ASCII = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform sampler2D u_image;
uniform vec2 u_image_resolution;

float charMask(int idx, vec2 p) {
  // Crude glyph atlas: 5 luminance buckets approximated by primitive shapes.
  if (idx == 0) {
    return 0.0; // ' '
  }
  if (idx == 1) {
    // dot
    float d = distance(p, vec2(0.5));
    return smoothstep(0.16, 0.12, d);
  }
  if (idx == 2) {
    // dash
    return step(0.2, p.y) * step(p.y, 0.55) * step(0.15, p.x) * step(p.x, 0.85);
  }
  if (idx == 3) {
    // plus
    float v = step(0.4, p.x) * step(p.x, 0.6);
    float h = step(0.4, p.y) * step(p.y, 0.6);
    return clamp(v + h, 0.0, 1.0);
  }
  // # (idx==4)
  float a = step(0.2, p.x) * step(p.x, 0.32) + step(0.65, p.x) * step(p.x, 0.78);
  float b = step(0.2, p.y) * step(p.y, 0.32) + step(0.65, p.y) * step(p.y, 0.78);
  return clamp(a + b, 0.0, 1.0);
}

void main() {
  vec2 cell = vec2(10.0, 12.0);
  vec2 grid = u_resolution / cell;
  vec2 uv = v_uv;
  vec2 cellUV = floor(uv * grid) / grid + 0.5 / grid;

  vec2 cR = u_resolution / max(u_resolution.x, u_resolution.y);
  vec2 iR = u_image_resolution / max(u_image_resolution.x, u_image_resolution.y);
  float scale = max(cR.x / iR.x, cR.y / iR.y);
  vec2 fit = (cellUV - 0.5) * (cR / iR) / scale + 0.5;
  vec3 sample = texture2D(u_image, fit).rgb;
  float lum = dot(sample, vec3(0.299, 0.587, 0.114));

  int idx = 0;
  if (lum > 0.85) idx = 4;
  else if (lum > 0.6) idx = 3;
  else if (lum > 0.35) idx = 2;
  else if (lum > 0.12) idx = 1;

  vec2 cellPos = fract(uv * grid);
  float mask = charMask(idx, cellPos);
  vec3 col = mix(vec3(0.04, 0.05, 0.08), vec3(0.85, 1.0, 0.7), mask);
  gl_FragColor = vec4(col, 1.0);
}
`

export function LabTierEAsciiFilter({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const img = useDecodedImage(SAMPLE_IMG)
  useShaderCanvas(ref, {
    frag: FRAG_ASCII,
    pointer: { x: 0, y: 0 },
    image: img,
    reducedMotion,
  })

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-ui-border-base bg-black">
      <canvas ref={ref} className="block h-full w-full" />
      <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/55 px-2 py-1 text-xs text-white">
        Per-cell luminance → glyph bucket (space, dot, dash, plus, hash). Inline GLSL.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 4. Bayer dither                                                            */
/* -------------------------------------------------------------------------- */

const FRAG_DITHER = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform sampler2D u_image;
uniform vec2 u_image_resolution;
uniform float u_progress; // 0..1 controls matrix size

float bayer4(vec2 p) {
  // 4x4 Bayer threshold matrix encoded as bit interleaving (no array indexing).
  float x = mod(floor(p.x), 4.0);
  float y = mod(floor(p.y), 4.0);
  float v = 0.0;
  if (x == 0.0 && y == 0.0) v = 0.0;
  else if (x == 1.0 && y == 0.0) v = 8.0;
  else if (x == 2.0 && y == 0.0) v = 2.0;
  else if (x == 3.0 && y == 0.0) v = 10.0;
  else if (x == 0.0 && y == 1.0) v = 12.0;
  else if (x == 1.0 && y == 1.0) v = 4.0;
  else if (x == 2.0 && y == 1.0) v = 14.0;
  else if (x == 3.0 && y == 1.0) v = 6.0;
  else if (x == 0.0 && y == 2.0) v = 3.0;
  else if (x == 1.0 && y == 2.0) v = 11.0;
  else if (x == 2.0 && y == 2.0) v = 1.0;
  else if (x == 3.0 && y == 2.0) v = 9.0;
  else if (x == 0.0 && y == 3.0) v = 15.0;
  else if (x == 1.0 && y == 3.0) v = 7.0;
  else if (x == 2.0 && y == 3.0) v = 13.0;
  else if (x == 3.0 && y == 3.0) v = 5.0;
  return v / 16.0;
}

void main() {
  vec2 uv = v_uv;
  vec2 cR = u_resolution / max(u_resolution.x, u_resolution.y);
  vec2 iR = u_image_resolution / max(u_image_resolution.x, u_image_resolution.y);
  float scale = max(cR.x / iR.x, cR.y / iR.y);
  vec2 fit = (uv - 0.5) * (cR / iR) / scale + 0.5;

  // Pixelize first based on progress (1..6 px cells).
  float cellPx = mix(1.5, 6.0, u_progress);
  vec2 cells = u_resolution / cellPx;
  vec2 px = floor(uv * cells) / cells;
  vec2 fitPix = (px - 0.5) * (cR / iR) / scale + 0.5;
  vec3 col = texture2D(u_image, fitPix).rgb;
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  float threshold = bayer4(floor(uv * u_resolution / cellPx));
  float bit = step(threshold, lum);
  vec3 a = vec3(0.05, 0.06, 0.09);
  vec3 b = vec3(1.0, 0.18, 0.39); // brand pink
  gl_FragColor = vec4(mix(a, b, bit), 1.0);
}
`

export function LabTierEDitherShader({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [progress, setProgress] = useState(0.4)
  const img = useDecodedImage(SAMPLE_IMG)
  useShaderCanvas(ref, {
    frag: FRAG_DITHER,
    pointer: { x: 0, y: 0 },
    progress,
    image: img,
    reducedMotion,
  })

  return (
    <div className="space-y-3">
      <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-ui-border-base bg-black">
        <canvas ref={ref} className="block h-full w-full" />
      </div>
      <label className="flex flex-wrap items-center gap-3 text-xs text-ui-fg-muted">
        Cell size
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={progress}
          onChange={(e) => setProgress(parseFloat(e.target.value))}
          className="h-1 w-48 accent-[#FF2E63]"
        />
        <span className="tabular-nums text-ui-fg-base">{progress.toFixed(2)}</span>
      </label>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 5. Liquid metal (raymarched 2D SDF metaballs)                              */
/* -------------------------------------------------------------------------- */

const FRAG_METAL = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float metaball(vec2 p, vec2 c, float r) {
  return r / (length(p - c) + 0.0001);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv;
  p.x *= u_resolution.x / u_resolution.y;
  vec2 m = u_mouse;
  m.x *= u_resolution.x / u_resolution.y;

  float t = u_time * 0.6;
  float v = 0.0;
  v += metaball(p, vec2(0.5 + 0.25 * cos(t), 0.5 + 0.18 * sin(t * 1.1)), 0.13);
  v += metaball(p, vec2(0.85 + 0.12 * sin(t * 0.9), 0.45 + 0.2 * cos(t * 1.4)), 0.10);
  v += metaball(p, vec2(0.25 + 0.18 * cos(t * 0.8), 0.7 + 0.16 * sin(t * 1.2)), 0.11);
  v += metaball(p, m, 0.16);

  float surface = smoothstep(2.0, 2.2, v);
  float spec = smoothstep(2.7, 3.4, v);
  vec3 base = mix(vec3(0.06, 0.07, 0.12), vec3(0.92, 0.18, 0.39), surface);
  base += spec * 0.7;
  // chrome streaks
  float streak = sin((p.y + sin(p.x * 4.0 + t)) * 18.0) * 0.05;
  base += streak * surface;
  gl_FragColor = vec4(base, 1.0);
}
`

export function LabTierELiquidMetal({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { pointer, onPointerMove, setPointer } = usePointerNorm()
  useShaderCanvas(ref, { frag: FRAG_METAL, pointer, reducedMotion })

  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-ui-border-base bg-black"
      onPointerMove={reducedMotion ? undefined : onPointerMove}
      onPointerLeave={() => setPointer({ x: 0.5, y: 0.5 })}
    >
      <canvas ref={ref} className="block h-full w-full" />
      <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/55 px-2 py-1 text-xs text-white">
        SDF metaballs in a single fragment shader — no model, no library.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 6. Twisted-wave card hover                                                 */
/* -------------------------------------------------------------------------- */

const FRAG_TWIST = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_progress; // hover 0..1
uniform sampler2D u_image;
uniform vec2 u_image_resolution;

void main() {
  vec2 uv = v_uv;
  vec2 cR = u_resolution / max(u_resolution.x, u_resolution.y);
  vec2 iR = u_image_resolution / max(u_image_resolution.x, u_image_resolution.y);
  float scale = max(cR.x / iR.x, cR.y / iR.y);
  vec2 fit = (uv - 0.5) * (cR / iR) / scale + 0.5;

  float wave = sin((uv.x * 8.0) + u_time * 1.4) * 0.018 * u_progress;
  float radial = distance(uv, u_mouse);
  vec2 d = vec2(0.0, wave) + (uv - u_mouse) * smoothstep(0.0, 0.6, radial) * 0.04 * u_progress;
  vec3 col = texture2D(u_image, fit + d).rgb;
  float vignette = smoothstep(0.95, 0.45, distance(uv, vec2(0.5)));
  col *= 0.78 + 0.22 * vignette;
  gl_FragColor = vec4(col, 1.0);
}
`

export function LabTierETwistedWaveCard({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { pointer, onPointerMove, setPointer } = usePointerNorm()
  const [hover, setHover] = useState(0)
  const img = useDecodedImage(SAMPLE_IMG)

  useShaderCanvas(ref, {
    frag: FRAG_TWIST,
    pointer,
    progress: hover,
    image: img,
    reducedMotion,
  })

  const animateHover = useCallback(
    (target: number) => {
      if (reducedMotion) {
        setHover(0)
        return
      }
      gsap.killTweensOf(setHover)
      const o = { p: hover }
      gsap.to(o, {
        p: target,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: () => setHover(o.p),
      })
    },
    [hover, reducedMotion]
  )

  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-ui-border-base bg-black"
      onPointerEnter={() => animateHover(1)}
      onPointerLeave={() => {
        animateHover(0)
        setPointer({ x: 0.5, y: 0.5 })
      }}
      onPointerMove={reducedMotion ? undefined : onPointerMove}
    >
      <canvas ref={ref} className="block h-full w-full" />
      <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/55 px-2 py-1 text-xs text-white">
        Hover — sine wave + radial pull crossfade in via <code>u_progress</code>.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 7. Hero text WebGL distortion                                              */
/* -------------------------------------------------------------------------- */

function useTextTexture(text: string, reducedMotion: boolean) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    const c = document.createElement("canvas")
    c.width = 1024
    c.height = 384
    const ctx = c.getContext("2d")
    if (!ctx) {
      return
    }
    ctx.fillStyle = "#08090c"
    ctx.fillRect(0, 0, c.width, c.height)
    const grad = ctx.createLinearGradient(0, 0, c.width, 0)
    grad.addColorStop(0, "#ffffff")
    grad.addColorStop(1, "#FF8FB3")
    ctx.fillStyle = grad
    ctx.font = "900 200px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, c.width / 2, c.height / 2)
    const i = new Image()
    i.src = c.toDataURL()
    i.onload = () => setImg(i)
  }, [text])
  void reducedMotion
  return img
}

const FRAG_TEXT = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_image;
uniform vec2 u_image_resolution;

void main() {
  vec2 uv = v_uv;
  vec2 cR = u_resolution / max(u_resolution.x, u_resolution.y);
  vec2 iR = u_image_resolution / max(u_image_resolution.x, u_image_resolution.y);
  float scale = max(cR.x / iR.x, cR.y / iR.y);
  vec2 fit = (uv - 0.5) * (cR / iR) / scale + 0.5;

  float r = distance(uv, u_mouse);
  float bend = smoothstep(0.4, 0.0, r) * 0.05;
  vec2 d = (uv - u_mouse);
  fit += d * bend + vec2(sin(uv.y * 20.0 + u_time) * 0.003, 0.0);

  vec3 col = texture2D(u_image, fit).rgb;
  // outline glow
  float edge = smoothstep(0.18, 0.0, r);
  col += vec3(1.0, 0.18, 0.39) * edge * 0.18;
  gl_FragColor = vec4(col, 1.0);
}
`

export function LabTierEHeroTextDistortion({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { pointer, onPointerMove, setPointer } = usePointerNorm()
  const tex = useTextTexture("SC PRINTS", reducedMotion)
  useShaderCanvas(ref, { frag: FRAG_TEXT, pointer, image: tex, reducedMotion })

  return (
    <div
      className="relative aspect-[8/3] w-full overflow-hidden rounded-xl border border-ui-border-base bg-black"
      onPointerMove={reducedMotion ? undefined : onPointerMove}
      onPointerLeave={() => setPointer({ x: 0.5, y: 0.5 })}
    >
      <canvas ref={ref} className="block h-full w-full" />
      <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/55 px-2 py-1 text-xs text-white">
        Headline → 2D canvas → texture → fragment displacement. Pointer-driven.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 8. Radial flow noise (vanilla WebGL alt to OGL)                            */
/* -------------------------------------------------------------------------- */

const FRAG_FLOW = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv;
  p.x *= u_resolution.x / u_resolution.y;
  vec2 m = u_mouse;
  m.x *= u_resolution.x / u_resolution.y;
  vec2 d = p - m;
  float a = atan(d.y, d.x);
  float r = length(d);
  float n = noise(vec2(a * 3.0 + u_time * 0.4, r * 6.0 - u_time * 0.5));
  float flow = smoothstep(0.0, 0.65, n) * smoothstep(0.85, 0.0, r);
  vec3 base = vec3(0.04, 0.05, 0.08);
  vec3 hi = mix(vec3(1.0, 0.18, 0.39), vec3(0.42, 0.32, 0.96), n);
  gl_FragColor = vec4(mix(base, hi, flow), 1.0);
}
`

export function LabTierERadialFlow({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { pointer, onPointerMove, setPointer } = usePointerNorm()
  useShaderCanvas(ref, { frag: FRAG_FLOW, pointer, reducedMotion })

  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-ui-border-base bg-black"
      onPointerMove={reducedMotion ? undefined : onPointerMove}
      onPointerLeave={() => setPointer({ x: 0.5, y: 0.5 })}
    >
      <canvas ref={ref} className="block h-full w-full" />
      <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/55 px-2 py-1 text-xs text-white">
        Polar-coord value-noise around the cursor — pure GLSL, ~50 lines, no Three.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 9. Smooth-scroll bridge (RAF lerp) — the pattern Lenis automates           */
/* -------------------------------------------------------------------------- */

export function LabTierESmoothScrollBridge({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [smooth, setSmooth] = useState(true)
  const targetRef = useRef(0)
  const currentRef = useRef(0)

  useEffect(() => {
    const el = scrollerRef.current
    const track = trackRef.current
    if (!el || !track) {
      return
    }

    let raf = 0
    const onScroll = () => {
      targetRef.current = el.scrollTop
    }
    el.addEventListener("scroll", onScroll, { passive: true })

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const ease = reducedMotion || !smooth ? 1 : 0.08
      currentRef.current += (targetRef.current - currentRef.current) * ease
      const max = el.scrollHeight - el.clientHeight
      const p = max > 0 ? currentRef.current / max : 0
      setProgress(p)
      track.style.transform = `translate3d(0, ${-currentRef.current}px, 0)`
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("scroll", onScroll)
    }
  }, [reducedMotion, smooth])

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-xs text-ui-fg-muted">
        <input
          type="checkbox"
          checked={smooth}
          onChange={(e) => setSmooth(e.target.checked)}
          disabled={reducedMotion}
        />
        Smooth (RAF lerp) {reducedMotion ? "— off (reduced motion)" : ""}
      </label>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div
          ref={scrollerRef}
          className="relative h-[280px] w-full overflow-y-auto rounded-xl border border-ui-border-base bg-ui-bg-subtle"
        >
          <div className="pointer-events-none">
            <div ref={trackRef} className="will-change-transform">
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className="border-b border-ui-border-base/60 px-4 py-4 text-sm text-ui-fg-base"
                >
                  Scroll-driven row {i + 1} — every section consumes the same
                  smoothed offset; this is the bridge Lenis automates.
                </div>
              ))}
            </div>
          </div>
          <div className="sticky bottom-0 left-0 right-0 h-1 bg-ui-border-base">
            <div
              className="h-full bg-[#FF2E63]"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
        <div className="flex w-32 flex-col items-stretch justify-center rounded-xl border border-ui-border-base bg-ui-bg-base p-3 text-center text-xs">
          <p className="text-ui-fg-muted">progress</p>
          <p className="mt-1 tabular-nums text-lg font-semibold text-ui-fg-base">
            {(progress * 100).toFixed(1)}%
          </p>
          <p className="mt-3 text-[10px] text-ui-fg-subtle">
            Single source of truth — drives any animation downstream.
          </p>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 10. Scroll-velocity skew                                                   */
/* -------------------------------------------------------------------------- */

export function LabTierEScrollVelocitySkew({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const lastY = useRef(0)
  const lastT = useRef(performance.now())
  const skewRef = useRef(0)
  const id = useId()

  useEffect(() => {
    const el = scrollerRef.current
    const tr = trackRef.current
    if (!el || !tr) {
      return
    }
    let raf = 0
    const onScroll = () => {
      const now = performance.now()
      const dt = Math.max(1, now - lastT.current)
      const dy = el.scrollTop - lastY.current
      lastT.current = now
      lastY.current = el.scrollTop
      const vel = Math.max(-15, Math.min(15, dy / (dt / 16)))
      skewRef.current = reducedMotion ? 0 : vel
    }
    el.addEventListener("scroll", onScroll, { passive: true })

    const tick = () => {
      raf = requestAnimationFrame(tick)
      skewRef.current *= 0.85
      const s = Math.max(-12, Math.min(12, skewRef.current))
      tr.style.transform = `skewY(${s.toFixed(2)}deg)`
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("scroll", onScroll)
    }
  }, [reducedMotion])

  const lines = useMemo(
    () => [
      "Motion that guides attention",
      "Without stealing it",
      "Scroll velocity → CSS skew",
      "Decays back to rest at ~85% per frame",
      "Lenis pairs perfectly with this pattern",
      "Try a fast flick, then settle",
      "Reduced motion locks skew at 0",
      "Same RAF you saw in the bridge above",
    ],
    []
  )

  return (
    <div
      ref={scrollerRef}
      id={id}
      className="relative h-[260px] w-full overflow-y-auto rounded-xl border border-ui-border-base bg-ui-bg-subtle"
    >
      <div ref={trackRef} className="origin-center will-change-transform">
        {lines.concat(lines).map((l, i) => (
          <p
            key={`${l}-${i}`}
            className="border-b border-ui-border-base/50 px-4 py-6 text-2xl font-semibold tracking-tight text-ui-fg-base"
          >
            {l}
          </p>
        ))}
      </div>
    </div>
  )
}
