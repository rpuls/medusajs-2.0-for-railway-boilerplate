import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  inRange,
  itemMethod,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/embroidery-stitches
 *
 * For every embroidery line in the window, surface stitch-count
 * distribution + revenue per stitch tier. Tells the team whether
 * embroidery is dominated by simple low-stitch logos or larger
 * higher-margin designs, and lets pricing decisions trace back to
 * actual customer behaviour.
 *
 * Stitch-count source: line.metadata.decorationDesign.stitchCount
 * (set by the embroidery decoration pricing path on add-to-cart).
 *
 * Tiers mirror the embroidery pricing tiers in
 * storefront/src/modules/embroidery/lib/pricing.ts, with one extra
 * "very small" sub-tier so 0-1k stitches surface separately (those
 * are usually one-line text and are the lowest-margin per dollar
 * of fixed cost).
 */
const TIERS = [
  { label: "0-1k", min: 0, max: 1000 },
  { label: "1k-3k", min: 1001, max: 3000 },
  { label: "3k-5k", min: 3001, max: 5000 },
  { label: "5k-10k", min: 5001, max: 10000 },
  { label: "10k-20k", min: 10001, max: 20000 },
  { label: "20k+", min: 20001, max: Infinity },
] as const

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(
      `[embroidery-stitches] order fetch failed: ${err?.message ?? err}`
    )
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  type TierStat = {
    label: string
    min: number
    max: number
    lines: number
    units: number
    stitches: number
    revenue: number
  }
  const tiers: TierStat[] = TIERS.map((t) => ({
    label: t.label,
    min: t.min,
    max: t.max,
    lines: 0,
    units: 0,
    stitches: 0,
    revenue: 0,
  }))
  let totalLines = 0
  let totalUnits = 0
  let totalStitches = 0
  let totalRevenue = 0
  const stitchSamples: number[] = []

  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    if (!inRange(o?.created_at, from, to)) continue
    for (const it of (o?.items ?? []) as any[]) {
      if (itemMethod(it) !== "embroidery") continue
      const decorationDesign =
        ((it?.metadata ?? {}) as any)?.decorationDesign
      let stitchCount = 0
      if (typeof decorationDesign?.stitchCount === "number") {
        stitchCount = decorationDesign.stitchCount
      }
      if (!Number.isFinite(stitchCount) || stitchCount < 0) continue

      const qty = Number(it?.quantity ?? 0)
      const lineRevenue = Number(it?.unit_price ?? 0) * qty
      totalLines += 1
      totalUnits += qty
      totalStitches += stitchCount * qty
      totalRevenue += lineRevenue
      stitchSamples.push(stitchCount)

      const tier = tiers.find(
        (t) => stitchCount >= t.min && stitchCount <= t.max
      )
      if (tier) {
        tier.lines += 1
        tier.units += qty
        tier.stitches += stitchCount * qty
        tier.revenue += lineRevenue
      }
    }
  }

  const median = (() => {
    if (stitchSamples.length === 0) return 0
    const sorted = [...stitchSamples].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  })()

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    summary: {
      total_lines: totalLines,
      total_units: totalUnits,
      total_stitches: totalStitches,
      total_revenue: Math.round(totalRevenue * 100) / 100,
      avg_stitches_per_unit:
        totalUnits > 0 ? Math.round(totalStitches / totalUnits) : 0,
      median_stitches: Math.round(median),
      revenue_per_1k_stitches:
        totalStitches > 0
          ? Math.round((totalRevenue / (totalStitches / 1000)) * 100) / 100
          : 0,
    },
    tiers: tiers.map((t) => ({
      label: t.label,
      lines: t.lines,
      units: t.units,
      stitches: t.stitches,
      revenue: Math.round(t.revenue * 100) / 100,
      revenue_per_1k_stitches:
        t.stitches > 0
          ? Math.round((t.revenue / (t.stitches / 1000)) * 100) / 100
          : 0,
      lines_share_pct:
        totalLines > 0 ? Math.round((t.lines / totalLines) * 1000) / 10 : 0,
      revenue_share_pct:
        totalRevenue > 0
          ? Math.round((t.revenue / totalRevenue) * 1000) / 10
          : 0,
    })),
  })
}
