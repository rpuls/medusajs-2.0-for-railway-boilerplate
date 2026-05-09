import { Text, Tooltip } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { PALETTE } from "../../lib/reports/palette"

type Status = "ok" | "degraded" | "down" | "unset"

type Check = {
  service: string
  status: Status
  latency_ms: number | null
  detail?: string | null
}

type Response = {
  overall: Status
  checked_at: string
  services: Check[]
}

const STATUS_COLOR: Record<Status, string> = {
  ok: PALETTE.emerald600,
  degraded: PALETTE.amber600,
  down: PALETTE.rose600,
  unset: PALETTE.stone400,
}

const STATUS_LABEL: Record<Status, string> = {
  ok: "All systems healthy",
  degraded: "Degraded",
  down: "Outage detected",
  unset: "Not configured",
}

export const SystemHealthPill = () => {
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/admin/reports/system-health`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled) return
        if (j) setData(j as Response)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tick])

  // Re-check every 60s
  useEffect(() => {
    const interval = setInterval(() => setTick((n) => n + 1), 60_000)
    return () => clearInterval(interval)
  }, [])

  const status = data?.overall ?? (loading ? "unset" : "down")
  const tooltipBody = (
    <div className="flex flex-col gap-y-0.5">
      <Text size="xsmall" className="font-medium">
        {STATUS_LABEL[status]}
      </Text>
      {data?.services.map((s) => (
        <div key={s.service} className="flex items-center gap-x-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: STATUS_COLOR[s.status] }}
          />
          <Text size="xsmall">
            {s.service}
            {s.latency_ms !== null ? ` · ${s.latency_ms}ms` : ""}
            {s.detail ? ` · ${s.detail}` : ""}
          </Text>
        </div>
      ))}
      {data?.checked_at ? (
        <Text size="xsmall" className="text-ui-fg-muted mt-1">
          Checked {new Date(data.checked_at).toLocaleTimeString("en-AU")}
        </Text>
      ) : null}
    </div>
  )

  return (
    <Tooltip content={tooltipBody} side="bottom">
      <span
        className="inline-flex items-center gap-x-1.5 px-2 py-1 rounded-md cursor-help"
        style={{
          background:
            status === "ok"
              ? "rgba(5,150,105,0.08)"
              : status === "degraded"
                ? "rgba(217,119,6,0.10)"
                : status === "down"
                  ? "rgba(220,38,38,0.10)"
                  : "rgba(168,162,158,0.10)",
          border: `1px solid ${STATUS_COLOR[status]}33`,
        }}
        aria-label={`System status: ${STATUS_LABEL[status]}`}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{
            background: STATUS_COLOR[status],
            boxShadow:
              status === "down" || status === "degraded"
                ? `0 0 0 3px ${STATUS_COLOR[status]}33`
                : undefined,
          }}
        />
        <Text size="xsmall" className="font-medium">
          {status === "ok"
            ? "Systems healthy"
            : status === "degraded"
              ? "Degraded"
              : status === "down"
                ? "Outage"
                : "Status unknown"}
        </Text>
      </span>
    </Tooltip>
  )
}
