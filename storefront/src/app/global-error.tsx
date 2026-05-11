"use client"

import { useEffect } from "react"

import { phCaptureException } from "@lib/posthog"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    phCaptureException(error, { digest: error.digest, scope: "global-error" })
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#EEEEEE",
          color: "#111",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
            Something went wrong
          </h1>
          <p style={{ marginBottom: "1.5rem", opacity: 0.75 }}>
            We&apos;ve been notified and are looking into it. You can try again,
            or head back to the homepage.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: 999,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
