"use client"

import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  CUSTOMER_MILESTONES,
  CUSTOMER_MILESTONE_LABEL,
  type CustomerMilestone,
} from "@modules/order/lib/production-stage"

/* -------------------------------------------------------------------------- */
/* 1. Falling-chips physics (pure RAF AABB + gravity)                         */
/* -------------------------------------------------------------------------- */

type Chip = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
}

const CHIP_COLORS = ["#FF2E63", "#6366f1", "#f59e0b", "#10b981", "#a855f7", "#06b6d4"]

export function LabTierGFallingChips({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chipsRef = useRef<Chip[]>([])
  const idRef = useRef(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) {
      return
    }
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      return
    }

    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const r = wrap.getBoundingClientRect()
      canvas.width = Math.floor(r.width * dpr)
      canvas.height = Math.floor(r.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const step = () => {
      raf = requestAnimationFrame(step)
      const r = wrap.getBoundingClientRect()
      const w = r.width
      const h = r.height
      ctx.clearRect(0, 0, w, h)

      const chips = chipsRef.current
      // integrate
      for (const c of chips) {
        c.vy += reducedMotion ? 0 : 0.4
        c.vx *= 0.995
        c.x += c.vx
        c.y += c.vy
        // walls
        if (c.x - c.r < 0) {
          c.x = c.r
          c.vx *= -0.6
        } else if (c.x + c.r > w) {
          c.x = w - c.r
          c.vx *= -0.6
        }
        if (c.y + c.r > h) {
          c.y = h - c.r
          c.vy *= -0.45
          c.vx *= 0.85
          if (Math.abs(c.vy) < 0.6) {
            c.vy = 0
          }
        }
      }
      // pairwise resolve (n is small, cap at ~120)
      for (let i = 0; i < chips.length; i++) {
        for (let j = i + 1; j < chips.length; j++) {
          const a = chips[i]
          const b = chips[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dist = Math.hypot(dx, dy) || 0.0001
          const min = a.r + b.r
          if (dist < min) {
            const overlap = (min - dist) / 2
            const nx = dx / dist
            const ny = dy / dist
            a.x -= nx * overlap
            a.y -= ny * overlap
            b.x += nx * overlap
            b.y += ny * overlap
            const rvx = b.vx - a.vx
            const rvy = b.vy - a.vy
            const sep = rvx * nx + rvy * ny
            if (sep < 0) {
              const e = 0.4
              const imp = -(1 + e) * sep * 0.5
              a.vx -= imp * nx
              a.vy -= imp * ny
              b.vx += imp * nx
              b.vy += imp * ny
            }
          }
        }
      }
      // draw
      for (const c of chips) {
        ctx.beginPath()
        ctx.fillStyle = c.color
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = "rgba(0,0,0,0.18)"
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }
    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [reducedMotion])

  const drop = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const wrap = wrapRef.current
      if (!wrap) {
        return
      }
      const r = wrap.getBoundingClientRect()
      const x = e.clientX - r.left
      const list = chipsRef.current
      if (list.length > 120) {
        list.splice(0, list.length - 120)
      }
      list.push({
        id: idRef.current++,
        x,
        y: 10,
        vx: (Math.random() - 0.5) * 4,
        vy: 1,
        r: 12 + Math.random() * 8,
        color: CHIP_COLORS[Math.floor(Math.random() * CHIP_COLORS.length)],
      })
      setCount(list.length)
    },
    []
  )

  const reset = () => {
    chipsRef.current = []
    setCount(0)
  }

  if (reducedMotion) {
    return (
      <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-6 text-sm text-ui-fg-muted">
        Physics simulation disabled when reduced motion is preferred.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        ref={wrapRef}
        className="relative h-[280px] w-full cursor-crosshair overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-subtle"
        onPointerDown={drop}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/55 px-2 py-1 text-xs text-white">
          Click anywhere to drop chips. Pure RAF AABB + impulse — no Matter.js.
        </p>
      </div>
      <div className="flex items-center justify-between text-xs text-ui-fg-muted">
        <span>
          chips: <span className="tabular-nums text-ui-fg-base">{count}</span>{" "}
          / 120
        </span>
        <button
          type="button"
          className="rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1 text-ui-fg-base hover:bg-ui-bg-subtle"
          onClick={reset}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 2. Spring rope (verlet chain)                                              */
/* -------------------------------------------------------------------------- */

type Node = { x: number; y: number; px: number; py: number }

export function LabTierGRopeChain({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const target = useRef({ x: 0, y: 0, set: false })

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) {
      return
    }
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      return
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      const r = wrap.getBoundingClientRect()
      canvas.width = Math.floor(r.width * dpr)
      canvas.height = Math.floor(r.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    // 12 nodes, segment 22px
    const segLen = 22
    const N = 12
    const nodes: Node[] = []
    const startR = wrap.getBoundingClientRect()
    for (let i = 0; i < N; i++) {
      const x = startR.width / 2
      const y = 30 + i * segLen
      nodes.push({ x, y, px: x, py: y })
    }

    let raf = 0
    const step = () => {
      raf = requestAnimationFrame(step)
      const r = wrap.getBoundingClientRect()
      ctx.clearRect(0, 0, r.width, r.height)

      // anchor head to pointer
      if (target.current.set && !reducedMotion) {
        nodes[0].x = target.current.x
        nodes[0].y = target.current.y
      }

      // verlet integrate (skip head)
      for (let i = 1; i < N; i++) {
        const n = nodes[i]
        const vx = (n.x - n.px) * 0.985
        const vy = (n.y - n.py) * 0.985
        n.px = n.x
        n.py = n.y
        n.x += vx
        n.y += vy + (reducedMotion ? 0 : 0.6)
      }

      // constraint passes
      for (let pass = 0; pass < 6; pass++) {
        for (let i = 0; i < N - 1; i++) {
          const a = nodes[i]
          const b = nodes[i + 1]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d = Math.hypot(dx, dy) || 0.0001
          const diff = (d - segLen) / d
          if (i > 0) {
            a.x += dx * 0.5 * diff
            a.y += dy * 0.5 * diff
            b.x -= dx * 0.5 * diff
            b.y -= dy * 0.5 * diff
          } else {
            // head locked
            b.x -= dx * diff
            b.y -= dy * diff
          }
        }
      }

      // draw
      ctx.lineWidth = 4
      ctx.strokeStyle = "#FF2E63"
      ctx.beginPath()
      ctx.moveTo(nodes[0].x, nodes[0].y)
      for (let i = 1; i < N; i++) {
        ctx.lineTo(nodes[i].x, nodes[i].y)
      }
      ctx.stroke()
      // bead
      const tail = nodes[N - 1]
      ctx.beginPath()
      ctx.fillStyle = "#FF2E63"
      ctx.arc(tail.x, tail.y, 8, 0, Math.PI * 2)
      ctx.fill()
    }
    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [reducedMotion])

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current
    if (!wrap) {
      return
    }
    const r = wrap.getBoundingClientRect()
    target.current = { x: e.clientX - r.left, y: e.clientY - r.top, set: true }
  }

  return (
    <div
      ref={wrapRef}
      className="relative h-[300px] w-full overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-subtle"
      onPointerMove={move}
      onPointerLeave={() => (target.current.set = false)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/55 px-2 py-1 text-xs text-white">
        Move pointer — verlet chain follows. Pure JS, no library.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 3. FLIP layout swap (manual First-Last-Invert-Play)                        */
/* -------------------------------------------------------------------------- */

const FLIP_ITEMS = ["Hoodie", "Tee", "Cap", "Tote", "Sticker", "Mug"]

export function LabTierGFlipLayoutSwap({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const [layout, setLayout] = useState<"grid" | "list">("grid")
  const refs = useRef<Map<string, HTMLDivElement>>(new Map())
  const firstRectsRef = useRef<Map<string, DOMRect>>(new Map())

  // Capture rects before layout flip
  const capture = useCallback(() => {
    const m = new Map<string, DOMRect>()
    refs.current.forEach((el, id) => {
      m.set(id, el.getBoundingClientRect())
    })
    firstRectsRef.current = m
  }, [])

  // After layout flips, animate from first→last
  useEffect(() => {
    if (reducedMotion) {
      return
    }
    const first = firstRectsRef.current
    if (!first.size) {
      return
    }
    refs.current.forEach((el, id) => {
      const f = first.get(id)
      const l = el.getBoundingClientRect()
      if (!f) {
        return
      }
      const dx = f.left - l.left
      const dy = f.top - l.top
      const sx = f.width / l.width
      const sy = f.height / l.height
      el.animate(
        [
          {
            transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
            opacity: 0.85,
          },
          { transform: "translate(0,0) scale(1,1)", opacity: 1 },
        ],
        { duration: 420, easing: "cubic-bezier(.2,.7,.2,1)" }
      )
    })
  }, [layout, reducedMotion])

  const toggle = () => {
    capture()
    setLayout((l) => (l === "grid" ? "list" : "grid"))
  }

  const setRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      refs.current.set(id, el)
    } else {
      refs.current.delete(id)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={toggle}
        className="rounded-full border border-ui-border-base bg-ui-bg-base px-4 py-2 text-sm font-medium text-ui-fg-base hover:bg-ui-bg-subtle"
      >
        Swap to {layout === "grid" ? "list" : "grid"}
      </button>
      <div
        className={
          layout === "grid"
            ? "grid grid-cols-3 gap-3 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-3"
            : "flex flex-col gap-2 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-3"
        }
      >
        {FLIP_ITEMS.map((it) => (
          <div
            key={it}
            ref={setRef(it)}
            className={
              layout === "grid"
                ? "flex h-24 items-center justify-center rounded-lg bg-[#FF2E63]/10 text-sm font-medium text-ui-fg-base"
                : "flex items-center gap-3 rounded-lg bg-[#FF2E63]/10 px-3 py-2 text-sm text-ui-fg-base"
            }
          >
            <span className="inline-block h-3 w-3 rounded-full bg-[#FF2E63]" />
            {it}
          </div>
        ))}
      </div>
      <p className="text-xs text-ui-fg-muted">
        FLIP technique: capture rects → change layout → invert with WAAPI. No
        GSAP Flip plugin, no View Transitions API.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 4. CSS 3D book / page flip                                                 */
/* -------------------------------------------------------------------------- */

const BOOK_PAGES = [
  { title: "Cover", body: "SC Prints — 2026 Catalog (lab mock)" },
  { title: "Hoodies", body: "Heavyweight, mid-weight, zip — 8 colorways." },
  { title: "Tees", body: "Premium ringspun cotton, 5 weights." },
  { title: "Caps", body: "5-panel, trucker, dad — 32 stock options." },
  { title: "Stickers", body: "Holographic, kiss-cut, weatherproof." },
  { title: "Back", body: "Get a quote — info@scprints.com.au" },
]

export function LabTierGBookFlip({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const [idx, setIdx] = useState(0)

  return (
    <div className="space-y-3">
      <div
        className="relative mx-auto"
        style={{ perspective: 1400, width: 320, height: 220 }}
      >
        <div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {BOOK_PAGES.map((p, i) => {
            const turned = i < idx
            const rot = turned ? -170 : 0
            return (
              <div
                key={p.title}
                aria-hidden={!turned && i !== idx}
                className="absolute left-0 top-0 h-full w-full origin-left rounded-r-md border border-ui-border-base bg-ui-bg-base p-5 shadow-md"
                style={{
                  transform: `rotateY(${reducedMotion ? (turned ? -180 : 0) : rot}deg)`,
                  transition: reducedMotion
                    ? "none"
                    : "transform 700ms cubic-bezier(.2,.7,.2,1)",
                  zIndex: BOOK_PAGES.length - i,
                  backfaceVisibility: "hidden",
                }}
              >
                <h3 className="text-lg font-semibold text-ui-fg-base">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-ui-fg-muted">{p.body}</p>
                <p className="absolute bottom-3 right-4 text-xs tabular-nums text-ui-fg-subtle">
                  {i + 1} / {BOOK_PAGES.length}
                </p>
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1 text-sm text-ui-fg-base disabled:opacity-50"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => setIdx((i) => Math.min(BOOK_PAGES.length - 1, i + 1))}
          disabled={idx === BOOK_PAGES.length - 1}
          className="rounded-full border border-ui-border-base bg-[#FF2E63] px-3 py-1 text-sm text-white disabled:opacity-50"
        >
          Next page
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 5. Tinder-style swipe stack                                                */
/* -------------------------------------------------------------------------- */

type SwipeCard = { id: number; tag: string; bg: string }

const STACK_SEED: SwipeCard[] = [
  { id: 1, tag: "Hoodie — Stone", bg: "#9ca3af" },
  { id: 2, tag: "Tee — Pink", bg: "#FF2E63" },
  { id: 3, tag: "Cap — Olive", bg: "#65a30d" },
  { id: 4, tag: "Tote — Sand", bg: "#fbbf24" },
  { id: 5, tag: "Sticker — Holo", bg: "#6366f1" },
]

function SwipeCardEl({
  card,
  z,
  onLeave,
  reducedMotion,
}: {
  card: SwipeCard
  z: number
  onLeave: (dir: "left" | "right") => void
  reducedMotion: boolean
}) {
  const x = useMotionValue(0)
  const rot = useTransform(x, [-200, 200], [-18, 18])
  const opacity = useTransform(x, [-220, 0, 220], [0, 1, 0])

  return (
    <motion.div
      className="absolute inset-0 select-none rounded-2xl shadow-xl"
      style={{
        background: card.bg,
        x: reducedMotion ? 0 : x,
        rotate: reducedMotion ? 0 : rot,
        opacity: reducedMotion ? 1 : opacity,
        zIndex: z,
        transform: `scale(${1 - z * 0.04}) translateY(${z * 8}px)`,
      }}
      drag={reducedMotion ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 140) {
          onLeave("right")
        } else if (info.offset.x < -140) {
          onLeave("left")
        }
      }}
    >
      <div className="flex h-full w-full items-end p-5 text-white">
        <div>
          <p className="text-xs uppercase tracking-wider opacity-80">
            Swipe • {card.id}
          </p>
          <p className="mt-1 text-xl font-semibold">{card.tag}</p>
        </div>
      </div>
    </motion.div>
  )
}

export function LabTierGCardSwipeStack({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const [stack, setStack] = useState(STACK_SEED)

  const dismiss = (dir: "left" | "right") => {
    setStack((s) => s.slice(1).concat(s[0] ? [{ ...s[0], id: s[0].id + 100 }] : []))
    void dir
  }

  return (
    <div className="space-y-3">
      <div className="relative mx-auto h-[260px] w-[260px]">
        <AnimatePresence>
          {stack.slice(0, 3).map((c, i) => (
            <SwipeCardEl
              key={c.id}
              card={c}
              z={i}
              onLeave={dismiss}
              reducedMotion={reducedMotion}
            />
          ))}
        </AnimatePresence>
      </div>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => dismiss("left")}
          className="rounded-full border border-ui-border-base bg-ui-bg-base px-4 py-2 text-sm text-ui-fg-base"
        >
          Pass
        </button>
        <button
          type="button"
          onClick={() => dismiss("right")}
          className="rounded-full bg-[#FF2E63] px-4 py-2 text-sm font-medium text-white"
        >
          Like
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 6. Sticky stacking cards on scroll                                         */
/* -------------------------------------------------------------------------- */

const STACK_CARDS = [
  { title: "Premium fabric", color: "#FF2E63" },
  { title: "Eco inks", color: "#10b981" },
  { title: "Local print", color: "#6366f1" },
  { title: "Bulk pricing", color: "#f59e0b" },
  { title: "Free quote", color: "#a855f7" },
]

export function LabTierGStickyStackCards({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="h-[420px] overflow-y-auto rounded-xl border border-ui-border-base bg-ui-bg-subtle">
        <div className="relative px-4 py-6">
          {STACK_CARDS.map((c, i) => (
            <div
              key={c.title}
              className="sticky"
              style={{
                top: `${20 + i * 18}px`,
                marginBottom: i === STACK_CARDS.length - 1 ? 0 : 24,
                zIndex: i,
              }}
            >
              <div
                className="rounded-2xl p-6 shadow-lg"
                style={{
                  background: c.color,
                  transform: reducedMotion ? "none" : "translateZ(0)",
                }}
              >
                <p className="text-xs font-medium uppercase tracking-wider text-white/80">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {c.title}
                </p>
                <p className="mt-2 text-sm text-white/80">
                  Each card sticks at a slightly higher offset, stacking as you
                  scroll. Pure CSS — `position: sticky`.
                </p>
              </div>
            </div>
          ))}
          <div className="h-32" />
        </div>
      </div>
      <p className="text-xs text-ui-fg-muted">
        Scroll inside the panel — cards stack at progressive top-offsets.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 7. Animated price digit roll                                               */
/* -------------------------------------------------------------------------- */

function Digit({
  value,
  reducedMotion,
}: {
  value: number
  reducedMotion: boolean
}) {
  return (
    <span
      className="relative inline-block h-[1.2em] w-[0.62em] overflow-hidden align-bottom tabular-nums"
      aria-hidden
    >
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        animate={{ y: -value * 100 + "%" }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 220, damping: 26 }
        }
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1.2em] leading-[1.2em]">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

export function LabTierGPriceDigitRoll({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const [price, setPrice] = useState(2999)

  const digits = useMemo(() => {
    const dollars = Math.floor(price / 100)
    const cents = price % 100
    return {
      dollars: String(dollars).padStart(2, "0").split("").map((d) => parseInt(d, 10)),
      cents: String(cents).padStart(2, "0").split("").map((d) => parseInt(d, 10)),
    }
  }, [price])

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-1 text-5xl font-semibold text-ui-fg-base">
        <span className="text-2xl text-ui-fg-muted">$</span>
        {digits.dollars.map((d, i) => (
          <Digit key={`d${i}`} value={d} reducedMotion={reducedMotion} />
        ))}
        <span className="text-3xl text-ui-fg-muted">.</span>
        {digits.cents.map((d, i) => (
          <Digit key={`c${i}`} value={d} reducedMotion={reducedMotion} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {[2999, 1499, 4999, 999, 12999].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPrice(p)}
            className={
              p === price
                ? "rounded-full bg-ui-fg-base px-3 py-1 text-xs font-medium text-ui-bg-base"
                : "rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1 text-xs text-ui-fg-base"
            }
          >
            ${(p / 100).toFixed(2)}
          </button>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 8. Garment color sweep (clip-path circle)                                  */
/* -------------------------------------------------------------------------- */

const GARMENT_COLORS = [
  { name: "Black", hex: "#0c0d10" },
  { name: "Stone", hex: "#9aa0a6" },
  { name: "Pink", hex: "#FF2E63" },
  { name: "Olive", hex: "#5e6b3a" },
  { name: "Cream", hex: "#efe9d5" },
]

export function LabTierGGarmentColorSweep({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const [color, setColor] = useState(GARMENT_COLORS[0])
  const [prev, setPrev] = useState(GARMENT_COLORS[0])
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const [sweepKey, setSweepKey] = useState(0)

  const pick = (c: (typeof GARMENT_COLORS)[number], e: React.MouseEvent) => {
    if (c.hex === color.hex) {
      return
    }
    const r = e.currentTarget.getBoundingClientRect()
    setOrigin({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    })
    setPrev(color)
    setColor(c)
    setSweepKey((k) => k + 1)
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[5/4] w-full overflow-hidden rounded-xl border border-ui-border-base">
        <div className="absolute inset-0" style={{ background: prev.hex }} />
        <motion.div
          key={sweepKey}
          className="absolute inset-0"
          style={{ background: color.hex }}
          initial={
            reducedMotion
              ? { clipPath: "circle(150% at 50% 50%)" }
              : { clipPath: `circle(0% at ${origin.x}% ${origin.y}%)` }
          }
          animate={{ clipPath: `circle(150% at ${origin.x}% ${origin.y}%)` }}
          transition={{ duration: reducedMotion ? 0 : 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          onAnimationComplete={() => setPrev(color)}
        />
        {/* SVG mockup */}
        <svg
          viewBox="0 0 200 160"
          className="absolute inset-0 h-full w-full mix-blend-multiply opacity-90"
          aria-hidden
        >
          <path
            d="M40 40 L70 25 L100 40 L130 25 L160 40 L155 130 L45 130 Z"
            fill="rgba(0,0,0,0.18)"
          />
          <path
            d="M70 25 Q100 50 130 25 L130 35 Q100 60 70 35 Z"
            fill="rgba(0,0,0,0.28)"
          />
          <text
            x="100"
            y="95"
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill="rgba(255,255,255,0.85)"
          >
            SC PRINTS
          </text>
        </svg>
        <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/55 px-2 py-1 text-xs text-white">
          Click a swatch — circular clip-path sweeps from the click point.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {GARMENT_COLORS.map((c) => (
          <button
            key={c.hex}
            type="button"
            onClick={(e) => pick(c, e)}
            className={
              c.hex === color.hex
                ? "flex items-center gap-2 rounded-full border-2 border-ui-fg-base bg-ui-bg-base px-3 py-1 text-xs font-medium"
                : "flex items-center gap-2 rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1 text-xs text-ui-fg-base"
            }
          >
            <span
              className="inline-block h-4 w-4 rounded-full border border-black/15"
              style={{ background: c.hex }}
            />
            {c.name}
          </button>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 9. Production-line crawler (SC-Prints-flavored)                            */
/* -------------------------------------------------------------------------- */

export function LabTierGProductionLineCrawler({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const stages = CUSTOMER_MILESTONES
  const [stageIdx, setStageIdx] = useState<number>(2)
  const trackRef = useRef<HTMLDivElement>(null)

  // auto-advance demo
  useEffect(() => {
    if (reducedMotion) {
      return
    }
    const t = setInterval(() => {
      setStageIdx((i) => (i + 1) % stages.length)
    }, 3200)
    return () => clearInterval(t)
  }, [reducedMotion, stages.length])

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-6">
        <div ref={trackRef} className="relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-ui-border-base" />
          <motion.div
            className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#FF2E63]"
            initial={false}
            animate={{
              width: `${(stageIdx / Math.max(1, stages.length - 1)) * 100}%`,
            }}
            transition={{ type: "spring", stiffness: 140, damping: 24 }}
          />
          <div className="relative flex justify-between">
            {stages.map((s: CustomerMilestone, i) => {
              const reached = i <= stageIdx
              return (
                <div key={s} className="flex flex-col items-center gap-2">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: i === stageIdx ? 1.18 : 1,
                      backgroundColor: reached ? "#FF2E63" : "#ffffff",
                      borderColor: reached ? "#FF2E63" : "#d1d5db",
                    }}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                    className="h-5 w-5 rounded-full border-2"
                  />
                  <span
                    className={
                      reached
                        ? "text-xs font-medium text-ui-fg-base"
                        : "text-xs text-ui-fg-muted"
                    }
                  >
                    {CUSTOMER_MILESTONE_LABEL[s]}
                  </span>
                </div>
              )
            })}
          </div>
          {/* crawler dot */}
          <motion.span
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={false}
            animate={{
              left: `${(stageIdx / Math.max(1, stages.length - 1)) * 100}%`,
            }}
            transition={{ type: "spring", stiffness: 140, damping: 22 }}
          >
            <span className="block h-3 w-3 rounded-full bg-[#FF2E63] shadow-[0_0_0_6px_rgba(255,46,99,0.18)]" />
          </motion.span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {stages.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStageIdx(i)}
            className={
              i === stageIdx
                ? "rounded-full bg-ui-fg-base px-3 py-1 text-xs font-medium text-ui-bg-base"
                : "rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1 text-xs text-ui-fg-base"
            }
          >
            {CUSTOMER_MILESTONE_LABEL[s]}
          </button>
        ))}
      </div>
      <p className="text-xs text-ui-fg-muted">
        Reads the canonical{" "}
        <code className="text-ui-fg-base">CUSTOMER_MILESTONES</code> from{" "}
        <code className="text-ui-fg-base">production-stage.ts</code>. Drop into{" "}
        <code className="text-ui-fg-base">/account/orders/details/&lt;id&gt;</code>{" "}
        if it tests well.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 10. Shipping truck along SVG path (offset-path)                            */
/* -------------------------------------------------------------------------- */

const TRUCK_PATH =
  "M 20 110 C 100 110, 100 30, 200 30 C 300 30, 300 130, 380 130 C 460 130, 460 60, 540 60"

export function LabTierGShippingTruckPath({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const [progress, setProgress] = useState(0.4)
  const [auto, setAuto] = useState(true)
  const pathRef = useRef<SVGPathElement>(null)
  const [pos, setPos] = useState({ x: 20, y: 110, angle: 0 })

  useEffect(() => {
    if (reducedMotion || !auto) {
      return
    }
    const t = setInterval(() => {
      setProgress((p) => {
        const next = p + 0.004
        return next > 1.02 ? 0 : next
      })
    }, 16)
    return () => clearInterval(t)
  }, [auto, reducedMotion])

  // sample point + tangent angle from the path
  useEffect(() => {
    const path = pathRef.current
    if (!path) {
      return
    }
    const total = path.getTotalLength()
    const clamped = Math.max(0, Math.min(1, progress))
    const len = clamped * total
    const p = path.getPointAtLength(len)
    const ahead = path.getPointAtLength(Math.min(total, len + 1))
    const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI
    setPos({ x: p.x, y: p.y, angle })
  }, [progress])

  return (
    <div className="space-y-3">
      <div className="relative w-full overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4">
        <svg viewBox="0 0 560 160" className="block h-auto w-full">
          {/* dashed grey road */}
          <path
            ref={pathRef}
            d={TRUCK_PATH}
            stroke="#cbd5e1"
            strokeWidth={3}
            strokeDasharray="6 8"
            fill="none"
          />
          {/* progress overlay (drawn-up) */}
          <path
            d={TRUCK_PATH}
            stroke="#FF2E63"
            strokeWidth={3}
            fill="none"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - progress}
            style={{ transition: "stroke-dashoffset 80ms linear" }}
          />
          <circle cx={20} cy={110} r={6} fill="#0c0d10" />
          <circle cx={540} cy={60} r={6} fill="#FF2E63" />
          <g
            transform={`translate(${pos.x} ${pos.y}) rotate(${pos.angle})`}
            style={{ transition: "transform 80ms linear" }}
          >
            <text
              x={0}
              y={0}
              dy="0.35em"
              textAnchor="middle"
              fontSize={26}
              transform={`rotate(${-pos.angle})`}
            >
              🚚
            </text>
          </g>
        </svg>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-ui-fg-muted">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={auto}
            onChange={(e) => setAuto(e.target.checked)}
            disabled={reducedMotion}
          />
          Auto-advance
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={progress}
          onChange={(e) => {
            setAuto(false)
            setProgress(parseFloat(e.target.value))
          }}
          className="h-1 w-48 accent-[#FF2E63]"
        />
        <span className="tabular-nums text-ui-fg-base">
          {(progress * 100).toFixed(0)}%
        </span>
      </div>
      <p className="text-xs text-ui-fg-muted">
        SVG <code className="text-ui-fg-base">getPointAtLength()</code> samples
        position + tangent angle from the path so the truck rides any curve and
        rotates naturally.
      </p>
    </div>
  )
}
