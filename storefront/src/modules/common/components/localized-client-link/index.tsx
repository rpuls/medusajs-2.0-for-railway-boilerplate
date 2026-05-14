"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"
import { useTransitionRouter } from "next-view-transitions"

const runPageTransition = () => {
  // Reset scroll to the top of the new page. Next.js's router.push normally
  // does this automatically with `scroll: true` (the default), but wrapping
  // the push inside `document.startViewTransition` + `startTransition`
  // (which next-view-transitions does internally) defers the scroll reset
  // until the transition completes — by which point the user briefly sees
  // the new page mounted at the previous scroll position. Doing it here
  // (inside `transition.ready`) means the actual DOM scroll happens while
  // the view-transition pseudo-elements still cover the page, so the user
  // sees a clean transition that lands at the top.
  window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })

  document.documentElement.animate(
    [
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0.25, transform: "translateY(24%)" },
    ],
    {
      duration: 650,
      easing: "cubic-bezier(0.87, 0, 0.13, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    }
  )

  document.documentElement.animate(
    [
      { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
      { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" },
    ],
    {
      duration: 650,
      easing: "cubic-bezier(0.87, 0, 0.13, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    }
  )
}

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  prefetch,
  ...props
}: {
  children?: React.ReactNode
  href: string
  /** Set `false` on dense product grids to avoid many RSC prefetches competing with the current page. */
  prefetch?: boolean
  className?: string
  onClick?: (() => void) | React.MouseEventHandler<HTMLAnchorElement>
  passHref?: true
  [x: string]: any
}) => {
  const router = useTransitionRouter()
  const { countryCode } = useParams()
  const normalizedCountryCode = Array.isArray(countryCode)
    ? countryCode[0]
    : countryCode
  const isExternalHref =
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  const localizedHref =
    isExternalHref || !normalizedCountryCode
      ? href
      : `/${normalizedCountryCode}${href}`

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    const clickHandler = props.onClick
    if (typeof clickHandler === "function") {
      if (clickHandler.length === 0) {
        ;(clickHandler as () => void)()
      } else {
        ;(clickHandler as React.MouseEventHandler<HTMLAnchorElement>)(e)
      }
    }

    if (e.defaultPrevented) {
      return
    }

    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      props.target === "_blank" ||
      props.download ||
      isExternalHref ||
      href.startsWith("#")
    ) {
      return
    }

    e.preventDefault()
    router.push(localizedHref, {
      onTransitionReady: runPageTransition,
    })
  }

  return (
    <Link
      href={localizedHref}
      prefetch={prefetch}
      {...props}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}

export default LocalizedClientLink
