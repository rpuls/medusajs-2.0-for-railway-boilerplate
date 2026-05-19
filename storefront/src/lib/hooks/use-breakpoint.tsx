"use client"

import {
  type BreakpointKey,
  maxWidthQuery,
  minWidthQuery,
} from "@lib/breakpoints"
import { useMediaQuery } from "./use-media-query"

/**
 * `useBreakpoint("tablet")` → true at 768px+ (iPad portrait and bigger).
 * `useBreakpoint("tablet", "down")` → true below 768px (phones only).
 */
export function useBreakpoint(
  key: BreakpointKey,
  direction: "up" | "down" = "up"
): boolean {
  const query = direction === "up" ? minWidthQuery(key) : maxWidthQuery(key)
  return useMediaQuery(query)
}

/** True on phones (below the tablet breakpoint, 0-767px). */
export function useIsPhone(): boolean {
  return useBreakpoint("tablet", "down")
}

/** True on iPad portrait and up (768px+). */
export function useIsTablet(): boolean {
  return useBreakpoint("tablet", "up")
}

/** True on iPad landscape / small desktop and up (1024px+). */
export function useIsDesktop(): boolean {
  return useBreakpoint("small", "up")
}
