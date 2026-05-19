"use client"

import { useState } from "react"

const ReceiptDownloadButton = ({ orderId }: { orderId: string }) => {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const download = () => {
    setError(null)
    setBusy(true)
    try {
      const link = document.createElement("a")
      link.href = `/api/orders/${encodeURIComponent(orderId)}/receipt-pdf`
      link.rel = "noopener"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      setError("Couldn't start the download. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-ui-border-base bg-white px-6 py-3 text-sm font-semibold text-[var(--brand-primary)] transition hover:bg-ui-bg-subtle disabled:opacity-60"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M8 2v8m0 0l3-3m-3 3L5 7" />
          <path d="M3 13h10" />
        </svg>
        Download receipt
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  )
}

export default ReceiptDownloadButton
