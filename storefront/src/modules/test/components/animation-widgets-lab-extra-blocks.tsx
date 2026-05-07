"use client"

import { AnimatePresence, LayoutGroup, motion, useMotionValue, useScroll, useSpring, useTransform, type Variants } from "framer-motion"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"

import ProductListingCard from "@modules/products/components/product-listing-card"
import type { ProductListingCardData } from "@modules/products/lib/product-listing-card-data"

const LAB_TILT_LISTING_CARD_DEMO: ProductListingCardData = {
  href: "/products/sample",
  title: "Storefront listing card",
  priceFromLine: "From A$0.00 * ex GST",
  priceHundredPlusLine: null,
  defaultImageUrl: null,
  swatches: [],
  totalSwatchCount: 0,
}

const DEMO_ITEMS = ["Tee", "Hoodie", "Cap", "Tote", "Sticker", "Mug"]

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
}

export function LabStaggeredReveal({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) {
    return (
      <ul className="grid grid-cols-2 gap-3 small:grid-cols-3">
        {DEMO_ITEMS.map((label) => (
          <li
            key={label}
            className="rounded-xl border border-ui-border-base bg-ui-bg-subtle px-4 py-6 text-center text-sm font-medium text-ui-fg-base"
          >
            {label}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <motion.ul
      className="grid grid-cols-2 gap-3 small:grid-cols-3"
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      {DEMO_ITEMS.map((label) => (
        <motion.li
          key={label}
          variants={staggerItem}
          className="rounded-xl border border-ui-border-base bg-ui-bg-subtle px-4 py-6 text-center text-sm font-medium text-ui-fg-base"
        >
          {label}
        </motion.li>
      ))}
    </motion.ul>
  )
}

export function LabAnimatedStat({ reducedMotion }: { reducedMotion: boolean }) {
  const target = 12_500
  const mv = useMotionValue(reducedMotion ? target : 0)
  const spring = useSpring(mv, { stiffness: 60, damping: 28 })
  const text = useTransform(spring, (v) => `${Math.round(v).toLocaleString("en-AU")}+`)

  const { ref, inView } = useInView({ threshold: 0.35, triggerOnce: true })

  useEffect(() => {
    if (!inView) {
      return
    }
    if (reducedMotion) {
      mv.set(target)
      return
    }
    mv.set(0)
    const id = window.requestAnimationFrame(() => mv.set(target))
    return () => window.cancelAnimationFrame(id)
  }, [inView, reducedMotion, mv, target])

  return (
    <div ref={ref} className="rounded-xl border border-ui-border-base bg-ui-bg-subtle px-6 py-8 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-ui-fg-muted">Orders fulfilled (demo)</p>
      <motion.p className="mt-2 text-4xl font-bold tabular-nums text-ui-fg-base">{text}</motion.p>
    </div>
  )
}

export function LabMarquee({ reducedMotion }: { reducedMotion: boolean }) {
  const phrase = (
    <span className="inline-flex gap-10 whitespace-nowrap px-4 text-sm font-medium text-ui-fg-base">
      <span>Free shipping over $99</span>
      <span>·</span>
      <span>New drops weekly</span>
      <span>·</span>
      <span>AfterPay available</span>
    </span>
  )

  return (
    <div className="overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-subtle py-3">
      {reducedMotion ? (
        <div className="flex justify-center">{phrase}</div>
      ) : (
        <motion.div
          className="flex w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          {phrase}
          {phrase}
        </motion.div>
      )}
    </div>
  )
}

export function LabSkeletonShimmer() {
  return (
    <div className="space-y-4">
      <div className="relative h-36 overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-base">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.35, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-2/3 rounded bg-ui-bg-subtle" />
        <div className="h-3 w-1/2 rounded bg-ui-bg-subtle" />
      </div>
      <p className="text-xs text-ui-fg-muted">Shimmer overlay + static bars (placeholder layout).</p>
    </div>
  )
}

export function LabSkeletonShimmerReduced({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) {
    return (
      <div className="space-y-4">
        <div className="h-36 rounded-xl border border-ui-border-base bg-ui-bg-subtle" />
        <div className="space-y-2">
          <div className="h-3 w-2/3 rounded bg-ui-bg-subtle" />
          <div className="h-3 w-1/2 rounded bg-ui-bg-subtle" />
        </div>
        <p className="text-xs text-ui-fg-muted">Reduced motion: no traveling highlight.</p>
      </div>
    )
  }
  return <LabSkeletonShimmer />
}

export function LabSvgStrokeDraw({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="flex justify-center rounded-xl border border-ui-border-base bg-ui-bg-subtle py-10">
      <svg width="120" height="120" viewBox="0 0 120 120" className="text-[#FF2E63]" aria-hidden>
        <motion.path
          d="M 30 62 L 52 84 L 90 36"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 1.2, ease: "easeInOut" }}
        />
      </svg>
    </div>
  )
}

export function LabProgressRing({ reducedMotion }: { reducedMotion: boolean }) {
  const r = 36
  const c = 2 * Math.PI * r
  const progress = 0.72
  const offset = c * (1 - progress)

  return (
    <div className="flex flex-wrap items-center gap-8">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" className="stroke-ui-border-base" strokeWidth="8" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          className="stroke-[#FF2E63]"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: reducedMotion ? offset : [c, offset] }}
          transition={reducedMotion ? { duration: 0 } : { duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <p className="max-w-xs text-sm text-ui-fg-muted">Demo ring at 72% — use for checkout steps or file upload.</p>
    </div>
  )
}

export function LabParallaxScrollBox({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end end"],
  })
  const y = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [0, -48])

  return (
    <div
      ref={ref}
      className="relative h-64 overflow-y-auto overflow-x-hidden rounded-xl border border-ui-border-base bg-ui-bg-base"
    >
      <motion.div style={{ y }} className="pointer-events-none absolute -left-8 right-0 top-0 h-40 opacity-40">
        <div className="h-full rounded-full bg-gradient-to-br from-[#FF2E63]/40 to-indigo-500/30 blur-2xl" />
      </motion.div>
      <div className="relative space-y-4 p-6">
        {Array.from({ length: 8 }, (_, i) => (
          <p key={i} className="text-sm text-ui-fg-muted">
            Scroll inside this box — background shape moves on a slower layer ({i + 1}).
          </p>
        ))}
      </div>
    </div>
  )
}

export function LabSpotlightGlow() {
  const [pos, setPos] = useState({ x: 50, y: 50 })

  return (
    <div
      className="relative h-56 overflow-hidden rounded-xl border border-ui-border-base bg-ui-fg-base"
      onPointerMove={(e) => {
        const b = e.currentTarget.getBoundingClientRect()
        setPos({
          x: ((e.clientX - b.left) / b.width) * 100,
          y: ((e.clientY - b.top) / b.height) * 100,
        })
      }}
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `radial-gradient(circle 120px at ${pos.x}% ${pos.y}%, rgba(255,46,99,0.45), transparent 55%)`,
        }}
      />
      <p className="relative z-[1] flex h-full items-center justify-center px-6 text-center text-sm text-ui-bg-base">
        Move the pointer — soft spotlight follows (no custom cursor needed).
      </p>
    </div>
  )
}

type Ripple = { x: number; y: number; id: number }

export function LabRippleButton() {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const nextId = useRef(0)

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const id = nextId.current++
    setRipples((prev) => [...prev, { id, x: e.clientX - r.left, y: e.clientY - r.top }])
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((x) => x.id !== id))
    }, 650)
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onPointerDown={onPointerDown}
        className="relative overflow-hidden rounded-full bg-[#FF2E63] px-6 py-2.5 text-sm font-medium text-[#EEEEEE]"
      >
        Tap for ripple
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          <AnimatePresence>
            {ripples.map((rip) => (
              <motion.span
                key={rip.id}
                className="absolute rounded-full bg-white/35"
                style={{ left: rip.x, top: rip.y, width: 12, height: 12, marginLeft: -6, marginTop: -6 }}
                initial={{ scale: 0.2, opacity: 0.9 }}
                animate={{ scale: 14, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
              />
            ))}
          </AnimatePresence>
        </span>
      </button>
    </div>
  )
}

export function LabTiltCard({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  const onMove = (e: React.PointerEvent) => {
    if (reducedMotion || !ref.current) {
      return
    }
    const b = ref.current.getBoundingClientRect()
    const px = (e.clientX - b.left) / b.width - 0.5
    const py = (e.clientY - b.top) / b.height - 0.5
    setRotate({ x: py * -12, y: px * 14 })
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-4 small:flex-row small:items-start small:flex-wrap">
      <div className="flex w-full max-w-xs flex-col items-stretch gap-2">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-ui-fg-muted">
          Lab tilt (spring)
        </p>
        <div style={{ perspective: 800 }}>
          <motion.div
            ref={ref}
            onPointerMove={onMove}
            onPointerLeave={() => setRotate({ x: 0, y: 0 })}
            animate={{ rotateX: rotate.x, rotateY: rotate.y }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="w-full max-w-xs rounded-2xl border border-ui-border-base bg-ui-bg-subtle p-6 shadow-lg"
            style={{ transformStyle: "preserve-3d" }}
          >
            <p className="text-sm font-semibold text-ui-fg-base">Product tile</p>
            <p className="mt-2 text-xs text-ui-fg-muted">Hover and move the pointer — subtle 3D tilt.</p>
          </motion.div>
        </div>
      </div>
      <div className="flex w-full max-w-xs flex-col items-stretch gap-2">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-ui-fg-muted">
          Legacy bounce (listing)
        </p>
        <ProductListingCard
          interaction="bounce"
          className="w-full max-w-xs"
          {...LAB_TILT_LISTING_CARD_DEMO}
        />
      </div>
      <div className="flex w-full max-w-xs flex-col items-stretch gap-2">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-ui-fg-muted">
          Default listing (tilt + lift)
        </p>
        <ProductListingCard className="w-full max-w-xs" {...LAB_TILT_LISTING_CARD_DEMO} />
      </div>
    </div>
  )
}

const FAQ = [
  { q: "Turnaround time?", a: "Typical decorated orders ship in 5–10 business days." },
  { q: "Minimums?", a: "Varies by product — check each listing for MOQ." },
]

export function LabAccordion({ reducedMotion }: { reducedMotion: boolean }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="divide-y divide-ui-border-base rounded-xl border border-ui-border-base">
      {FAQ.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.q} className="bg-ui-bg-subtle">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-ui-fg-base"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              {item.q}
              <span className="text-ui-fg-muted">{isOpen ? "−" : "+"}</span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-3 text-sm text-ui-fg-muted">{item.a}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

const TAB_LABELS = ["Details", "Sizing", "Care"]

export function LabTabsUnderline() {
  const [tab, setTab] = useState(0)

  return (
    <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4">
      <LayoutGroup id="lab-tabs">
        <div className="relative flex gap-1 border-b border-ui-border-base">
          {TAB_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={tab === i}
              className="relative z-[1] px-4 py-2 pb-3 text-sm font-medium text-ui-fg-muted data-[active=true]:text-ui-fg-base"
              data-active={tab === i}
              onClick={() => setTab(i)}
            >
              {label}
              {tab === i ? (
                <motion.span
                  layoutId="lab-tab-underline"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#FF2E63]"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              ) : null}
            </button>
          ))}
        </div>
      </LayoutGroup>
      <p className="mt-4 text-sm text-ui-fg-muted">
        {tab === 0 ? "Fabric weight, print method, and artwork notes." : null}
        {tab === 1 ? "Unisex fit — see size chart on the product page." : null}
        {tab === 2 ? "Cold wash inside out; tumble low; no dry-clean on DTF." : null}
      </p>
    </div>
  )
}

export function LabScrollSnapStrip() {
  return (
    <div className="-mx-4 px-4">
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {DEMO_ITEMS.map((label) => (
          <div
            key={label}
            className="h-24 w-40 flex-shrink-0 snap-center rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4 text-sm font-medium text-ui-fg-base"
          >
            {label}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-ui-fg-muted">Horizontal scroll with snap — flick on touch.</p>
    </div>
  )
}

export function LabDocumentScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <div className="space-y-3">
      <p className="text-sm text-ui-fg-muted">
        Fixed to the viewport top while you scroll this page (pink bar). Resize the window and scroll the lab to see it move.
      </p>
      <motion.div
        className="fixed left-0 top-0 z-[150] h-1 origin-left bg-[#FF2E63]"
        style={{ scaleX }}
      />
    </div>
  )
}

export function LabStepper() {
  const [step, setStep] = useState(1)

  return (
    <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-6">
      <ol className="flex items-center gap-2">
        {[1, 2, 3, 4].map((n, idx) => (
          <li key={n} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                step >= n ? "bg-ui-fg-base text-ui-bg-base" : "border border-ui-border-base bg-ui-bg-base text-ui-fg-muted"
              }`}
              onClick={() => setStep(n)}
            >
              {step > n ? "✓" : n}
            </button>
            {idx < 3 ? (
              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-ui-border-base">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[#FF2E63]"
                  initial={false}
                  animate={{ width: step > n ? "100%" : step === n ? "50%" : "0%" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-ui-fg-muted">Click steps — connector animates (checkout metaphor).</p>
    </div>
  )
}

export function LabCartBump({ reducedMotion }: { reducedMotion: boolean }) {
  const [scale, setScale] = useState(1)

  const trigger = () => {
    if (reducedMotion) {
      return
    }
    setScale(1.18)
    window.setTimeout(() => setScale(1), 180)
  }

  return (
    <div className="flex items-center gap-4">
      <motion.button
        type="button"
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 520, damping: 20 }}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-ui-border-base bg-ui-bg-base text-2xl"
        aria-label="Demo cart"
        onClick={trigger}
      >
        🛒
      </motion.button>
      <button
        type="button"
        className="rounded-full border border-ui-border-base px-4 py-2 text-sm font-medium text-ui-fg-base"
        onClick={trigger}
      >
        Fake add — bump icon
      </button>
    </div>
  )
}

export function LabCopyMorph() {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText("SCPRINTS-DEMO")
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex min-w-[10rem] items-center justify-center rounded-full border border-ui-border-base bg-ui-bg-base px-4 py-2 text-sm font-medium text-ui-fg-base"
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="ok"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              Copied ✓
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              Copy code
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <p className="sr-only" role="status" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </p>
    </div>
  )
}

export function LabSwitch({ reducedMotion }: { reducedMotion: boolean }) {
  const [on, setOn] = useState(false)

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className={`relative h-8 w-14 rounded-full border border-ui-border-base ${on ? "bg-[#FF2E63]/90" : "bg-ui-bg-subtle"}`}
    >
      <motion.span
        className="absolute top-1 left-1 h-6 w-6 rounded-full bg-ui-bg-base shadow"
        animate={{ x: on ? 24 : 0 }}
        transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 32 }}
      />
    </button>
  )
}

export function LabStarRating({ reducedMotion }: { reducedMotion: boolean }) {
  const [filled, setFilled] = useState(0)

  return (
    <div className="space-y-3">
      <div className="flex gap-1" role="img" aria-label={`${filled} of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            type="button"
            className="text-2xl text-amber-400"
            initial={false}
            animate={{ scale: n <= filled ? [1, 1.2, 1] : 1 }}
            transition={
              reducedMotion || n > filled
                ? { duration: 0 }
                : { duration: 0.35, delay: (n - 1) * 0.06, ease: "easeOut" }
            }
            onClick={() => setFilled(n)}
          >
            {n <= filled ? "★" : "☆"}
          </motion.button>
        ))}
      </div>
      <button
        type="button"
        className="text-xs font-medium text-ui-fg-muted underline"
        onClick={() => setFilled(4)}
      >
        Animate to 4 stars
      </button>
    </div>
  )
}

export function LabBadgePulse({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) {
    return (
      <span className="inline-flex rounded-full bg-[#FF2E63]/15 px-3 py-1 text-xs font-semibold text-[#FF2E63]">
        Live print queue
      </span>
    )
  }

  return (
    <motion.span
      className="inline-flex rounded-full bg-[#FF2E63]/15 px-3 py-1 text-xs font-semibold text-[#FF2E63]"
      animate={{ scale: [1, 1.04, 1], opacity: [1, 0.85, 1] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    >
      Live print queue
    </motion.span>
  )
}

export function LabElasticDrag() {
  return (
    <div className="flex h-40 items-center justify-center rounded-xl border border-ui-border-base bg-ui-bg-subtle">
      <motion.div
        drag
        dragConstraints={{ left: -60, right: 60, top: -40, bottom: 40 }}
        dragElastic={0.35}
        className="cursor-grab rounded-xl border border-ui-border-base bg-ui-bg-base px-5 py-3 text-sm font-medium text-ui-fg-base active:cursor-grabbing"
      >
        Drag me
      </motion.div>
    </div>
  )
}

export function LabGradientText({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.p
      className="bg-clip-text text-2xl font-bold text-transparent"
      style={{
        backgroundImage: "linear-gradient(90deg, #FF2E63, #6366f1, #a855f7, #FF2E63)",
        backgroundSize: "200% auto",
      }}
      animate={
        reducedMotion
          ? {}
          : { backgroundPosition: ["0% center", "100% center", "0% center"] }
      }
      transition={reducedMotion ? {} : { duration: 5, repeat: Infinity, ease: "linear" }}
    >
      Gradient headline without Lottie
    </motion.p>
  )
}

export function LabLinkUnderline() {
  return (
    <a
      href="#lab-extra-anchor"
      className="group relative inline text-sm font-medium text-ui-fg-base"
      id="lab-extra-anchor"
    >
      Hover or keyboard focus — underline draws
      <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-[#FF2E63] transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100" />
    </a>
  )
}

const BLURB = "Premium prints that stay vivid wash after wash."

export function LabBlurInWords({ reducedMotion }: { reducedMotion: boolean }) {
  const words = useMemo(() => BLURB.split(" "), [])
  const { ref, inView } = useInView({ threshold: 0.4, triggerOnce: true })

  if (reducedMotion) {
    return (
      <p ref={ref} className="text-lg text-ui-fg-base">
        {BLURB}
      </p>
    )
  }

  return (
    <p ref={ref} className="flex flex-wrap gap-x-2 gap-y-1 text-lg text-ui-fg-base">
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={inView ? { opacity: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.45, delay: i * 0.06, ease: "easeOut" }}
        >
          {w}
        </motion.span>
      ))}
    </p>
  )
}

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

export function LabScrambleText({ reducedMotion }: { reducedMotion: boolean }) {
  const target = "SHIP READY"
  const [display, setDisplay] = useState(target)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  const run = useCallback(() => {
    if (reducedMotion) {
      setDisplay(target)
      return
    }
    stop()
    let frame = 0
    const totalFrames = 22
    const chars = target.split("")
    const letters = chars.filter((c) => c !== " ")
    tickRef.current = setInterval(() => {
      frame += 1
      let li = 0
      setDisplay(
        chars
          .map((ch) => {
            if (ch === " ") {
              return " "
            }
            const revealFrame = Math.ceil(((li + 1) / letters.length) * totalFrames)
            li += 1
            if (frame >= revealFrame) {
              return ch
            }
            return CHARSET[Math.floor(Math.random() * CHARSET.length)] ?? ch
          })
          .join("")
      )
      if (frame >= totalFrames) {
        stop()
        setDisplay(target)
      }
    }, 48)
  }, [reducedMotion, stop, target])

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(target)
      return
    }
    run()
    return () => stop()
  }, [reducedMotion, run, stop, target])

  return (
    <div className="space-y-2">
      <p className="font-mono text-xl font-bold tracking-widest text-ui-fg-base">{display}</p>
      <button
        type="button"
        className="text-xs text-ui-fg-muted underline"
        onClick={() => {
          setDisplay(target)
          run()
        }}
      >
        Replay scramble
      </button>
    </div>
  )
}

export function LabImageZoomHover() {
  return (
    <div className="group relative mx-auto max-w-sm overflow-hidden rounded-xl border border-ui-border-base">
      <motion.img
        src="https://picsum.photos/seed/zoomwidget/640/400"
        alt=""
        className="h-48 w-full object-cover"
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
      <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/55 px-2 py-1 text-xs text-white">
        Hover to zoom
      </p>
    </div>
  )
}

export function LabKenBurns({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="mx-auto max-w-lg overflow-hidden rounded-xl border border-ui-border-base">
      <motion.img
        src="https://picsum.photos/seed/kenburns/800/420"
        alt=""
        className="h-52 w-full object-cover"
        animate={
          reducedMotion
            ? {}
            : {
                scale: [1, 1.08],
                x: ["0%", "-4%"],
              }
        }
        transition={reducedMotion ? {} : { duration: 18, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
    </div>
  )
}

export function LabCrossfadePosters({ reducedMotion }: { reducedMotion: boolean }) {
  const [a, setA] = useState(true)

  useEffect(() => {
    if (reducedMotion) {
      return
    }
    const id = window.setInterval(() => setA((v) => !v), 3200)
    return () => window.clearInterval(id)
  }, [reducedMotion])

  return (
    <div className="relative mx-auto aspect-[5/3] max-w-md overflow-hidden rounded-xl border border-ui-border-base">
      <img
        src="https://picsum.photos/seed/crossA/640/384"
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ${a ? "opacity-100" : "opacity-0"}`}
      />
      <img
        src="https://picsum.photos/seed/crossB/640/384"
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ${a ? "opacity-0" : "opacity-100"}`}
      />
    </div>
  )
}

export function LabFakeVideoPoster({ reducedMotion }: { reducedMotion: boolean }) {
  const [busy, setBusy] = useState(false)

  return (
    <div className="relative mx-auto max-w-md overflow-hidden rounded-xl border border-ui-border-base">
      <img src="https://picsum.photos/seed/videoposter/640/360" alt="" className="h-48 w-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
        <button
          type="button"
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-ui-bg-base/90 text-ui-fg-base shadow-lg"
          onClick={() => {
            setBusy(true)
            window.setTimeout(() => setBusy(false), 1400)
          }}
          aria-label="Play demo"
        >
          <span className="ml-1 text-2xl">▶</span>
          {!reducedMotion ? (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-[#FF2E63]"
              animate={{ scale: [1, 1.15, 1], opacity: [0.9, 0.4, 0.9] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null}
        </button>
      </div>
      <AnimatePresence>
        {busy ? (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-ui-fg-base/80 text-sm text-ui-bg-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Buffering…
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export function LabFilmGrain() {
  return (
    <div className="relative h-40 overflow-hidden rounded-xl border border-ui-border-base bg-gradient-to-br from-ui-fg-base to-ui-fg-subtle">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <p className="relative z-[1] flex h-full items-center justify-center px-4 text-center text-sm text-ui-bg-base">
        SVG noise overlay — tune opacity for dark sections.
      </p>
    </div>
  )
}

export function LabAuroraMesh({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) {
    return (
      <div className="h-44 rounded-xl border border-ui-border-base bg-gradient-to-br from-indigo-900/30 via-[#FF2E63]/20 to-emerald-700/25" />
    )
  }

  return (
    <div className="relative h-44 overflow-hidden rounded-xl border border-ui-border-base">
      <motion.div
        className="absolute -inset-1/2 bg-[conic-gradient(from_180deg_at_50%_50%,#FF2E6344,#6366f155,#34d39944,#FF2E6344)]"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 backdrop-blur-2xl" />
    </div>
  )
}

export function LabDashedBorderCard() {
  return (
    <div className="flex justify-center py-4">
      <div className="relative inline-block">
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 280 100" aria-hidden>
          <motion.rect
            x="2"
            y="2"
            width="276"
            height="96"
            rx="16"
            fill="none"
            className="stroke-[#FF2E63]"
            strokeWidth="2"
            strokeDasharray="10 8"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: [0, -72] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </svg>
        <div className="relative z-[1] min-w-[280px] rounded-2xl bg-ui-bg-subtle px-8 py-6 text-center text-sm text-ui-fg-base">
          Limited run — dashed frame
        </div>
      </div>
    </div>
  )
}

export function LabGlassSheen({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-subtle p-8 backdrop-blur-md">
      {!reducedMotion ? (
        <motion.div
          className="pointer-events-none absolute -inset-1 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          animate={{ x: ["-120%", "120%"] }}
          transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
        />
      ) : null}
      <p className="relative z-[1] text-sm text-ui-fg-base">Glass-style panel with occasional sheen sweep.</p>
    </div>
  )
}

export function LabSparklineBars({ reducedMotion }: { reducedMotion: boolean }) {
  const heights = [28, 52, 40, 68, 44, 76, 56]
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })

  if (reducedMotion) {
    return (
      <div ref={ref} className="flex h-28 items-end gap-2 rounded-xl border border-ui-border-base bg-ui-bg-subtle px-4 pb-4 pt-6">
        {heights.map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-[#FF2E63]/80" style={{ height: h }} />
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className="flex h-28 items-end gap-2 rounded-xl border border-ui-border-base bg-ui-bg-subtle px-4 pb-4 pt-6">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t bg-[#FF2E63]/80"
          initial={false}
          animate={{ height: inView ? h : 0 }}
          transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

export function LabStockMeter({ reducedMotion }: { reducedMotion: boolean }) {
  const pct = 18

  return (
    <div className="max-w-md space-y-2">
      <div className="h-3 overflow-hidden rounded-full bg-ui-border-base">
        <motion.div
          className="h-full rounded-full bg-amber-500"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-ui-fg-muted">
        Low stock demo — bar uses warning color; pulse when under 20%.
      </p>
      {!reducedMotion ? (
        <motion.p
          className="text-xs font-medium text-amber-600"
          animate={{ opacity: [1, 0.55, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          Only a few left in this size
        </motion.p>
      ) : (
        <p className="text-xs font-medium text-amber-600">Only a few left in this size</p>
      )}
    </div>
  )
}

export function LabSliderTicks({ reducedMotion }: { reducedMotion: boolean }) {
  const [v, setV] = useState(33)
  const ticks = [0, 25, 50, 75, 100]

  return (
    <div className="max-w-md space-y-3">
      <input
        type="range"
        min={0}
        max={100}
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        className="w-full accent-[#FF2E63]"
        aria-valuetext={`${v} percent`}
      />
      <div className="relative flex justify-between px-1">
        {ticks.map((t) => {
          const active = Math.abs(v - t) < 8
          return (
            <motion.span
              key={t}
              className="h-2 w-2 rounded-full bg-ui-border-base"
              animate={active ? { scale: reducedMotion ? 1 : 1.45, backgroundColor: "#FF2E63" } : { scale: 1 }}
              transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 22 }}
            />
          )
        })}
      </div>
    </div>
  )
}

const CAROUSEL_CARD_W = 200

export function LabDragCarousel() {
  const maxLeft = -((DEMO_ITEMS.length - 1) * CAROUSEL_CARD_W + 12)

  return (
    <div className="overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-subtle py-6">
      <motion.div
        drag="x"
        dragConstraints={{ left: maxLeft, right: 0 }}
        dragElastic={0.12}
        className="flex w-max cursor-grab gap-3 px-6 active:cursor-grabbing"
      >
        {DEMO_ITEMS.map((label) => (
          <div
            key={label}
            className="flex h-28 flex-shrink-0 items-center justify-center rounded-xl border border-ui-border-base bg-ui-bg-base text-sm font-medium text-ui-fg-base"
            style={{ width: CAROUSEL_CARD_W }}
          >
            {label}
          </div>
        ))}
      </motion.div>
      <p className="mt-2 px-6 text-xs text-ui-fg-muted">Drag horizontally — elastic constraints, release to settle.</p>
    </div>
  )
}

export function LabMagneticButton() {
  const ref = useRef<HTMLButtonElement>(null)
  const [shift, setShift] = useState({ x: 0, y: 0 })

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) {
      return
    }
    const b = el.getBoundingClientRect()
    const cx = b.left + b.width / 2
    const cy = b.top + b.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.hypot(dx, dy)
    const maxPull = 10
    if (dist < 80) {
      setShift({ x: (dx / dist) * maxPull * (1 - dist / 80), y: (dy / dist) * maxPull * (1 - dist / 80) })
    } else {
      setShift({ x: 0, y: 0 })
    }
  }

  return (
    <div className="flex h-36 items-center justify-center rounded-xl border border-ui-border-base bg-ui-bg-subtle">
      <motion.button
        ref={ref}
        type="button"
        className="rounded-full bg-ui-fg-base px-6 py-2.5 text-sm font-medium text-ui-bg-base"
        animate={{ x: shift.x, y: shift.y }}
        transition={{ type: "spring", stiffness: 350, damping: 18 }}
        onPointerMove={onMove}
        onPointerLeave={() => setShift({ x: 0, y: 0 })}
      >
        Magnetic CTA
      </motion.button>
    </div>
  )
}

export function LabBottomSheet() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        className="rounded-full border border-ui-border-base bg-ui-bg-base px-4 py-2 text-sm font-medium"
        onClick={() => setOpen(true)}
      >
        Open bottom sheet
      </button>
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close"
              className="fixed inset-0 z-[190] bg-ui-fg-base/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              className="fixed bottom-0 left-0 right-0 z-[200] rounded-t-2xl border-t border-ui-border-base bg-ui-bg-base p-6 shadow-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ui-border-base" />
              <p className="text-sm font-medium text-ui-fg-base">Sheet content</p>
              <p className="mt-2 text-sm text-ui-fg-muted">Tap backdrop or use Close.</p>
              <button
                type="button"
                className="mt-4 rounded-full border border-ui-border-base px-4 py-2 text-sm"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export function LabToastStack() {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <button
        type="button"
        className="rounded-full border border-ui-border-base bg-ui-bg-base px-4 py-2 text-sm font-medium"
        onClick={() => {
          setVisible(true)
          window.setTimeout(() => setVisible(false), 3200)
        }}
      >
        Show toast
      </button>
      <AnimatePresence>
        {visible ? (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 24, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 12, x: "-50%" }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="fixed bottom-24 left-1/2 z-[180] max-w-sm rounded-xl border border-ui-border-base bg-ui-bg-base px-4 py-3 text-sm text-ui-fg-base shadow-lg"
          >
            Saved to cart (demo toast)
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
