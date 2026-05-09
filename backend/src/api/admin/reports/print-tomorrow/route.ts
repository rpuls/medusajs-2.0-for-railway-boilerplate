import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  PRODUCTION_STAGES,
  STAGE_SLA_DAYS,
  type ProductionStage,
} from "../../../../lib/production-stage"
import {
  fetchOrdersForReports,
  itemMethod,
  matchesRegion,
  parseRegionFilter,
  type DecorationMethod,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/print-tomorrow?format=html
 *
 * Floor-ready cheat sheet of every order projected to ship in the next
 * 24-72h, grouped by decoration method, sorted by ship date. Returns
 * either JSON (default) for in-app rendering, or a print-styled HTML
 * page (`?format=html`) the operator can open and Cmd+P from the
 * Production page button. Beats the current "screenshot the kanban"
 * workflow.
 *
 * Window defaults to "ships in next 48h" — pass `?days=N` to widen.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)
  const days = (() => {
    const raw = Number(req.query.days)
    if (Number.isFinite(raw) && raw > 0 && raw <= 14) return Math.floor(raw)
    return 2
  })()
  const format = req.query.format === "html" ? "html" : "json"

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(
      `[print-tomorrow] order fetch failed: ${err?.message ?? err}`
    )
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  type Item = {
    title: string
    quantity: number
    method: DecorationMethod
    metadata: any
  }
  type Row = {
    order_id: string
    display_id: number | null
    customer_email: string | null
    customer_name: string | null
    current_stage: ProductionStage
    days_at_stage: number
    work_days_remaining: number
    projected_ship_at: string
    items: Item[]
    notes: string | null
    methods_summary: DecorationMethod[]
  }

  const now = Date.now()
  const cutoffMs = now + days * 86_400_000

  const open: Row[] = []
  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    const meta = (o?.metadata ?? {}) as Record<string, unknown>
    const stage = meta.production_stage as ProductionStage | undefined
    if (!stage || stage === "delivered" || stage === "shipped") continue
    if (!(PRODUCTION_STAGES as readonly string[]).includes(stage)) continue
    const rawHistory = meta.production_stage_history
    let enteredCurrentMs: number | null = null
    if (Array.isArray(rawHistory)) {
      const reversed = [...rawHistory].reverse()
      const last = reversed.find((e: any) => e?.stage === stage)
      if (last && typeof (last as any).changed_at === "string") {
        const t = Date.parse((last as any).changed_at)
        if (Number.isFinite(t)) enteredCurrentMs = t
      }
    }
    const daysAtCurrent =
      enteredCurrentMs != null
        ? Math.max(0, (now - enteredCurrentMs) / 86_400_000)
        : 0
    const currentSla = STAGE_SLA_DAYS[stage] ?? 0
    let workDaysRemaining = Math.max(0, currentSla - daysAtCurrent)
    const idx = PRODUCTION_STAGES.indexOf(stage)
    for (let i = idx + 1; i < PRODUCTION_STAGES.length; i++) {
      const s = PRODUCTION_STAGES[i]
      if (s === "delivered" || s === "shipped") continue
      const sla = STAGE_SLA_DAYS[s]
      if (sla != null) workDaysRemaining += sla
    }
    const projectedShipMs = now + workDaysRemaining * 86_400_000
    if (projectedShipMs > cutoffMs) continue

    const items: Item[] = ((o.items ?? []) as any[]).map((it) => ({
      title:
        (typeof it?.product_title === "string" && it.product_title) ||
        (typeof it?.title === "string" && it.title) ||
        "(unknown)",
      quantity: Number(it?.quantity ?? 0),
      method: itemMethod(it),
      metadata: it?.metadata ?? null,
    }))

    open.push({
      order_id: o.id,
      display_id: typeof o.display_id === "number" ? o.display_id : null,
      customer_email: typeof o.email === "string" ? o.email : null,
      customer_name: o?.shipping_address?.first_name
        ? `${o.shipping_address.first_name} ${o.shipping_address.last_name ?? ""}`.trim()
        : null,
      current_stage: stage,
      days_at_stage: Math.round(daysAtCurrent * 10) / 10,
      work_days_remaining: Math.round(workDaysRemaining * 10) / 10,
      projected_ship_at: new Date(projectedShipMs).toISOString(),
      items,
      notes:
        typeof (meta as any).production_note === "string"
          ? (meta as any).production_note
          : null,
      methods_summary: Array.from(new Set(items.map((i) => i.method))),
    })
  }

  open.sort(
    (a, b) =>
      Date.parse(a.projected_ship_at) - Date.parse(b.projected_ship_at)
  )

  // Group by primary decoration method (first one found)
  const groups = new Map<DecorationMethod, Row[]>()
  for (const r of open) {
    const primary = r.methods_summary[0] ?? "blank"
    const arr = groups.get(primary) ?? []
    arr.push(r)
    groups.set(primary, arr)
  }

  if (format !== "html") {
    return res.json({
      generated_at: new Date().toISOString(),
      window_days: days,
      total_orders: open.length,
      groups: Array.from(groups.entries()).map(([method, rows]) => ({
        method,
        count: rows.length,
        rows,
      })),
    })
  }

  // ---- HTML format ----
  const stageLabel = (s: string): string =>
    s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  const escape = (s: string): string =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")

  const today = new Date()
  const generated = today.toLocaleString("en-AU", {
    timeZone: "Australia/Sydney",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })

  const sections = Array.from(groups.entries()).map(([method, rows]) => {
    const totalUnits = rows.reduce(
      (s, r) =>
        s + r.items.filter((i) => i.method === method).reduce((s2, i) => s2 + i.quantity, 0),
      0
    )
    const rowsHtml = rows
      .map((r) => {
        const itemsHtml = r.items
          .map(
            (i) =>
              `<li>${escape(i.title)} <strong>×${i.quantity}</strong> <span class="meth">[${escape(i.method)}]</span></li>`
          )
          .join("")
        return `
          <tr>
            <td class="ord">${r.display_id != null ? `#${r.display_id}` : escape(r.order_id.slice(0, 8))}</td>
            <td class="cust">
              ${r.customer_name ? `<strong>${escape(r.customer_name)}</strong><br/>` : ""}
              <span class="email">${escape(r.customer_email ?? "")}</span>
            </td>
            <td class="stage">
              ${escape(stageLabel(r.current_stage))}<br/>
              <span class="dim">${r.days_at_stage}d at stage</span>
            </td>
            <td class="ship">
              ${new Date(r.projected_ship_at).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}<br/>
              <span class="dim">${r.work_days_remaining}d work left</span>
            </td>
            <td class="items"><ul>${itemsHtml}</ul>${r.notes ? `<p class="note">${escape(r.notes)}</p>` : ""}</td>
          </tr>`
      })
      .join("")
    return `
      <section>
        <h2>${escape(stageLabel(method))} <span class="dim">— ${rows.length} order${rows.length === 1 ? "" : "s"}, ${totalUnits} unit${totalUnits === 1 ? "" : "s"}</span></h2>
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Stage</th>
              <th>Projected ship</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </section>`
  }).join("")

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Print tomorrow — ${generated}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111; padding: 24px; }
    h1 { margin: 0 0 4px; font-size: 22px; }
    .lead { color: #666; margin-top: 0; font-size: 13px; }
    h2 { font-size: 16px; margin: 24px 0 6px; padding-bottom: 4px; border-bottom: 1px solid #d4d4d4; }
    h2 .dim { color: #888; font-weight: 400; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
    th { background: #f6f6f6; font-weight: 600; }
    td.ord { font-family: ui-monospace, "SF Mono", monospace; font-weight: 600; width: 80px; }
    td.cust { width: 180px; }
    td.cust .email { color: #888; font-size: 11px; }
    td.stage, td.ship { width: 110px; }
    .dim { color: #888; font-size: 10px; }
    td.items ul { margin: 0; padding-left: 16px; }
    td.items .meth { color: #888; font-size: 10px; }
    td.items .note { background: #fffbe6; border-left: 2px solid #d97706; padding: 4px 8px; margin-top: 4px; font-size: 11px; }
    @media print {
      body { padding: 0; }
      h2 { page-break-after: avoid; }
      tr { page-break-inside: avoid; }
    }
    @page { margin: 12mm; }
  </style>
</head>
<body>
  <h1>SC Prints — Print tomorrow</h1>
  <p class="lead">Generated ${escape(generated)} · ${open.length} order${open.length === 1 ? "" : "s"} projected to ship within ${days} day${days === 1 ? "" : "s"}.</p>
  ${sections || "<p>No orders projected to ship in this window.</p>"}
  <script>
    // Auto-trigger print dialog after a short delay so the operator
    // sees the document then can confirm.
    setTimeout(() => { try { window.print() } catch {} }, 400)
  </script>
</body>
</html>`

  res.setHeader("content-type", "text/html; charset=utf-8")
  return res.send(html)
}
