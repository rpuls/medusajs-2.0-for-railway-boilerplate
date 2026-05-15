"use client"

import { useState, useTransition } from "react"

import { MEDUSA_BACKEND_URL } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"

const InvoiceDownloadButton = ({ orderId }: { orderId: string }) => {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const open = () => {
    startTransition(async () => {
      try {
        setError(null)
        const headers = (await getAuthHeaders()) as Record<string, string>
        const res = await fetch(
          `${MEDUSA_BACKEND_URL}/store/customers/me/orders/${encodeURIComponent(orderId)}/invoice`,
          { headers, credentials: "include" }
        )
        if (!res.ok) throw new Error(`Server returned ${res.status}`)
        const html = await res.text()
        const w = window.open("", "_blank", "width=900,height=1100")
        if (!w) {
          throw new Error(
            "Pop-up blocked. Allow pop-ups for this site and try again."
          )
        }
        w.document.open()
        w.document.write(html)
        w.document.close()
      } catch (err: any) {
        setError(err?.message ?? "Couldn't open the invoice. Try again?")
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={open}
        disabled={pending}
        className="inline-flex items-center justify-center rounded-md border border-ui-border-base bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-primary)] hover:bg-ui-bg-subtle disabled:opacity-60"
      >
        {pending ? "Preparing…" : "Tax invoice"}
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  )
}

export default InvoiceDownloadButton
