"use client"

import { useState } from "react"

const InvoiceDownloadButton = ({ orderId }: { orderId: string }) => {
  const [error, setError] = useState<string | null>(null)

  const open = () => {
    setError(null)
    const w = window.open(
      `/api/orders/${encodeURIComponent(orderId)}/invoice`,
      "_blank",
      "width=900,height=1100"
    )
    if (!w) {
      setError("Pop-up blocked. Allow pop-ups for this site and try again.")
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={open}
        className="inline-flex items-center justify-center rounded-md border border-ui-border-base bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-primary)] hover:bg-ui-bg-subtle"
      >
        Tax invoice
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  )
}

export default InvoiceDownloadButton
