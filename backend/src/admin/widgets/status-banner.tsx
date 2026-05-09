import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { PALETTE } from "../lib/reports/palette"

type Banner = {
  id: string
  body: string
  severity: "info" | "warning" | "critical"
  expires_at: string | null
  created_by: string | null
  created_at: string
}

const SEVERITY_BG: Record<Banner["severity"], string> = {
  info: "rgba(15,118,110,0.10)",
  warning: "rgba(217,119,6,0.10)",
  critical: "rgba(220,38,38,0.12)",
}

const SEVERITY_BORDER: Record<Banner["severity"], string> = {
  info: PALETTE.teal700,
  warning: PALETTE.amber600,
  critical: PALETTE.rose600,
}

const SEVERITY_LABEL: Record<Banner["severity"], string> = {
  info: "INFO",
  warning: "HEADS UP",
  critical: "OUTAGE",
}

const STORAGE_DISMISSED = "sc:status_banner_dismissed_id"

const StatusBannerWidget = () => {
  const [banner, setBanner] = useState<Banner | null>(null)
  const [dismissed, setDismissed] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const d = localStorage.getItem(STORAGE_DISMISSED)
      if (d) setDismissed(d)
    } catch {
      /* ignore */
    }
    let cancelled = false
    const fetchBanner = async () => {
      try {
        const r = await fetch(`/admin/admin-workspace/status-banner`, {
          credentials: "include",
        })
        if (!r.ok) return
        const j = await r.json()
        if (cancelled) return
        setBanner((j?.banner as Banner) ?? null)
      } catch {
        /* ignore */
      }
    }
    fetchBanner()
    const interval = setInterval(fetchBanner, 60_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  if (!banner) return null
  if (dismissed === banner.id) return null

  return (
    <div
      style={{
        background: SEVERITY_BG[banner.severity],
        borderLeft: `3px solid ${SEVERITY_BORDER[banner.severity]}`,
        padding: "10px 14px",
        margin: "0 0 12px",
        borderRadius: 4,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
      role="status"
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: SEVERITY_BORDER[banner.severity],
          paddingTop: 2,
        }}
      >
        {SEVERITY_LABEL[banner.severity]}
      </span>
      <Text size="small" className="flex-1">
        {banner.body}
      </Text>
      <button
        type="button"
        onClick={() => {
          setDismissed(banner.id)
          try {
            localStorage.setItem(STORAGE_DISMISSED, banner.id)
          } catch {
            /* ignore */
          }
        }}
        className="text-ui-fg-muted hover:text-ui-fg-base"
        aria-label="Dismiss banner"
      >
        ×
      </button>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default StatusBannerWidget
