"use client"

import { Container, clx } from "@medusajs/ui"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

import { remapStaleExternalGarmentUrl } from "@lib/util/remap-stale-supplier-images"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { resolveGarmentSwatchColor } from "@modules/products/lib/garment-swatch-colors"
import type { ProductListingCardData } from "@modules/products/lib/product-listing-card-data"
import {
  LISTING_CARD_INNER_IMAGE_HOVER_CLASSES,
  LISTING_CARD_POP,
  LISTING_CARD_SHELL_HOVER_SURFACE_CLASSES,
} from "@modules/products/lib/listing-card-pop-motion"

/**
 * Default catalog behavior is `tiltLift` (lift + scale on hover; no 3D tilt).
 * Use `bounce` only for the legacy keyed enter/leave animation.
 */
export type ProductListingInteraction = "bounce" | "tiltLift"

export type ProductListingCardProps = ProductListingCardData & {
  className?: string
  interaction?: ProductListingInteraction
}

type CardPhase = "rest" | "enter" | "hold" | "leave"

const VELOCITY_EPS = 0.5

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getReducedMotionServerSnapshot() {
  return false
}

function normalizeBias(nx: number, ny: number): { x: string; y: string } {
  const len = Math.hypot(nx, ny)
  if (len < 1e-6) return { x: "0", y: "0" }
  return { x: String(nx / len), y: String(ny / len) }
}

function CardImage({
  imageUrl,
  title,
}: {
  imageUrl: string | null
  title: string
}) {
  const resolved = imageUrl
    ? remapStaleExternalGarmentUrl(imageUrl) ?? imageUrl
    : null
  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden p-4 bg-ui-bg-subtle shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150 aspect-[1/1] rounded-lg"
      )}
    >
      {resolved ? (
        <Image
          src={resolved}
          alt={title}
          className={clx(
            "absolute inset-0 object-cover object-center",
            LISTING_CARD_INNER_IMAGE_HOVER_CLASSES
          )}
          draggable={false}
          quality={50}
          sizes="(max-width: 576px) 50vw, (max-width: 1024px) 33vw, 260px"
          fill
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <PlaceholderImage size={24} />
        </div>
      )}
    </Container>
  )
}

type ListingCardContentProps = {
  href: string
  title: string
  previewUrl: string | null
  setPreviewUrl: (url: string | null) => void
  priceFromLine: string
  priceHundredPlusLine: string | null
  swatches: ProductListingCardData["swatches"]
  totalSwatchCount: number
  swatchPhotosActive: boolean
  setSwatchPhotosActive: (v: boolean) => void
}

function ListingCardContent({
  href,
  title,
  previewUrl,
  setPreviewUrl,
  priceFromLine,
  priceHundredPlusLine,
  swatches,
  totalSwatchCount,
  swatchPhotosActive,
  setSwatchPhotosActive,
}: ListingCardContentProps) {
  return (
    <>
      <LocalizedClientLink href={href} className="block min-w-0" prefetch={false}>
        <CardImage imageUrl={previewUrl} title={title} />
        <h3
          className="mt-4 text-base font-semibold text-ui-fg-base"
          data-testid="product-title"
        >
          {title}
        </h3>
        <div className="mt-2 text-sm text-ui-fg-subtle">
          <p>{priceFromLine}</p>
          {priceHundredPlusLine ? (
            <p className="mt-0.5 text-xs text-ui-fg-muted">{priceHundredPlusLine}</p>
          ) : null}
        </div>
      </LocalizedClientLink>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-ui-fg-muted">
          Available colors
        </p>
        <div
          className="flex flex-wrap items-center gap-2"
          onMouseEnter={() => setSwatchPhotosActive(true)}
          onFocusCapture={() => setSwatchPhotosActive(true)}
        >
          {swatches.length ? (
            <>
              {swatches.map(({ colorLabel, imageUrl, swatchPhotoUrl }) => (
                <button
                  key={`${href}-${colorLabel}`}
                  type="button"
                  title={colorLabel}
                  aria-label={`Preview ${title} in ${colorLabel}`}
                  className="inline-block h-5 w-5 rounded-full border border-ui-border-base transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-fg-base focus-visible:ring-offset-2"
                  style={{
                    backgroundColor: resolveGarmentSwatchColor(colorLabel),
                    ...(swatchPhotosActive && swatchPhotoUrl
                      ? {
                          backgroundImage: `url("${swatchPhotoUrl}")`,
                          backgroundSize: "235%",
                          backgroundPosition: "center 35%",
                        }
                      : {}),
                  }}
                  onMouseEnter={() => setPreviewUrl(imageUrl)}
                  onFocus={() => setPreviewUrl(imageUrl)}
                />
              ))}
              {totalSwatchCount > swatches.length ? (
                <span
                  className="inline-flex h-5 min-w-[1.25rem] max-w-[2rem] shrink-0 items-center justify-center rounded-full border border-ui-border-base bg-ui-bg-subtle px-1 text-[10px] font-semibold tabular-nums leading-none text-ui-fg-subtle"
                  title={`${totalSwatchCount} colors total — see all on the product page`}
                  aria-label={`${totalSwatchCount} total colors. Fewer swatches are shown; open the product page for the full list.`}
                >
                  {totalSwatchCount}
                </span>
              ) : null}
            </>
          ) : (
            <span className="text-xs text-ui-fg-muted">
              Color options on product page
            </span>
          )}
        </div>
      </div>
    </>
  )
}

function useListingCardSwatchesObserver(
  rootRef: React.RefObject<HTMLElement | null>,
  setSwatchPhotosActive: (v: boolean) => void
) {
  useEffect(() => {
    const el = rootRef.current
    if (!el) {
      return
    }
    if (typeof IntersectionObserver === "undefined") {
      setSwatchPhotosActive(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSwatchPhotosActive(true)
        }
      },
      { rootMargin: "160px 0px", threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [rootRef, setSwatchPhotosActive])
}

type ShellProps = ProductListingCardData & { className?: string }

function ProductListingCardBounce({
  className,
  href,
  title,
  priceFromLine,
  priceHundredPlusLine,
  defaultImageUrl,
  swatches,
  totalSwatchCount,
}: ShellProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImageUrl)
  const [phase, setPhase] = useState<CardPhase>("rest")
  const [exitBias, setExitBias] = useState<{ x: string; y: string } | null>(null)
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )

  const articleRef = useRef<HTMLElement | null>(null)
  const [swatchPhotosActive, setSwatchPhotosActive] = useState(false)
  const pointerInsideRef = useRef(false)
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null)
  const prevPointerRef = useRef<{ x: number; y: number } | null>(null)
  const moveRafRef = useRef<number | null>(null)
  const pendingMoveRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    setPreviewUrl(defaultImageUrl)
  }, [defaultImageUrl])

  useLayoutEffect(() => {
    const el = articleRef.current
    if (!el || prefersReducedMotion) return
    if (el.matches(":hover")) {
      setPhase((p) => (p === "rest" ? "enter" : p))
    }
  }, [prefersReducedMotion])

  useEffect(() => {
    return () => {
      if (moveRafRef.current !== null) {
        cancelAnimationFrame(moveRafRef.current)
      }
    }
  }, [])

  useListingCardSwatchesObserver(articleRef, setSwatchPhotosActive)

  const resetPreview = useCallback(() => {
    setPreviewUrl(defaultImageUrl)
  }, [defaultImageUrl])

  const flushPointerMove = useCallback(() => {
    moveRafRef.current = null
    const p = pendingMoveRef.current
    if (!p) return
    pendingMoveRef.current = null
    const prev = lastPointerRef.current
    if (prev) {
      prevPointerRef.current = prev
    }
    lastPointerRef.current = p
  }, [])

  const computeExitBias = useCallback(
    (clientX: number, clientY: number) => {
      const last = lastPointerRef.current
      const prev = prevPointerRef.current
      let nx = 0
      let ny = 0
      if (last && prev) {
        const vx = last.x - prev.x
        const vy = last.y - prev.y
        nx = -vx
        ny = -vy
      }
      if (Math.hypot(nx, ny) < VELOCITY_EPS && articleRef.current) {
        const r = articleRef.current.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        nx = -(clientX - cx)
        ny = -(clientY - cy)
      }
      return normalizeBias(nx, ny)
    },
    []
  )

  const onMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      pointerInsideRef.current = true
      lastPointerRef.current = { x: e.clientX, y: e.clientY }
      prevPointerRef.current = { x: e.clientX, y: e.clientY }
      if (prefersReducedMotion) return
      setExitBias(null)
      setPhase("enter")
    },
    [prefersReducedMotion]
  )

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return
      pendingMoveRef.current = { x: e.clientX, y: e.clientY }
      if (moveRafRef.current !== null) return
      moveRafRef.current = requestAnimationFrame(flushPointerMove)
    },
    [prefersReducedMotion, flushPointerMove]
  )

  const onMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      pointerInsideRef.current = false
      if (moveRafRef.current !== null) {
        cancelAnimationFrame(moveRafRef.current)
        moveRafRef.current = null
      }
      flushPointerMove()
      lastPointerRef.current = { x: e.clientX, y: e.clientY }
      resetPreview()
      if (prefersReducedMotion) return
      setExitBias(computeExitBias(e.clientX, e.clientY))
      setPhase("leave")
    },
    [prefersReducedMotion, flushPointerMove, resetPreview, computeExitBias]
  )

  const onAnimationEnd = useCallback((ev: React.AnimationEvent<HTMLElement>) => {
    if (ev.target !== ev.currentTarget) return
    const name = ev.animationName.toLowerCase()
    if (name.includes("card-listing-enter")) {
      if (pointerInsideRef.current) setPhase("hold")
      else setPhase("rest")
      return
    }
    if (name.includes("card-listing-leave")) {
      setPhase("rest")
      setExitBias(null)
    }
  }, [])

  return (
    <article
      ref={articleRef}
      data-testid="product-wrapper"
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onAnimationEnd={onAnimationEnd}
      style={
        phase === "leave" && exitBias
          ? ({
              "--listing-exit-bias-x": exitBias.x,
              "--listing-exit-bias-y": exitBias.y,
            } as React.CSSProperties)
          : undefined
      }
      className={clx(
        "flex h-full w-full flex-col rounded-xl border border-ui-border-base bg-white p-4",
        "relative transform-gpu transition-[box-shadow,border-color] duration-300 ease-out",
        LISTING_CARD_SHELL_HOVER_SURFACE_CLASSES,
        !prefersReducedMotion && (phase !== "rest" ? "z-30" : "z-0"),
        prefersReducedMotion && "motion-reduce:z-0 motion-reduce:hover:z-30",
        "group",
        prefersReducedMotion &&
          "motion-reduce:transition-[transform,box-shadow,border-color] motion-reduce:duration-300 motion-reduce:ease-out motion-reduce:hover:-translate-y-6 motion-reduce:hover:scale-[1.1]",
        !prefersReducedMotion && phase === "enter" && "animate-card-listing-enter",
        !prefersReducedMotion && phase === "leave" && "animate-card-listing-leave",
        !prefersReducedMotion && phase === "hold" && "-translate-y-7 scale-[1.12]",
        className
      )}
    >
      <ListingCardContent
        href={href}
        title={title}
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
        priceFromLine={priceFromLine}
        priceHundredPlusLine={priceHundredPlusLine}
        swatches={swatches}
        totalSwatchCount={totalSwatchCount}
        swatchPhotosActive={swatchPhotosActive}
        setSwatchPhotosActive={setSwatchPhotosActive}
      />
    </article>
  )
}

function ProductListingCardTiltLift({
  className,
  href,
  title,
  priceFromLine,
  priceHundredPlusLine,
  defaultImageUrl,
  swatches,
  totalSwatchCount,
}: ShellProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImageUrl)
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )
  const [pointerInside, setPointerInside] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const MAX_TILT = 5

  const cardRootRef = useRef<HTMLElement | null>(null)
  const [swatchPhotosActive, setSwatchPhotosActive] = useState(false)

  useEffect(() => {
    setPreviewUrl(defaultImageUrl)
  }, [defaultImageUrl])

  useListingCardSwatchesObserver(cardRootRef, setSwatchPhotosActive)

  const resetPreview = useCallback(() => {
    setPreviewUrl(defaultImageUrl)
  }, [defaultImageUrl])

  const onPointerLeave = useCallback(() => {
    resetPreview()
    setPointerInside(false)
    setTilt({ rx: 0, ry: 0 })
  }, [resetPreview])

  const onPointerEnter = useCallback(() => {
    setPointerInside(true)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!cardRootRef.current) return
    const rect = cardRootRef.current.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ rx: -ny * MAX_TILT * 2, ry: nx * MAX_TILT * 2 })
  }, [])

  const content = (
    <ListingCardContent
      href={href}
      title={title}
      previewUrl={previewUrl}
      setPreviewUrl={setPreviewUrl}
      priceFromLine={priceFromLine}
      priceHundredPlusLine={priceHundredPlusLine}
      swatches={swatches}
      totalSwatchCount={totalSwatchCount}
      swatchPhotosActive={swatchPhotosActive}
      setSwatchPhotosActive={setSwatchPhotosActive}
    />
  )

  if (prefersReducedMotion) {
    return (
      <article
        ref={cardRootRef}
        data-testid="product-wrapper"
        className={clx(
          "flex h-full w-full flex-col rounded-xl border border-ui-border-base bg-white p-4",
          "relative transform-gpu transition-[box-shadow,border-color] duration-300 ease-out",
          LISTING_CARD_SHELL_HOVER_SURFACE_CLASSES,
          "motion-reduce:z-0 motion-reduce:hover:z-30 group",
          "motion-reduce:transition-[transform,box-shadow,border-color] motion-reduce:duration-300 motion-reduce:ease-out motion-reduce:hover:-translate-y-6 motion-reduce:hover:scale-[1.1]",
          className
        )}
      >
        {content}
      </article>
    )
  }

  const liftSpring = LISTING_CARD_POP.liftSpring

  return (
    <div style={{ perspective: `${LISTING_CARD_POP.perspectivePx}px` }} className="h-full w-full">
    <motion.article
      ref={cardRootRef}
      data-testid="product-wrapper"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      animate={{
        y: pointerInside ? -LISTING_CARD_POP.liftPx : 0,
        scale: pointerInside ? LISTING_CARD_POP.hoverScale : 1,
        rotateX: tilt.rx,
        rotateY: tilt.ry,
      }}
      transition={{
        y: liftSpring,
        scale: liftSpring,
        rotateX: liftSpring,
        rotateY: liftSpring,
      }}
      className={clx(
        "flex h-full w-full flex-col rounded-xl border border-ui-border-base bg-white p-4",
        "relative transform-gpu transition-[box-shadow,border-color] duration-300 ease-out",
        LISTING_CARD_SHELL_HOVER_SURFACE_CLASSES,
        pointerInside ? "z-30" : "z-0",
        "group",
        className
      )}
    >
      {content}
    </motion.article>
    </div>
  )
}

export default function ProductListingCard(props: ProductListingCardProps) {
  const { interaction = "tiltLift", ...rest } = props
  if (interaction === "tiltLift") {
    return <ProductListingCardTiltLift {...rest} />
  }
  return <ProductListingCardBounce {...rest} />
}
