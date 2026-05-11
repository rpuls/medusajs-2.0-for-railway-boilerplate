"use client"

import { useEffect } from "react"
import { phCaptureException } from "@lib/posthog"

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProductPageError({ error, reset }: Props) {
  useEffect(() => {
    console.error("PDP route error boundary:", error)
    phCaptureException(error, { digest: error.digest, scope: "pdp-error" })
  }, [error])

  return (
    <div className="content-container py-10" data-testid="product-page-error">
      <div className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-rose-900">
        <p className="text-sm font-semibold">Product page failed to render.</p>
        <p className="mt-1 text-xs break-all">{error.message || "Unknown error"}</p>
        {error.digest ? <p className="mt-1 text-xs">Digest: {error.digest}</p> : null}
        <button
          type="button"
          onClick={reset}
          className="mt-3 rounded-md border border-rose-400 px-3 py-1.5 text-xs font-medium hover:bg-rose-100"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
