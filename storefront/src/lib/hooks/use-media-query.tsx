"use client"

import { useEffect, useState } from "react"

/**
 * SSR-safe matchMedia hook. Returns `false` on the server and first render,
 * then flips to the live value once mounted. Callers should structure their
 * UI so the `false` branch is the safe SSR-render state (usually: assume
 * desktop on the server, hydrate to mobile if matched).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [query])

  return matches
}
