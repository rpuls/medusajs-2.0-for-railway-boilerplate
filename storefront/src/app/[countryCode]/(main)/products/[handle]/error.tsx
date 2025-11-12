"use client"

import { useEffect } from "react"
import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Product page error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h2 className="text-2xl font-semibold mb-4">Something went wrong!</h2>
      <p className="text-text-secondary mb-6 text-center max-w-md">
        We couldn't load this product. Please try again or return to the store.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} variant="primary">
          Try again
        </Button>
        <LocalizedClientLink href="/store">
          <Button variant="secondary">Back to Store</Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

