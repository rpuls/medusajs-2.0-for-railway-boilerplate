import type { HTMLAttributes, ReactNode } from "react"

type Breakpoint = "phone" | "xsmall" | "tablet" | "small" | "medium"

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  /** Breakpoint at which the visibility flips. Default `tablet` (768px). */
  at?: Breakpoint
}

const HIDE_AT: Record<Breakpoint, string> = {
  phone: "phone:hidden",
  xsmall: "xsmall:hidden",
  tablet: "tablet:hidden",
  small: "small:hidden",
  medium: "medium:hidden",
}

const SHOW_AT: Record<Breakpoint, string> = {
  phone: "phone:block",
  xsmall: "xsmall:block",
  tablet: "tablet:block",
  small: "small:block",
  medium: "medium:block",
}

/**
 * Renders children only on viewports below the given breakpoint (default
 * `tablet` = 768px, i.e. phones). SSR-safe: both `MobileOnly` and
 * `DesktopOnly` always render their children in the DOM and toggle via CSS,
 * so there's no hydration flash. Use [useIsPhone](@lib/hooks/use-breakpoint)
 * for cases where the two branches must be different component trees.
 */
export function MobileOnly({
  children,
  at = "tablet",
  className = "",
  ...rest
}: Props) {
  return (
    <div className={`${HIDE_AT[at]} ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}

/**
 * Renders children only at or above the given breakpoint (default `tablet`
 * = 768px, i.e. iPad portrait and up). See {@link MobileOnly} for tradeoffs.
 */
export function DesktopOnly({
  children,
  at = "tablet",
  className = "",
  ...rest
}: Props) {
  return (
    <div className={`hidden ${SHOW_AT[at]} ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}
