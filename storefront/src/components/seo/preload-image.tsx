"use client"

import { useEffect } from "react"

/**
 * Client component to preload LCP image
 * Uses link preload for faster Largest Contentful Paint
 */
export default function PreloadImage({ src }: { src: string }) {
  useEffect(() => {
    if (!src) return

    // Create link element for preloading
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = src
    link.setAttribute("fetchpriority", "high")
    document.head.appendChild(link)

    // Cleanup
    return () => {
      document.head.removeChild(link)
    }
  }, [src])

  return null
}

