"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useRef, useState, type CSSProperties } from "react"

import { brandInitials, getBrandPresentation } from "@modules/brands/data/brands"
import type { StorefrontBrand } from "@lib/data/brands"
import { computeTilePositions } from "@modules/brands/components/brands-hero/tile-placement"
import { RamoLogoInline } from "@modules/brands/components/ramo-logo-inline"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type BrandsHeroTile = {
  id: string
  handle: string
  name: string
  initials: string
  bgClass: string
  logoSrc?: string
}

/** One-shot text intro: fade + slide up, staggered. */
const TEXT_LINE_DURATION = 0.6
const TEXT_LINE_STAGGER = 0.12
const TEXT_LINE_Y = 24

/** Brand tiles: quick move to final layout, then CSS float */
const TILES_INTRO_DURATION = 0.5
const TILES_INTRO_STAGGER = 0.035
const TILES_INTRO_EASE = "power2.out"
/** Start float after this tile’s intro segment + small buffer (seconds) */
const floatDelayForIndex = (i: number) =>
  TILES_INTRO_DURATION + i * TILES_INTRO_STAGGER + 0.08 + (i % 7) * 0.16

export default function BrandsHero({ brands }: { brands: StorefrontBrand[] }) {
  const tiles: BrandsHeroTile[] = brands.map((b) => {
    const presentation = getBrandPresentation(b.handle)
    return {
      id: b.id,
      handle: b.handle,
      name: b.name,
      initials: presentation.initials || brandInitials(b.name),
      bgClass: presentation.bgClass,
      logoSrc: b.logo_url ?? presentation.logoSrc,
    }
  })
  const stageRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<(HTMLDivElement | null)[]>([])
  const textLineRefs = useRef<(HTMLDivElement | null)[]>([])
  const [logoLoadFailed, setLogoLoadFailed] = useState<Record<string, boolean>>({})

  useGSAP(
    () => {
      const ring = ringRef.current
      const lines = textLineRefs.current.filter(Boolean) as HTMLDivElement[]
      if (!ring || lines.length === 0) {
        return
      }

      const tiles = tileRefs.current.filter(Boolean) as HTMLDivElement[]
      if (tiles.length === 0) {
        return
      }

      let reduced = false
      try {
        reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      } catch {
        reduced = false
      }

      const applyFinalTiles = (animate: boolean) => {
        const targets = computeTilePositions(tiles, ring)
        if (!animate || reduced) {
          tiles.forEach((el, i) => {
            const t = targets[i]
            gsap.set(el, {
              xPercent: -50,
              yPercent: -50,
              x: t.x,
              y: t.y,
              scale: 1,
              opacity: 1,
              force3D: true,
            })
          })
          return
        }
        tiles.forEach((el) => {
          gsap.set(el, {
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0,
            scale: 0.9,
            opacity: 0.75,
            force3D: true,
          })
        })
        gsap.killTweensOf(tiles)
        gsap.to(tiles, {
          x: (i: number) => targets[i]!.x,
          y: (i: number) => targets[i]!.y,
          scale: 1,
          opacity: 1,
          duration: TILES_INTRO_DURATION,
          ease: TILES_INTRO_EASE,
          stagger: TILES_INTRO_STAGGER,
        })
      }

      if (reduced) {
        gsap.set(lines, { opacity: 1, y: 0 })
        applyFinalTiles(false)
        return
      }

      // One-shot text intro — fade + slide up, staggered.
      gsap.set(lines, { opacity: 0, y: TEXT_LINE_Y })
      gsap.to(lines, {
        opacity: 1,
        y: 0,
        duration: TEXT_LINE_DURATION,
        stagger: TEXT_LINE_STAGGER,
        ease: "power3.out",
      })

      let resizeTimer: ReturnType<typeof setTimeout> | undefined
      const onResize = () => {
        if (resizeTimer !== undefined) clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          gsap.killTweensOf(tiles)
          applyFinalTiles(false)
        }, 100)
      }
      window.addEventListener("resize", onResize)
      const raf1 = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          applyFinalTiles(true)
        })
      })

      return () => {
        if (resizeTimer !== undefined) clearTimeout(resizeTimer)
        window.removeEventListener("resize", onResize)
        cancelAnimationFrame(raf1)
        gsap.killTweensOf(tiles)
      }
    },
    { scope: stageRef, dependencies: [] }
  )

  return (
    <div className="relative w-full overflow-hidden bg-ui-bg-base">
      <div
        ref={stageRef}
        className="relative mx-auto flex min-h-[80vh] w-full max-w-[min(100%,76rem)] flex-col items-center justify-start px-4 pb-12 pt-16 small:px-8 small:pb-16 small:pt-24"
      >
        <div className="relative z-20 w-full max-w-xl shrink-0 px-2 text-center">
          <div
            ref={(el) => {
              textLineRefs.current[0] = el
            }}
          >
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-ui-fg-subtle">
              Brands we decorate
            </p>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-ui-fg-base small:text-5xl">
            <div
              ref={(el) => {
                textLineRefs.current[1] = el
              }}
            >
              <span className="block">Trusted blanks &amp;</span>
            </div>
            <div
              ref={(el) => {
                textLineRefs.current[2] = el
              }}
              className="pt-1"
            >
              <span className="block">retail names</span>
            </div>
          </h1>
          <div
            ref={(el) => {
              textLineRefs.current[3] = el
            }}
            className="mt-5"
          >
            <p className="text-base text-ui-fg-subtle">
              We partner with leading apparel and headwear suppliers for screen
              printing, embroidery, and transfers.
            </p>
          </div>
        </div>

        <div
          ref={ringRef}
          className="relative z-[1] mt-6 flex min-h-[21rem] w-full min-w-0 max-w-[min(99vw,76rem)] flex-1 items-center justify-center small:mt-8 small:min-h-[26rem]"
        >
          {tiles.map((brand, i) => {
            const isRamoTile = brand.handle === "ramo"
            const showLogo =
              !isRamoTile && Boolean(brand.logoSrc) && !logoLoadFailed[brand.id]
            const storeHref = `/brands/${brand.handle}`
            return (
              <div
                key={brand.id}
                ref={(el) => {
                  tileRefs.current[i] = el
                }}
                className="absolute left-1/2 top-1/2 z-[2] h-24 w-24 small:h-32 small:w-32 will-change-transform"
              >
                <div
                  className={
                    i % 2 === 0
                      ? "motion-safe:animate-brand-tile-float motion-reduce:animate-none h-full w-full will-change-transform"
                      : "motion-safe:animate-brand-tile-float-alt motion-reduce:animate-none h-full w-full will-change-transform"
                  }
                  style={
                    {
                      animationDelay: `${floatDelayForIndex(i)}s`,
                      "--brand-float-duration": `${5.2 + (i % 6) * 0.42}s`,
                    } as CSSProperties
                  }
                >
                  <LocalizedClientLink
                    href={storeHref}
                    className="block h-full w-full rounded-2xl no-underline outline-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--brand-secondary)] focus-visible:ring-offset-2"
                    aria-label={`View all ${brand.name} products`}
                  >
                    {isRamoTile ? (
                      <span className="flex h-full w-full items-center justify-center px-0.5">
                        <RamoLogoInline className="h-full w-full max-h-full max-w-full object-contain [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.12))]" />
                      </span>
                    ) : showLogo && brand.logoSrc ? (
                      <span className="flex h-full w-full items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={brand.logoSrc}
                          alt=""
                          className="h-full w-full max-h-full max-w-full object-contain [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.12))] motion-reduce:transition-none"
                          loading="lazy"
                          decoding="async"
                          onError={() =>
                            setLogoLoadFailed((prev) => ({ ...prev, [brand.id]: true }))
                          }
                        />
                      </span>
                    ) : (
                      <span
                        className={`flex h-full w-full items-center justify-center rounded-2xl text-[0.65rem] font-bold uppercase tracking-tight text-white shadow-lg ring-1 ring-black/10 small:text-xs ${brand.bgClass}`}
                      >
                        <span className="select-none" aria-hidden>
                          {brand.initials}
                        </span>
                      </span>
                    )}
                  </LocalizedClientLink>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
