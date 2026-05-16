"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { phCaptureException } from "@lib/posthog"

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CartError({ error, reset }: Props) {
  const { countryCode } = useParams() as { countryCode?: string | string[] }
  const cc = Array.isArray(countryCode) ? countryCode[0] : countryCode || "au"

  useEffect(() => {
    console.error("Cart route error boundary:", error)
    phCaptureException(error, { digest: error.digest, scope: "cart-error" })
  }, [error])

  return (
    <div className="content-container py-10" data-testid="cart-page-error">
      <div className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-rose-900">
        <p className="text-sm font-semibold">Something went wrong loading your cart.</p>
        <p className="mt-1 text-xs break-all">{error.message || "Unknown error"}</p>
        {error.digest ? <p className="mt-1 text-xs">Digest: {error.digest}</p> : null}
        <div className="mt-3 flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-rose-400 px-3 py-1.5 text-xs font-medium hover:bg-rose-100"
          >
            Try again
          </button>
          <LocalizedClientLink
            href="/store"
            className="text-xs underline text-rose-700 hover:text-rose-900"
          >
            Go shopping
          </LocalizedClientLink>
          {/* Emergency recovery — drops the cart cookie so the next request
              starts with a fresh empty cart. Used when the cart page can't
              render and the customer can't reach per-line delete buttons. */}
          <a
            href={`/${cc}/cart/clear?to=/${cc}/store`}
            className="ml-auto text-xs underline text-rose-700 hover:text-rose-900"
          >
            Start fresh cart (clears current cart)
          </a>
        </div>
      </div>
    </div>
  )
}
