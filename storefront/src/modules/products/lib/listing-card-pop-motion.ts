/**
 * Shared hover “pop” tuned for catalogue listing cards and AS Colour UGC masonry —
 * tilt, lift, scale, shadows, and inner image zoom stay aligned.
 */
export const LISTING_CARD_POP = {
  liftPx: 28,
  hoverScale: 1.12,
  /** Pointer ∈ [−½, ½]; max tilt ~±17° / ±20° */
  rotateXCoeff: -34,
  rotateYCoeff: 40,
  perspectivePx: 760,
  tiltSpring: { type: "spring" as const, stiffness: 320, damping: 22 },
  liftSpring: { type: "spring" as const, stiffness: 300, damping: 24 },
} as const

/** Matches UGC masonry image zoom (`group` on ancestor). */
export const LISTING_CARD_INNER_IMAGE_HOVER_CLASSES =
  "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.15]"

/** Shell + catalogue shadow stack (beyond `shadow-elevation-card-hover`). */
export const LISTING_CARD_SHELL_HOVER_SURFACE_CLASSES =
  "hover:border-[var(--brand-secondary)]/80 hover:shadow-[0_28px_55px_-12px_rgba(0,0,0,0.38)] hover:shadow-elevation-card-hover"
