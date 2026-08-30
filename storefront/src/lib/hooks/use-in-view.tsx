"use client"

import { RefObject, useEffect, useState } from "react"

export const useIntersection = (
  // React 19 types useRef<T>(null) as RefObject<T | null>, so the parameter
  // has to admit null or every caller fails to typecheck.
  element: RefObject<HTMLDivElement | null>,
  rootMargin: string
) => {
  const [isVisible, setState] = useState(false)

  useEffect(() => {
    if (!element.current) {
      return
    }

    const el = element.current

    const observer = new IntersectionObserver(
      ([entry]) => {
        setState(entry.isIntersecting)
      },
      { rootMargin }
    )

    observer.observe(el)

    return () => observer.unobserve(el)
  }, [element, rootMargin])

  return isVisible
}
